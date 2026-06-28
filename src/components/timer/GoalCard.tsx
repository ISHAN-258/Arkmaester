import { useApp } from "../../context/AppContext";

export default function GoalCard() {
  const { todayStudiedHrs, dailyGoalHrs, dailyGoalPct, weeklyGoalHrs, sessionLog } = useApp();

  // Weekly calculations
  const totalSecs = sessionLog.reduce((a, s) => a + s.secs, 0);
  const weeklyHrs = Number((totalSecs / 3600).toFixed(1));
  const weeklyGoalPct = Math.min(100, Math.round((weeklyHrs / weeklyGoalHrs) * 100));

  return (
    <div className="sc space-y-4">
      <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl">
        PROGESS GOALS
      </h3>

      {/* Daily Block */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">Daily Balance</span>
          <span className="font-mono text-cyan-400 font-semibold">
            {todayStudiedHrs.toFixed(1)} / {dailyGoalHrs} Hrs ({dailyGoalPct}%)
          </span>
        </div>
        {/* Progress tracks bar */}
        <div style={{ height: "6px", backgroundColor: "#090d1a", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${dailyGoalPct}%`,
            backgroundColor: "var(--cyan)", borderRadius: "3px",
            transition: "width 0.4s ease-out",
            boxShadow: "0 0 10px rgba(0, 229, 255, 0.5)"
          }} />
        </div>
      </div>

      {/* Weekly Block */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">Weekly Shield</span>
          <span className="font-mono text-purple-400 font-semibold">
            {weeklyHrs} / {weeklyGoalHrs} Hrs ({weeklyGoalPct}%)
          </span>
        </div>
        {/* Progress tracks bar */}
        <div style={{ height: "6px", backgroundColor: "#090d1a", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${weeklyGoalPct}%`,
            backgroundColor: "var(--purple)", borderRadius: "3px",
            transition: "width 0.4s ease-out",
            boxShadow: "0 0 10px rgba(167, 139, 250, 0.5)"
          }} />
        </div>
      </div>

    </div>
  );
}
export type GoalCardState = ReturnType<typeof GoalCard>;
