import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";

const R = 28, CIRC = 2 * Math.PI * R;

export default function GoalCard() {
  const { dailyGoalHrs, setDailyGoalHrs, todayStudiedHrs, dailyGoalPct, sessionLog, streak } = useApp();
  const [editing, setEditing] = useState(false);
  const [input,   setInput]   = useState(String(dailyGoalHrs));

  const dash  = CIRC * (dailyGoalPct / 100);
  const color = dailyGoalPct >= 100 ? "var(--green)" : dailyGoalPct >= 60 ? "var(--cyan)" : "var(--amber)";

  const save = () => {
    const v = parseFloat(input);
    if (v > 0 && v <= 24) setDailyGoalHrs(v);
    setEditing(false);
  };

  const todaySessions = sessionLog.filter((e) => e.date === new Date().toISOString().slice(0,10)).length;

  return (
    <div className="goal-card sc">
      <h4>Daily Goal</h4>
      <div className="goal-ring-wrap">
        <div className="goal-ring">
          <svg viewBox="0 0 72 72" width="72" height="72">
            <circle cx="36" cy="36" r={R} fill="none" stroke="var(--border)" strokeWidth="5" />
            <circle
              cx="36" cy="36" r={R}
              fill="none" stroke={color} strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRC}`}
              style={{ transform:"rotate(-90deg)", transformOrigin:"50% 50%", transition:"stroke-dasharray .6s ease, stroke .4s" }}
            />
          </svg>
          <div className="goal-ring-label" style={{ color }}>
            {dailyGoalPct}%
          </div>
        </div>
        <div className="goal-info">
          <div className="goal-pct" style={{ color }}>
            {todayStudiedHrs.toFixed(1)}h <span style={{ color:"var(--muted)", fontSize:".7rem" }}>/ {dailyGoalHrs}h</span>
          </div>
          <div className="goal-sub">{todaySessions} session{todaySessions !== 1 ? "s" : ""} today</div>
          <div className="goal-sub" style={{ marginTop:".18rem" }}>🔥 {streak}-day streak</div>
          {editing ? (
            <div className="goal-input-row">
              <input
                className="goal-input"
                type="number" min="0.5" max="24" step="0.5"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key==="Enter") save(); if (e.key==="Escape") setEditing(false); }}
                autoFocus
              />
              <span style={{ fontSize:".7rem", color:"var(--muted)" }}>hrs</span>
              <button className="goal-set-btn" onClick={save}>Set</button>
            </div>
          ) : (
            <button
              className="notes-expand"
              style={{ marginTop:".35rem" }}
              onClick={() => { setInput(String(dailyGoalHrs)); setEditing(true); }}
            >
              ✏ Edit goal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
