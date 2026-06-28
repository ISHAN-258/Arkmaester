// ── MediaPipe — BlazePose + Objectron (phone detection) ───────────────────

// ── Singleton state ───────────────────────────────────────────────────────
let mpPose      = null;
let poseReady   = false;
let poseFailed  = false;
let poseLoading = false;

let mpObjectron  = null;
let objReady     = false;
let objFailed    = false;
let objLoading   = false;

export const isMpReady  = () => poseReady;
export const isMpFailed = () => poseFailed;
export const isObjReady = () => objReady;

// ── BlazePose loader ──────────────────────────────────────────────────────
export async function loadMediaPipe(onReady, onFail) {
  if (poseReady)   { onReady(); return; }
  if (poseFailed)  { onFail();  return; }
  if (poseLoading) return;
  poseLoading = true;

  try {
    await loadScript(
      "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js",
      "__mp_pose_loaded"
    );

    const PoseClass = window.Pose;
    if (!PoseClass) throw new Error("window.Pose not found");

    mpPose = new PoseClass({
      locateFile: (f) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}`,
    });
    mpPose.setOptions({
      modelComplexity:        0,
      smoothLandmarks:        true,
      enableSegmentation:     false,
      minDetectionConfidence: 0.55,
      minTrackingConfidence:  0.55,
    });

    await Promise.race([
      new Promise((res) => {
        mpPose.onResults(() => {});
        mpPose.initialize().then(res).catch(res);
      }),
      new Promise((res) => setTimeout(res, 8000)),
    ]);

    poseReady   = true;
    poseLoading = false;
    onReady();
  } catch (e) {
    console.warn("BlazePose load failed:", e);
    poseFailed  = true;
    poseLoading = false;
    onFail();
  }
}

// ── Objectron loader (phone detection) ───────────────────────────────────
export async function loadObjectron(onReady, onFail) {
  if (objReady)   { onReady(); return; }
  if (objFailed)  { onFail();  return; }
  if (objLoading) return;
  objLoading = true;

  try {
    await loadScript(
      "https://cdn.jsdelivr.net/npm/@mediapipe/objectron@0.4.1633465105/objectron.js",
      "__mp_obj_loaded"
    );

    const ObjClass = window.Objectron;
    if (!ObjClass) throw new Error("window.Objectron not found");

    mpObjectron = new ObjClass({
      locateFile: (f) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/objectron@0.4.1633465105/${f}`,
    });
    mpObjectron.setOptions({
      modelName:             "Phone",
      maxNumObjects:         2,
      minDetectionConfidence: 0.4,
      minTrackingConfidence:  0.4,
    });

    await Promise.race([
      new Promise((res) => {
        mpObjectron.onResults(() => {});
        mpObjectron.initialize().then(res).catch(res);
      }),
      new Promise((res) => setTimeout(res, 8000)),
    ]);

    objReady   = true;
    objLoading = false;
    onReady();
  } catch (e) {
    console.warn("Objectron load failed — using fallback:", e);
    objFailed  = true;
    objLoading = false;
    onFail();
  }
}

// ── Objectron inference ───────────────────────────────────────────────────
export function inferObjectron(canvasEl) {
  return new Promise((resolve) => {
    if (!mpObjectron || !objReady) { resolve(null); return; }

    let settled = false;
    const done  = (r) => { if (!settled) { settled = true; resolve(r); } };
    const timeout = setTimeout(() => { mpObjectron.onResults(() => {}); done(null); }, 3000);

    mpObjectron.onResults((results) => {
      clearTimeout(timeout);
      mpObjectron.onResults(() => {});
      done(results);
    });

    mpObjectron.send({ image: canvasEl }).catch(() => {
      clearTimeout(timeout);
      mpObjectron.onResults(() => {});
      done(null);
    });
  });
}

// ── BlazePose inference ───────────────────────────────────────────────────
export function inferPose(canvasEl) {
  return new Promise((resolve) => {
    if (!mpPose || !poseReady) { resolve(null); return; }

    let settled = false;
    const done  = (r) => { if (!settled) { settled = true; resolve(r); } };
    const timeout = setTimeout(() => { mpPose.onResults(() => {}); done(null); }, 3000);

    mpPose.onResults((results) => {
      clearTimeout(timeout);
      mpPose.onResults(() => {});
      done(results);
    });

    mpPose.send({ image: canvasEl }).catch(() => {
      clearTimeout(timeout);
      mpPose.onResults(() => {});
      done(null);
    });
  });
}

// ── Landmark indices ──────────────────────────────────────────────────────
const LM = {
  NOSE:       0,
  L_EAR:      7,  R_EAR:      8,
  L_SHOULDER: 11, R_SHOULDER: 12,
  L_ELBOW:    13, R_ELBOW:    14,
  L_WRIST:    15, R_WRIST:    16,
};

