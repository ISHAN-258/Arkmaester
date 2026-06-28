import { useMemo } from "react";

const R = 88, CX = 100, CY = 100;
const CIRC = 2 * Math.PI * R;

export default function TimerRing({ tl, totalSecs, mode, running }) {
  const pct   = useMemo(() => tl / totalSecs, [tl, totalSecs]);
  const dash  = useMemo(() => CIRC * pct, [pct]);
  const color = mode === "focus"
    ? running ? "var(--cyan)" : "var(--border)"
    : "var(--green)";

  const warningColor = tl <= 10 && mode === "focus" ? "var(--red)" : color;

  return (
    <div className="timer-ring">
      <svg viewBox="0 0 200 200" width="200" height="200">
        <circle className="trb" cx={CX} cy={CY} r={R} />
        <circle
          className="trf"
          cx={CX} cy={CY} r={R}
          stroke={warningColor}
          strokeDasharray={`${dash} ${CIRC}`}
          style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.4s" }}
        />
      </svg>
      <div className="timer-display">
        <span
          className="timer-time"
          style={{ color: warningColor }}
        >
          {String(Math.floor(tl / 60)).padStart(2, "0")}
          <span style={{ opacity: running ? 1 : 0.45 }}>:</span>
          {String(tl % 60).padStart(2, "0")}
        </span>
        <span className="timer-ml">
          {mode === "focus" ? "FOCUS" : mode === "short" ? "SHORT BREAK" : "LONG BREAK"}
        </span>
      </div>
    </div>
  );
}
