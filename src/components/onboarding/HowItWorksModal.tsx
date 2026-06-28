import { X, ArrowRight, ArrowDown } from "lucide-react";

interface HowItWorksModalProps {
  onClose: () => void;
}

export default function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  const steps = [
    { num: "01", icon: "🎙", title: "Voice Planner", desc: "Speak naturally to plan study tasks in seconds." },
    { num: "02", icon: "📋", title: "Daily Schedule", desc: "AI organizes items, schedules subjects and sets priorities." },
    { num: "03", icon: "⏱", title: "Study Session", desc: "Use focus timers with ambient synthesizer sounds." },
    { num: "04", icon: "👁", title: "Focus Tracking", desc: "MediaPipe webcam keeps guard on phone posture." },
    { num: "05", icon: "📊", title: "Analytics", desc: "View detailed weekly breakdown grids and heatmaps." },
    { num: "06", icon: "🤖", title: "AI Insights", desc: "Arkmaester delivers fatigue and productivity warning alerts." }
  ];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(3, 5, 10, 0.92)",
      backdropFilter: "blur(12px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem"
    }} className="fade-in">
      <div style={{
        maxWidth: "960px",
        width: "100%",
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "2rem",
        position: "relative",
        boxShadow: "0 24px 64px rgba(0, 229, 255, 0.15)"
      }} className="scale-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            color: "var(--muted)",
            background: "none",
            border: "none",
            cursor: "pointer"
          }}
          className="hover:text-white transition"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="sl" style={{ marginBottom: "0.25rem" }}>Workflow Blueprint</div>
          <h2 style={{
            fontFamily: "var(--syne)",
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "var(--text)"
          }}>
            How Arkmaester Works
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            The circular chain of planning, focus tracking, and intelligence.
          </p>
        </div>

        {/* Workflow Diagram */}
        {/* Desktop View (Horizontal) */}
        <div className="hidden md:flex items-center justify-between gap-1" style={{ position: "relative" }}>
          {steps.map((s, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{
                flex: 1,
                backgroundColor: "rgba(10, 15, 30, 0.5)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.25rem 0.75rem",
                textAlign: "center",
                transition: "all 0.2s",
                position: "relative"
              }}
              className="hover:border-neutral-500 hover:shadow-lg"
              >
                <div style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  border: "1px solid var(--cyan)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  color: "var(--cyan)",
                  fontFamily: "var(--mono)",
                  margin: "0 auto 0.75rem"
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{s.icon}</div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text)", marginBottom: "0.25rem" }}>{s.title}</h4>
                <p style={{ fontSize: "0.68rem", color: "var(--muted)", lineHeight: 1.2 }}>{s.desc}</p>
              </div>
              
              {idx < steps.length - 1 && (
                <div style={{ color: "var(--border)", margin: "0 0.25rem" }}>
                  <ArrowRight size={14} className="text-cyan-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile View (Vertical) */}
        <div className="flex md:hidden flex-col gap-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
          {steps.map((s, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "100%",
                backgroundColor: "rgba(10, 15, 30, 0.5)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "0.85rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem"
              }}>
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: "1px solid var(--cyan)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  color: "var(--cyan)",
                  fontFamily: "var(--mono)",
                  flexShrink: 0
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: "1.5rem" }}>{s.icon}</div>
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text)" }}>{s.title}</h4>
                  <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{s.desc}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div style={{ color: "var(--cyan)", margin: "0.25rem 0" }}>
                  <ArrowDown size={14} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <button 
            onClick={onClose}
            style={{
              padding: "0.65rem 2rem",
              backgroundColor: "var(--cyan)",
              color: "black",
              fontWeight: "600",
              fontSize: "0.85rem",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "transform 0.15s, opacity 0.15s"
            }}
            className="hover:scale-[1.03] active:scale-95"
          >
            I Command the Blueprint
          </button>
        </div>

      </div>
    </div>
  );
}
export type HowItWorksState = ReturnType<typeof HowItWorksModal>;
