import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { usePoseDetection } from "../../hooks/usePoseDetection";
import { Shield, ShieldAlert, Award, AlertTriangle, Monitor, Play, Square, VideoOff } from "lucide-react";

export default function TrackerPage() {
  const { distractionLog, addDistraction } = useApp();
  const [active, setActive] = useState<boolean>(false);

  // Hook handles MediaPipe loading and calculations
  const {
    videoRef,
    canvasRef,
    isPresent,
    postureStatus,
    feedback,
    calibrate,
    isCalibrating,
    hasBaseline
  } = usePoseDetection({
    onDistraction: (event) => addDistraction(event),
    active
  });

  return (
    <div className="constrain-layout py-8 space-y-8 fade-in">
      
      {/* Header Title */}
      <div className="page-header-container">
        <div className="sl">// Neural Posture & Focus Guard</div>
        <h2 className="page-title">BlazePose Focus Shield</h2>
        <p className="page-sub">
          Calibrate healthy seating postures and guard against phone grabs using local machine learning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Camera Feed and skeleton tracking canvas overlay */}
        <div className="lg:col-span-8 space-y-4">
          
          <div style={{
            position: "relative",
            minHeight: "320px",
            backgroundColor: "#03060d",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
          className="shadow-inner"
          >
            {/* Background scanlines mesh */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
              backgroundSize: "100% 4px, 6px 100%",
              opacity: 0.15,
              pointerEvents: "none"
            }} />

            {/* Inactive camera cover screen */}
            {!active && (
              <div className="text-center p-6 space-y-3 z-10 scale-up">
                <VideoOff size={44} className="mx-auto text-slate-600" />
                <h4 style={{ fontSize: "0.95rem", fontWeight: "bold" }}>Focus Shield Silenced</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", maxWidth: "340px", margin: "0 auto" }}>
                  Active tracker assesses your posture on local frames. No video is ever dispatched over the network.
                </p>
                <button
                  onClick={() => setActive(true)}
                  style={{
                    padding: "0.55rem 1.5rem",
                    backgroundColor: "var(--cyan)",
                    color: "black",
                    fontWeight: "600",
                    fontSize: "0.8rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginTop: "1rem"
                  }}
                  className="flex items-center gap-1.5 mx-auto hover:opacity-90 active:scale-95 transition"
                >
                  <Play size={12} fill="currentColor" /> Activate Focus Shield
                </button>
              </div>
            )}

            {/* Live Camera Streaming feeds */}
            {active && (
              <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center" }}>
                {/* Real-time HTML5 Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    maxHeight: "440px",
                    objectFit: "cover",
                    transform: "scaleX(-1)", // Mirror effect
                    opacity: 0.35,
                    borderRadius: "16px"
                  }}
                />

                {/* Tracking skeleton coordinates layer */}
                <canvas
                  ref={canvasRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    width: "100%",
                    maxHeight: "440px",
                    height: "100%",
                    transform: "scaleX(-1)", // Mirror coordinate matching
                    zIndex: 2,
                    objectFit: "cover"
                  }}
                />

                {/* Floating Tracker Active status dots */}
                <div style={{
                  position: "absolute",
                  top: "1rem", left: "1rem",
                  backgroundColor: "rgba(3, 5, 10, 0.7)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "20px",
                  border: "1px solid var(--border)",
                  fontSize: "0.68rem",
                  color: "#00ff88",
                  fontFamily: "var(--mono)"
                }} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE TRACKING
                </div>
              </div>
            )}

          </div>

          {/* Quick calibration help instructions card */}
          {active && (
            <div className="sc flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Align and Stabilize</h4>
                <p style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                  Sit upright in a healthy posture, look steady at the camera, and calibrate your baseline vertical spacing.
                </p>
              </div>
              
              <button
                onClick={calibrate}
                disabled={isCalibrating}
                style={{
                  padding: "0.55rem 1.25rem",
                  backgroundColor: isCalibrating ? "rgba(10, 15, 30, 0.5)" : "rgba(0, 229, 255, 0.08)",
                  borderColor: isCalibrating ? "var(--border)" : "var(--cyan)",
                  color: isCalibrating ? "var(--muted)" : "var(--cyan)",
                  border: "1px solid",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  borderRadius: "6px"
                }}
                className="hover:scale-[1.01] active:scale-95 transition"
              >
                {isCalibrating ? "Storing spine matrix..." : "Calibrate Posture"}
              </button>
            </div>
          )}

        </div>

        {/* Right side status metrics panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Real-time alert status panel */}
          <div className="sc space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
              <Shield size={14} className="text-cyan-400" />
              <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl m-0">
                SHIELD MATRIX
              </h3>
            </div>

            {/* Large alert warning indicator card */}
            <div style={{
              backgroundColor: postureStatus.toLowerCase().includes("alert") 
                ? "rgba(255, 68, 68, 0.04)" 
                : "rgba(10, 15, 30, 0.3)",
              borderColor: postureStatus.toLowerCase().includes("alert") 
                ? "var(--red)" 
                : "var(--border)",
              borderWidth: "1px",
              padding: "1rem",
              borderRadius: "10px",
              textAlign: "center"
            }} className="transition-all">
              
              <div style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                color: postureStatus.toLowerCase().includes("alert") ? "var(--red)" : "var(--text)",
                fontFamily: "var(--syne)"
              }}>
                {postureStatus}
              </div>

              {/* Feedbacks list */}
              <div className="space-y-1 mt-3">
                {feedback.map((f, i) => (
                  <p key={i} style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>
                    {f}
                  </p>
                ))}
              </div>

            </div>

            {/* Toggle Switch to disable or active */}
            {active && (
              <button
                onClick={() => setActive(false)}
                style={{
                  width: "100%", padding: "0.55rem",
                  backgroundColor: "rgba(255, 68, 68, 0.08)",
                  borderColor: "rgba(255, 68, 68, 0.2)",
                  color: "var(--red)",
                  border: "1px solid",
                  fontWeight: "semibold", fontSize: "0.75rem", borderRadius: "6px",
                  cursor: "pointer"
                }}
                className="flex items-center justify-center gap-1.5 hover:bg-opacity-90 transition active:scale-[0.98]"
              >
                <Square size={11} fill="currentColor" /> Mute Focus Guard
              </button>
            )}

          </div>

          {/* Distraction instances logs registry list */}
          <div className="sc space-y-3">
            <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl">
              DISTRACTION DRILLS
            </h3>

            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {distractionLog.length > 0 ? (
                distractionLog.slice().reverse().map((dist, idx) => (
                  <div key={idx} className="bg-[#090d1a] border border-slate-900 rounded p-2 flex items-center justify-between text-xs hover:border-slate-800 transition">
                    <div className="flex items-center gap-2 text-slate-300">
                      <AlertTriangle size={12} className="text-amber-500" />
                      <span className="font-bold capitalize">{dist.type} warning</span>
                    </div>
                    <span style={{ fontSize: "0.65rem", fontFamily: "var(--mono)", color: "var(--muted)" }}>
                      {new Date(dist.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: "0.62rem", letterSpacing: "1.5px", padding: "1.5rem 0", textAlign: "center" }}>
                  Perfect posture logs. Standing tall!
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
export type TrackerPageState = ReturnType<typeof TrackerPage>;
