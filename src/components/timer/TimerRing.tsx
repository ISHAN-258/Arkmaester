import { formatTime } from "../../utils/helpers";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerRingProps {
  timerState: any;
}

export default function TimerRing({ timerState }: TimerRingProps) {
  const { timeLeft, isActive, mode, startTimer, pauseTimer, resetTimer, totalDuration } = timerState;

  // Circular calculations
  const radius = 100;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const pct = totalDuration > 0 ? (timeLeft / totalDuration) : 0;
  const strokeDashoffset = circumference - pct * circumference;

  const isStudy = mode === "study";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      padding: "1.5rem"
    }}>
      
      {/* SVG Countdown Circle */}
      <div style={{ position: "relative", width: "240px", height: "240px" }}>
        
        <svg height="240" width="240" style={{ transform: "rotate(-90deg)" }}>
          {/* Track Circle */}
          <circle
            stroke="var(--border)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="120"
            cy="120"
          />
          {/* Active Highlight Progress Circle */}
          <circle
            stroke={isStudy ? "var(--cyan)" : "var(--amber)"}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 0.35s linear, stroke 0.3s ease" }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="120"
            cy="120"
          />
        </svg>

        {/* Floating Inner Details */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none"
        }}>
          
          <div className="sl" style={{
            fontSize: "0.58rem",
            letterSpacing: "3px",
            color: isStudy ? "var(--cyan)" : "var(--amber)",
            marginBottom: "0.25rem"
          }}>
            {isStudy ? "FOCUS MODE" : "REST BREATH"}
          </div>

          <div style={{
            fontFamily: "var(--mono)",
            fontSize: "2.75rem",
            fontWeight: "bold",
            color: "var(--text)",
            lineHeight: 1
          }}>
            {formatTime(timeLeft)}
          </div>

          <div style={{
            fontSize: "0.68rem",
            color: "var(--muted)",
            marginTop: "0.5rem"
          }}>
            {isActive ? "Ticking active" : "Clock paused"}
          </div>

        </div>

      </div>

      {/* Control Buttons Overlay */}
      <div className="flex gap-4 mt-6">
        
        {/* Play/Pause toggle */}
        <button 
          onClick={isActive ? pauseTimer : startTimer}
          style={{
            width: "44px", height: "44px",
            borderRadius: "50%",
            backgroundColor: isStudy ? "var(--cyan)" : "var(--amber)",
            color: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "none"
          }}
          className="hover:scale-105 active:scale-95 transition-all shadow-md shadow-cyan-300"
          title={isActive ? "Pause Block" : "Start Block"}
        >
          {isActive ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" style={{ marginLeft: "2px" }} />}
        </button>

        {/* Reset Clock */}
        <button 
          onClick={resetTimer}
          style={{
            width: "44px", height: "44px",
            borderRadius: "50%",
            backgroundColor: "rgba(10, 15, 30, 0.4)",
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer", border: "1px solid var(--border)"
          }}
          className="hover:border-neutral-500 hover:scale-105 active:scale-95 transition-all"
          title="Reset Block"
        >
          <RotateCcw size={18} />
        </button>

      </div>

    </div>
  );
}
export type TimerRingState = ReturnType<typeof TimerRing>;