const MIN_VIS = 0.45;

// ── Parse BlazePose results ───────────────────────────────────────────────
export function parsePoseResult(results, vidW, vidH) {
  const FAIL = {
    found:false, postScore:0, focScore:0,
    isSlouching:false, phoneScore:0, phoneDetected:false,
    shoulderAngleDeg:null, faceBox:null, _calibRatio:null,
    _earSymmetry:null,
  };

  const lm = results?.poseLandmarks;
  if (!lm || lm.length < 17) return FAIL;

  const nose = lm[LM.NOSE];
  const ls   = lm[LM.L_SHOULDER];
  const rs   = lm[LM.R_SHOULDER];
  const le   = lm[LM.L_ELBOW];
  const re   = lm[LM.R_ELBOW];
  const lw   = lm[LM.L_WRIST];
  const rw   = lm[LM.R_WRIST];
  const lear = lm[LM.L_EAR];
  const rear = lm[LM.R_EAR];

  if (!nose || !ls || !rs) return FAIL;
  if ((ls.visibility ?? 1) < MIN_VIS || (rs.visibility ?? 1) < MIN_VIS) return FAIL;

  // ── Posture ───────────────────────────────────────────────────────────
  const shoulderMidX  = (ls.x + rs.x) / 2;
  const shoulderWidth = Math.abs(rs.x - ls.x);
  if (shoulderWidth < 0.04) return FAIL;

  const noseToShoulderDelta = ((ls.y + rs.y) / 2) - nose.y;
  const calibRatio  = noseToShoulderDelta / Math.max(0.01, shoulderWidth);
  const postScore   = Math.round(Math.min(100, Math.max(0, calibRatio * 80)));
  const shoulderAngleDeg = Math.round(Math.atan2(rs.y - ls.y, rs.x - ls.x) * (180 / Math.PI));

  // ── Focus — ear symmetry ──────────────────────────────────────────────
  // Both ears equally visible = facing forward = focused
  // One ear disappears = head turned = distracted
  const lEarVis = lear?.visibility ?? 0;
  const rEarVis = rear?.visibility ?? 0;
  const bothVisible = lEarVis > 0.2 && rEarVis > 0.2;

  let focScore;
  let earSymmetry = null;

  if (bothVisible) {
    // Symmetry ratio 0–1: 1.0 = perfectly symmetric (both same visibility)
    const maxVis = Math.max(lEarVis, rEarVis);
    const minVis = Math.min(lEarVis, rEarVis);
    earSymmetry  = minVis / maxVis; // 1.0 = symmetric, 0 = one ear invisible
    // Map to focus score: 100% symmetric = 100 focus, 0% = 40 focus
    focScore = Math.round(40 + earSymmetry * 60);
  } else {
    // Only one ear visible → head significantly turned
    const oneVisible = lEarVis > 0.2 || rEarVis > 0.2;
    focScore    = oneVisible ? 45 : 35; // penalise but don't bottom out
    earSymmetry = 0;
  }

  focScore = Math.max(20, Math.min(100, focScore));

  // ── Phone detection — multi-signal weighted score ─────────────────────
  // Signal 1: 2D distance from wrist to nose (both axes)
  const lwVis = lw?.visibility ?? 0;
  const rwVis = rw?.visibility ?? 0;

  let phoneScore = 0;

  // Signal 1 — wrist-to-nose euclidean distance (threshold: 0.22)
  if (lwVis > MIN_VIS) {
    const dL = Math.hypot((lw.x - nose.x), (lw.y - nose.y));
    if (dL < 0.22) phoneScore += 35;
  }
  if (rwVis > MIN_VIS) {
    const dR = Math.hypot((rw.x - nose.x), (rw.y - nose.y));
    if (dR < 0.22) phoneScore += 35;
  }

  // Signal 2 — wrist elevated above shoulder level
  const lShoulderY = ls.y;
  const rShoulderY = rs.y;
  if (lwVis > MIN_VIS && lw.y < lShoulderY + 0.08) phoneScore += 20;
  if (rwVis > MIN_VIS && rw.y < rShoulderY + 0.08) phoneScore += 20;

  // Signal 3 — elbow raised (bent upward toward face)
  const leVis = le?.visibility ?? 0;
  const reVis = re?.visibility ?? 0;
  if (leVis > MIN_VIS && le.y < ls.y + 0.05) phoneScore += 15;
  if (reVis > MIN_VIS && re.y < rs.y + 0.05) phoneScore += 15;

  // Cap at 100, threshold at 50 for detection
  phoneScore      = Math.min(100, phoneScore);
  const phoneDetected = phoneScore >= 50;

  // ── Face bounding box ──────────────────────────────────────────────────
  const faceBox = {
    l: Math.max(0, shoulderMidX - shoulderWidth * 0.65),
    t: Math.max(0, nose.y - shoulderWidth * 0.55),
    w: Math.min(1, shoulderWidth * 1.3),
    h: Math.min(1, shoulderWidth * 1.7),
  };

  return {
    found: true,
    postScore, focScore,
    isSlouching:    calibRatio < 0.6,
    phoneScore, phoneDetected,
    shoulderAngleDeg, faceBox,
    _calibRatio: calibRatio,
    _earSymmetry: earSymmetry,
    landmarks: lm,
  };
}

