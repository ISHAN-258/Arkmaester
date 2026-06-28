import { useState, useRef, useCallback, useEffect } from "react";
import {
  loadMediaPipe, inferPose, parsePoseResult,
  loadObjectron, inferObjectron, parseObjectronResult,
  analyzeFrameFallback, isMpReady, isMpFailed, isObjReady,
} from "../utils/mediapipe.js";
import { sfxWarn } from "../utils/audio.js";

// ── Constants ─────────────────────────────────────────────────────────────
const SNAP_INTERVAL_MS   = 3000;
const ALERT_COOLDOWN_MS  = 6000;
const CONSEC_THRESHOLD   = 2;
const SMOOTH_WINDOW      = 5;
const CALIBRATION_FRAMES = 8;

/**
 * Rolling average — smooths jittery per-frame values.
 */
class RollingAvg {
  constructor(size) { this.size = size; this.buf = []; }
  push(v)  { this.buf.push(v); if (this.buf.length > this.size) this.buf.shift(); }
  get avg() { return this.buf.length ? this.buf.reduce((a,b)=>a+b,0)/this.buf.length : null; }
  reset()  { this.buf = []; }
}

export function usePoseDetection({ onDistraction } = {}) {
  // DOM refs
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const infCanvas   = useRef(null);
  const fbCanvas    = useRef(null);

  // Loop refs
  const intervalRef = useRef(null);
  const elapsedRef  = useRef(null);
  const lastAlertTs = useRef(0);
  const consecutive = useRef({ slouch:0, phone:0, noface:0 });

  // Calibration
  const calibFrames = useRef([]);
  const baseline    = useRef(null);
  const calibrating = useRef(false);

  // Smoothing
  const postureAvg  = useRef(new RollingAvg(SMOOTH_WINDOW));
  const focusAvg    = useRef(new RollingAvg(SMOOTH_WINDOW));
  const phoneAvg    = useRef(new RollingAvg(3)); // shorter window for phone

  // State
  const [active,        setActive]        = useState(false);
  const [err,           setErr]           = useState("");
  const [modelStatus,   setModelStatus]   = useState("idle");
  const [objectronStatus, setObjectronStatus] = useState("idle");
  const [met,           setMet]           = useState({
    f:0, p:0, found:false,
    phoneScore:0, phoneDetected:false,
    calibrated:false, calibProgress:0,
    earSymmetry:null,
  });
  const [alert,         setAlert]         = useState(null);
  const [log,           setLog]           = useState([]);
  const [elapsed,       setElapsed]       = useState(0);
  const [fb,            setFb]            = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────
  const addLog = useCallback((type, msg) => {
    const ts = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" });
    setLog((l) => [{ type, msg, ts }, ...l].slice(0, 25));
  }, []);

  const triggerAlert = useCallback((type, msg, distractionType) => {
    const now = Date.now();
    if (now - lastAlertTs.current < ALERT_COOLDOWN_MS) return;
    lastAlertTs.current = now;
    sfxWarn();
    setAlert({ type, msg });
    addLog(type, msg);
    if (distractionType) onDistraction?.({ type: distractionType, ts: now });
  }, [addLog, onDistraction]);

  // ── Core snapshot ─────────────────────────────────────────────────────
  const runSnapshot = useCallback(async () => {
    const v = videoRef.current;
    if (!v || v.readyState < 2 || !v.videoWidth) return;

    // Lazy-init canvases
    if (!infCanvas.current) infCanvas.current = document.createElement("canvas");
    if (!fbCanvas.current)  fbCanvas.current  = document.createElement("canvas");

    // Draw current frame to canvas
    const w = v.videoWidth, h = v.videoHeight;
    infCanvas.current.width = w; infCanvas.current.height = h;
    infCanvas.current.getContext("2d").drawImage(v, 0, 0, w, h);

    // ── BlazePose inference ──────────────────────────────────────────
    let poseRaw;
    if (isMpReady() && !isMpFailed()) {
      try {
        poseRaw = parsePoseResult(await inferPose(infCanvas.current), w, h);
      } catch {
        poseRaw = analyzeFrameFallback(v, fbCanvas.current);
      }
    } else {
      poseRaw = analyzeFrameFallback(v, fbCanvas.current);
    }

    // ── Objectron phone inference (runs in parallel if ready) ────────
    let objPhoneScore = 0;
    if (isObjReady()) {
      try {
        const objResult = await inferObjectron(infCanvas.current);
        const parsed    = parseObjectronResult(objResult);
        objPhoneScore   = parsed.phoneScore;
        if (parsed.phoneDetected)
          addLog("warn", `📱 Objectron: phone detected (${objPhoneScore}% confidence)`);
      } catch { /* objectron fail = silent */ }
    }

    // ── Fuse phone scores (Objectron wins if available) ───────────────
    // Objectron is the primary signal; BlazePose wrist is secondary
    const fusedPhoneScore = isObjReady()
      ? Math.round(objPhoneScore * 0.65 + (poseRaw.phoneScore ?? 0) * 0.35)
      : (poseRaw.phoneScore ?? 0);

    phoneAvg.current.push(fusedPhoneScore);
    const smoothPhone = Math.round(phoneAvg.current.avg ?? fusedPhoneScore);
    const phoneDetected = smoothPhone >= 50;

    // ── No face found ────────────────────────────────────────────────
    if (!poseRaw.found) {
      consecutive.current.slouch = 0;
      consecutive.current.phone  = 0;
      consecutive.current.noface++;
      postureAvg.current.push(0);
      focusAvg.current.push(0);
      setFb(null);
      setMet((m) => ({ ...m, found:false, f:0, p:0, phoneScore:smoothPhone, phoneDetected, calibProgress: m.calibProgress }));
      if (consecutive.current.noface >= CONSEC_THRESHOLD)
        triggerAlert("bad", "👁 Arkmaester can't detect you — are you still there?", null);
      return;
    }

    consecutive.current.noface = 0;

    // ── Calibration phase ────────────────────────────────────────────
    if (calibrating.current && !baseline.current) {
      const ratio = poseRaw._calibRatio ?? poseRaw.postScore / 100;
      calibFrames.current.push(ratio);
      const prog = Math.min(100, Math.round((calibFrames.current.length / CALIBRATION_FRAMES) * 100));
      setMet((m) => ({ ...m, found:true, calibrated:false, calibProgress:prog }));

      if (calibFrames.current.length >= CALIBRATION_FRAMES) {
        baseline.current = calibFrames.current.reduce((a,b)=>a+b,0) / calibFrames.current.length;
        calibrating.current = false;
        setIsCalibrating(false);
        addLog("good", `✅ Baseline set (ratio: ${baseline.current.toFixed(3)})`);
        setAlert({ type:"good", msg:"✅ Baseline calibrated! Arkmaester now knows your posture." });
      }
      return;
    }

    // ── Adaptive posture score ────────────────────────────────────────
    let postScore = poseRaw.postScore;
    if (baseline.current) {
      const ratio = poseRaw._calibRatio ?? poseRaw.postScore / 100;
      postScore   = Math.round(Math.min(100, Math.max(0, (ratio / baseline.current) * 100)));
    }

    // ── Focus score — ear symmetry ────────────────────────────────────
    const focScore = poseRaw.focScore; // already computed in parsePoseResult

    // Push to rolling averages
    postureAvg.current.push(postScore);
    focusAvg.current.push(focScore);
    const smoothPost = Math.round(postureAvg.current.avg ?? postScore);
    const smoothFoc  = Math.round(focusAvg.current.avg  ?? focScore);

    // Update UI state
    setFb(poseRaw.faceBox ?? null);
    setMet({
      f: smoothFoc,
      p: smoothPost,
      found: true,
      phoneScore: smoothPhone,
      phoneDetected,
      calibrated:     !!baseline.current,
      calibProgress:  100,
      angleDeg:       poseRaw.shoulderAngleDeg,
      earSymmetry:    poseRaw._earSymmetry,
    });

    // ── Alert logic ───────────────────────────────────────────────────
    if (phoneDetected) {
      consecutive.current.phone++;
      consecutive.current.slouch = 0;
      if (consecutive.current.phone >= CONSEC_THRESHOLD)
        triggerAlert("bad", `📵 Phone detected (${smoothPhone}% confidence) — Arkmaester says focus!`, "phone");
    } else if (smoothPost < (baseline.current ? 65 : 50)) {
      consecutive.current.slouch++;
      consecutive.current.phone = 0;
      if (consecutive.current.slouch >= CONSEC_THRESHOLD)
        triggerAlert("warn", `🧍 Posture drop (${smoothPost}%) — sit upright!`, "posture");
    } else if (smoothFoc < 50) {
      consecutive.current.slouch = 0;
      consecutive.current.phone  = 0;
      triggerAlert("warn", `👁 Focus drift detected (ear symmetry: ${poseRaw._earSymmetry?.toFixed(2) ?? "—"}) — re-centre!`, "focus");
    } else {
      consecutive.current.slouch = 0;
      consecutive.current.phone  = 0;
      const now = Date.now();
      if (smoothPost >= 80 && smoothFoc >= 75 && now - lastAlertTs.current > 12000) {
        lastAlertTs.current = now;
        setAlert({ type:"good", msg:`✅ Great posture (${smoothPost}%) & focus (${smoothFoc}%) — Arkmaester approves!` });
      }
    }
  }, [triggerAlert, addLog]);

  // ── Start ──────────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode:"user", width:{ ideal:640 }, height:{ ideal:480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Reset everything
      setActive(true);
      setLog([]);
      setElapsed(0);
      setAlert({ type:"good", msg:"📷 Camera active — sit upright for baseline calibration…" });
      consecutive.current = { slouch:0, phone:0, noface:0 };
      postureAvg.current.reset();
      focusAvg.current.reset();
      phoneAvg.current.reset();
      calibFrames.current  = [];
      baseline.current     = null;
      calibrating.current  = true;
      lastAlertTs.current  = 0;
      setIsCalibrating(true);
      addLog("good", "Session started — calibrating baseline posture");

      // Load BlazePose
      if (!isMpReady() && !isMpFailed()) {
        setModelStatus("loading");
        loadMediaPipe(
          () => { setModelStatus("ready");    addLog("good", "BlazePose ready ✓"); },
          () => { setModelStatus("fallback"); addLog("warn", "BlazePose unavailable — fallback active"); }
        );
      } else {
        setModelStatus(isMpReady() ? "ready" : "fallback");
      }

      // Load Objectron (phone detection) — non-blocking
      if (!isObjReady() && !objFailed()) {
        setObjectronStatus("loading");
        loadObjectron(
          () => { setObjectronStatus("ready"); addLog("good", "Objectron phone detector ready ✓"); },
          () => { setObjectronStatus("fallback"); addLog("warn", "Objectron unavailable — using wrist fallback"); }
        );
      }

      intervalRef.current = setInterval(runSnapshot, SNAP_INTERVAL_MS);
      setTimeout(runSnapshot, 1200);
      elapsedRef.current  = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch (e) {
      setErr(
        e.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access and try again."
          : `Camera error: ${e.message}`
      );
    }
  }, [addLog, runSnapshot]);

  // ── Stop ───────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    clearInterval(intervalRef.current);
    clearInterval(elapsedRef.current);
    intervalRef.current = null;
    elapsedRef.current  = null;
    calibrating.current = false;
    calibFrames.current = [];
    postureAvg.current.reset();
    focusAvg.current.reset();
    phoneAvg.current.reset();
    setActive(false);
    setAlert(null);
    setFb(null);
    setElapsed(0);
    setIsCalibrating(false);
    setMet({ f:0, p:0, found:false, phoneScore:0, phoneDetected:false, calibrated:false, calibProgress:0, earSymmetry:null });
    addLog("warn", "Session ended");
  }, [addLog]);

  // ── Recalibrate ────────────────────────────────────────────────────────
  const recalibrate = useCallback(() => {
    calibFrames.current  = [];
    baseline.current     = null;
    calibrating.current  = true;
    postureAvg.current.reset();
    focusAvg.current.reset();
    setIsCalibrating(true);
    addLog("good", "Recalibrating — hold your best posture for a few seconds…");
    setAlert({ type:"good", msg:"🔄 Recalibrating baseline — sit perfectly upright." });
  }, [addLog]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    clearInterval(intervalRef.current);
    clearInterval(elapsedRef.current);
  }, []);

  return {
    videoRef,
    active, start, stop, recalibrate,
    met, alert, log, elapsed, fb,
    modelStatus, objectronStatus, err, isCalibrating,
  };
}

// internal helper — avoids importing objFailed from mediapipe
function objFailed() {
  try { return !window.__mp_obj_loaded && document.querySelector('script[src*="objectron"]') !== null; }
  catch { return false; }
}
