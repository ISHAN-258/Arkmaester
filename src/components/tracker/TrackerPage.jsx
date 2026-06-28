import { useApp } from "../../context/AppContext.jsx";
import { usePoseDetection } from "../../hooks/usePoseDetection.js";
import { fmtTime } from "../../utils/helpers.js";

const scoreColor = (v) => v >= 75 ? "var(--green)" : v >= 50 ? "var(--amber)" : "var(--red)";

export default function TrackerPage() {
  const { addDistraction } = useApp();
  const {
    videoRef, active, start, stop, recalibrate,
    met, alert, log, elapsed, fb,
    modelStatus, objectronStatus, err, isCalibrating,
  } = usePoseDetection({ onDistraction: addDistraction });

  const postureScore = met.found ? met.p : 0;
  const focusScore   = met.found ? met.f : 0;
  const phoneScore   = met.phoneScore ?? 0;

  return (
    <div className="page">
      <div className="page-header">
        <div className="sl">// ARKMAESTER — FOCUS AI</div>
        <h2 className="page-title">Focus Tracker</h2>
        <p className="page-sub">
          Real-time posture + phone detection (MediaPipe BlazePose + Objectron).
          Sit upright during calibration.
        </p>
      </div>

      {err && <div className="ab bad" style={{ marginBottom:"1rem" }}>⚠ {err}</div>}

      {/* Calibration banner */}
      {active && isCalibrating && (
        <div className="nb" style={{ marginBottom:"1rem", background:"rgba(255,183,0,.08)", borderColor:"rgba(255,183,0,.3)", color:"var(--amber)", flexDirection:"column", alignItems:"flex-start" }}>
          <span>🔄 Calibrating baseline — sit in your best upright posture ({met.calibProgress ?? 0}%)</span>
          <div style={{ width:"100%", height:4, background:"rgba(255,183,0,.2)", borderRadius:2, marginTop:".45rem" }}>
            <div style={{ width:`${met.calibProgress ?? 0}%`, height:"100%", background:"var(--amber)", borderRadius:2, transition:"width .4s var(--ease)" }} />
          </div>
        </div>
      )}

      {active && met.calibrated && !isCalibrating && (
        <div className="nb" style={{ marginBottom:"1rem" }}>
          <span>✅ Baseline calibrated — Arkmaester is monitoring your posture</span>
          <button onClick={recalibrate}>🔄 Recalibrate</button>
        </div>
      )}

      <div className="tracker-layout">
        {/* Camera feed */}
        <div className="cam-card">
          <div className="cam-feed">
            <video ref={videoRef} playsInline muted style={{ display: active ? "block" : "none" }} />

            {/* Face bounding box */}
            {active && fb && (
              <div className="fbox" style={{
                left:`${fb.l*100}%`, top:`${fb.t*100}%`,
                width:`${fb.w*100}%`, height:`${fb.h*100}%`,
                borderColor: isCalibrating ? "var(--amber)"
                  : met.phoneDetected ? "var(--red)"
                  : postureScore >= 70 ? "var(--green)"
                  : postureScore >= 50 ? "var(--amber)"
                  : "var(--red)",
                boxShadow: met.phoneDetected ? "0 0 16px rgba(255,69,96,.4)" : "none",
              }} />
            )}

            {/* Phone detected overlay */}
            {active && met.phoneDetected && (
              <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", background:"rgba(255,69,96,.85)", color:"#fff", fontFamily:"var(--mono)", fontSize:".68rem", padding:".3rem .75rem", borderRadius:4, whiteSpace:"nowrap", animation:"pulse 1s infinite" }}>
                📵 PHONE DETECTED ({phoneScore}%)
              </div>
            )}

            {active && (
              <div className="cam-overlay">
                <div className="cc tl" /><div className="cc tr" />
                <div className="cc bl" /><div className="cc br" />
                {isCalibrating && (
                  <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", fontFamily:"var(--mono)", fontSize:".65rem", color:"var(--amber)", background:"rgba(0,0,0,.75)", padding:".28rem .65rem", borderRadius:4, whiteSpace:"nowrap" }}>
                    CALIBRATING {met.calibProgress ?? 0}%
                  </div>
                )}
              </div>
            )}

            {!active && (
              <div className="cam-ph">
                <div className="icon">📷</div>
                <span>Camera inactive</span>
                <span style={{ fontSize:".7rem", textAlign:"center", maxWidth:200 }}>
                  Sit upright before starting — Arkmaester will learn your baseline posture
                </span>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="cam-bar">
            <div style={{ display:"flex", alignItems:"center", gap:".4rem", fontSize:".72rem", flexWrap:"wrap" }}>
              <span className={`sdot${active ? (met.found ? " live" : " warn") : ""}`} />
              <span>
                {!active ? "Camera off"
                  : isCalibrating ? "Calibrating baseline…"
                  : met.found ? "Pose detected"
                  : "No pose found"}
              </span>
              {/* Model status badges */}
              {modelStatus === "loading"   && <span style={{ fontFamily:"var(--mono)", fontSize:".58rem", color:"var(--amber)" }}>BlazePose loading…</span>}
              {modelStatus === "ready"     && <span style={{ fontFamily:"var(--mono)", fontSize:".58rem", color:"var(--green)" }}>BlazePose ✓</span>}
              {modelStatus === "fallback"  && <span style={{ fontFamily:"var(--mono)", fontSize:".58rem", color:"var(--amber)" }}>Fallback mode</span>}
              {objectronStatus === "loading"  && <span style={{ fontFamily:"var(--mono)", fontSize:".58rem", color:"var(--amber)" }}>Objectron loading…</span>}
              {objectronStatus === "ready"    && <span style={{ fontFamily:"var(--mono)", fontSize:".58rem", color:"var(--green)" }}>Objectron ✓</span>}
              {objectronStatus === "fallback" && <span style={{ fontFamily:"var(--mono)", fontSize:".58rem", color:"var(--muted)" }}>Wrist fallback</span>}
            </div>
            <div style={{ display:"flex", gap:".4rem" }}>
              {active && met.calibrated && !isCalibrating && (
                <button className="bsm" onClick={recalibrate}>🔄 Recal</button>
              )}
              {active
                ? <button className="cb stop" onClick={stop}>■ Stop</button>
                : <button className="cb" onClick={start}>▶ Start</button>
              }
            </div>
          </div>
        </div>

        {/* Metrics panel */}
        <div className="met-card">
          {/* Elapsed */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:".62rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"1.5px", textTransform:"uppercase" }}>Session Elapsed</span>
            <span style={{ fontFamily:"var(--mono)", fontSize:".9rem", color:"var(--cyan)" }}>{fmtTime(elapsed)}</span>
          </div>

          <Metric label="Posture Score"  value={postureScore} found={met.found} />
          <Metric label="Focus Score"    value={focusScore}   found={met.found} />

          {/* Phone confidence bar */}
          <div>
            <div className="mh">
              <span className="ml">Phone Detection</span>
              <span className="mv" style={{ color: phoneScore >= 50 ? "var(--red)" : "var(--green)", fontSize:"1.1rem" }}>
                {active ? `${phoneScore}%` : "—"}
              </span>
            </div>
            <div className="mbar">
              <div className="mbf" style={{ width:`${active ? phoneScore : 0}%`, background: phoneScore >= 50 ? "var(--red)" : phoneScore >= 30 ? "var(--amber)" : "var(--green)" }} />
            </div>
            <div style={{ fontSize:".62rem", color:"var(--muted)", fontFamily:"var(--mono)", marginTop:".22rem" }}>
              {objectronStatus === "ready"
                ? "Objectron (70%) + wrist signal (30%)"
                : "Wrist-proximity + elbow-angle heuristic"}
            </div>
          </div>

          {/* Ear symmetry indicator */}
          {met.found && met.earSymmetry !== null && (
            <div>
              <div className="mh">
                <span className="ml">Ear Symmetry (Focus signal)</span>
                <span style={{ fontFamily:"var(--mono)", fontSize:".78rem", color: met.earSymmetry > 0.7 ? "var(--green)" : "var(--amber)" }}>
                  {(met.earSymmetry * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mbar">
                <div className="mbf" style={{ width:`${met.earSymmetry * 100}%`, background: met.earSymmetry > 0.7 ? "var(--green)" : "var(--amber)" }} />
              </div>
              <div style={{ fontSize:".62rem", color:"var(--muted)", fontFamily:"var(--mono)", marginTop:".22rem" }}>
                100% = facing screen · low = head turned away
              </div>
            </div>
          )}

          {/* Status badges */}
          <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
            <Badge active={met.phoneDetected}            icon="📵" onLabel={`Phone (${phoneScore}%)`} offLabel="No phone" danger />
            <Badge active={met.found && met.p < 55}     icon="🧍" onLabel="Slouching"              offLabel="Upright"   danger />
            <Badge active={met.calibrated}               icon="✅" onLabel="Calibrated"             offLabel="Not calibrated" />
          </div>

          {/* Alert box */}
          {alert && (
            <div className={`ab ${alert.type}`}>
              <span>{alert.msg}</span>
            </div>
          )}

          {/* Activity log */}
          <div>
            <div style={{ fontSize:".62rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:".38rem" }}>
              Activity Log
            </div>
            {log.length === 0
              ? <p className="log-empty">No events yet.</p>
              : (
                <div className="alog">
                  {log.map((e, i) => (
                    <div key={i} className={`ali ${e.type}`}>
                      <span style={{ fontFamily:"var(--mono)", fontSize:".6rem", marginRight:".45rem", opacity:.7 }}>{e.ts}</span>
                      {e.msg}
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, found }) {
  const col = found ? scoreColor(value) : "var(--muted)";
  return (
    <div>
      <div className="mh">
        <span className="ml">{label}</span>
        <span className="mv" style={{ color:col, fontSize:"1.1rem" }}>{found ? `${value}%` : "—"}</span>
      </div>
      <div className="mbar">
        <div className="mbf" style={{ width: found ? `${value}%` : "0%", background:col }} />
      </div>
    </div>
  );
}

function Badge({ active, icon, onLabel, offLabel, danger }) {
  return (
    <div style={{
      padding:".3rem .65rem", borderRadius:4, fontSize:".7rem",
      border:`1px solid ${active && danger ? "rgba(255,69,96,.4)" : active ? "rgba(0,232,150,.3)" : "var(--border)"}`,
      color: active && danger ? "var(--red)" : active ? "var(--green)" : "var(--muted)",
      background: active && danger ? "rgba(255,69,96,.06)" : "transparent",
      fontFamily:"var(--mono)", display:"flex", alignItems:"center", gap:".35rem",
      transition:"all .2s",
    }}>
      {icon} {active ? onLabel : offLabel}
    </div>
  );
}