// ── Parse Objectron results ───────────────────────────────────────────────
export function parseObjectronResult(results) {
  const annotations = results?.detectedObjects ?? [];
  if (annotations.length === 0) return { phoneDetected: false, phoneScore: 0, boxes: [] };

  const boxes = annotations.map((obj) => ({
    score: obj.score ?? 0,
    // Objectron gives 2D bounding box in normalised coords
    rect: obj.boundingBox2d ?? null,
  }));

  const maxScore  = Math.max(...boxes.map((b) => b.score));
  const phoneScore     = Math.round(maxScore * 100);
  const phoneDetected  = phoneScore >= 40;

  return { phoneDetected, phoneScore, boxes };
}

// ── Skin-tone pixel fallback ──────────────────────────────────────────────
const FW = 80, FH = 60;

function isSkin(r, g, b) {
  return (
    r > 80 && g > 30 && b > 15 &&
    r >= g && r >= b &&
    Math.abs(r - g) > 8 && r - g < 100 &&
    !(r > 245 && g > 225)
  );
}

export function analyzeFrameFallback(video, cv) {
  if (!cv) return {
    found:false, postScore:0, focScore:0,
    isSlouching:false, phoneDetected:false, phoneScore:0,
    faceBox:null, _calibRatio:null, _earSymmetry:null,
  };

  const ctx = cv.getContext("2d", { willReadFrequently:true });
  cv.width = FW; cv.height = FH;
  ctx.drawImage(video, 0, 0, FW, FH);

  const { data } = ctx.getImageData(0, 0, FW, FH);
  let skinCount = 0, sx = 0, sy = 0;
  // Also track skin in upper corners (hand/phone near face heuristic)
  let topLeftSkin = 0, topRightSkin = 0;
  const total = FW * FH;

  for (let i = 0; i < total; i++) {
    const p = i * 4;
    const px = i % FW, py = Math.floor(i / FW);
    if (isSkin(data[p], data[p+1], data[p+2])) {
      skinCount++;
      sx += px; sy += py;
      // Count skin in top corners (phone-holding heuristic)
      if (py < FH * 0.35) {
        if (px < FW * 0.3)  topLeftSkin++;
        if (px > FW * 0.7)  topRightSkin++;
      }
    }
  }

  const found = skinCount / total > 0.03;
  if (!found) return {
    found:false, postScore:30, focScore:20,
    isSlouching:true, phoneDetected:false, phoneScore:0,
    faceBox:null, _calibRatio:null, _earSymmetry:null,
  };

  const hx  = sx / skinCount / FW;
  const hy  = sy / skinCount / FH;
  const postScore = Math.round(Math.max(20, Math.min(90, (1 - Math.max(0, hy - 0.3) * 3) * 100)));

  // Fallback focus: assume centred = focused
  const focScore = Math.round(Math.max(30, Math.min(85, (1 - Math.abs(hx - 0.5) * 2.2) * 100)));

  // Phone heuristic: significant skin blob in top corner not explained by face
  const faceSkinRatio = skinCount / total;
  const cornerSkin    = (topLeftSkin + topRightSkin) / skinCount;
  const phoneScore    = Math.round(Math.min(100, cornerSkin * 200));
  const phoneDetected = phoneScore >= 50 && faceSkinRatio < 0.25;

  return {
    found, postScore, focScore,
    isSlouching:    postScore < 55,
    phoneDetected, phoneScore,
    faceBox: { l:Math.max(0,hx-0.24), t:Math.max(0,hy-0.3), w:0.48, h:0.56 },
    _calibRatio: (1 - hy) * 0.8,
    _earSymmetry: null,
  };
}

// ── Internal helper ───────────────────────────────────────────────────────
function loadScript(src, flagKey) {
  return new Promise((res, rej) => {
    if (window[flagKey]) { res(); return; }
    const s = document.createElement("script");
    s.crossOrigin = "anonymous";
    s.src = src;
    s.onload  = () => { window[flagKey] = true; res(); };
    s.onerror = rej;
    document.head.appendChild(s);
  });
}
