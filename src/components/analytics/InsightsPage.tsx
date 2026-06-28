import { useApp } from "../../context/AppContext";
import { useAnalytics } from "../../hooks/useAnalytics";
import { assessBurnoutRisk } from "../../utils/burnout";
import { Flame, Brain, AlertOctagon, TrendingUp, Sparkles, Calendar, Coffee } from "lucide-react";

export default function InsightsPage() {
  const { sessionLog, distractionLog, streak, subjectsWithHours, subjects } = useApp();

  // Load analytical summaries
  const { insights } = useAnalytics(sessionLog, distractionLog, streak, subjects);

  // Evaluate burnout triggers
  const assessment = assessBurnoutRisk(sessionLog, distractionLog);
  const burnoutReport = {
    level: assessment.level === "High" ? "Critical Risk" : assessment.level === "Moderate" ? "Moderate Risk" : "Healthy Rhythm",
    score: assessment.score,
    recs: [assessment.advice]
  };

  // 28-Day Heatmap calculations
  const totalDays = 28;
  const currentDOM = new Date().getDate();

  // Create array of 28 elements to display
  const heatmapDays = Array.from({ length: totalDays }).map((_, idx) => {
    const dayNum = idx + 1;
    // Calculate total hours studied this day
    const daySecs = sessionLog
      .filter((entry) => {
        const entDate = new Date(entry.timestamp);
        return entDate.getDate() === dayNum;
      })
      .reduce((acc, curr) => acc + curr.secs, 0);
    const hrs = daySecs / 3600;

    return {
      dayNum,
      hrs,
      active: hrs > 0,
    };
  });

  return (
    <div className="constrain-layout py-8 space-y-8 fade-in">
      
      {/* Page Header */}
      <div className="page-header-container">
        <div className="sl">// AI Analytics & Bio-Feedback Matrix</div>
        <h2 className="page-title">Intelligence Console</h2>
        <p className="page-sub">
          Review monthly heatmap registries, subject focus breakdowns, and localized burnout assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Columns layout: Heatmap grid and Subject Hour charts */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Monthly Heatmap Card */}
          <div className="sc space-y-4">
            
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Calendar size={14} className="text-cyan-400" />
              <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl m-0">
                28-DAY focus HEATMAP
              </h3>
            </div>

            {/* Heatmap board grid maps */}
            <div className="grid grid-cols-7 gap-3 py-2">
              {heatmapDays.map((d) => {
                // Color scaling based on study volume
                let bgColor = "rgba(15, 22, 40, 0.4)";
                let title = `${d.dayNum}: No hours studied`;

                if (d.hrs > 0) {
                  title = `${d.dayNum}: Study duration of ${d.hrs.toFixed(1)} Hrs`;
                  if (d.hrs < 1.5) {
                    bgColor = "rgba(0, 229, 255, 0.15)";
                  } else if (d.hrs < 3.5) {
                    bgColor = "rgba(0, 229, 255, 0.4)";
                  } else {
                    bgColor = "var(--cyan)";
                  }
                }

                // Highlight today
                const isToday = d.dayNum === currentDOM;

                return (
                  <div 
                    key={d.dayNum}
                    style={{
                      height: "40px",
                      backgroundColor: bgColor,
                      border: isToday ? "2px solid white" : "1px solid var(--border)",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      color: d.hrs > 3.5 ? "black" : "var(--text)",
                      cursor: "pointer",
                      position: "relative"
                    }}
                    className="hover:scale-105 transition"
                    title={title}
                  >
                    {d.dayNum}
                    {/* Corner tiny dot indicating study log */}
                    {d.active && d.hrs <= 3.5 && (
                      <span 
                        style={{
                          position: "absolute",
                          bottom: "3px", right: "3px",
                          width: "4px", height: "4px",
                          borderRadius: "50%",
                          backgroundColor: "white"
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-900">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[rgba(15,22,40,0.4)] rounded" /> 0h</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[rgba(0,229,255,0.15)] rounded" /> &lt;1.5h</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[rgba(0,229,255,0.4)] rounded" /> &lt;3.5h</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[var(--cyan)] rounded" /> 3.5h+</span>
            </div>

          </div>

          {/* Subject hour charting bars */}
          <div className="sc space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl m-0">
                SUBJECT HOURS BALANCE
              </h3>
              <span className="font-mono text-[10px] text-slate-500">Relative totals studied</span>
            </div>

            {/* Custom SVG/CSS Bar graphs chart mapping */}
            <div className="space-y-4 py-2">
              {subjectsWithHours.length > 0 ? (
                subjectsWithHours.map((sub) => {
                  const percent = Math.min(100, Math.round((sub.hrs / 40) * 100)) || 2; // scale against 40 hours max
                  return (
                    <div key={sub.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-300">{sub.name}</span>
                        <span className="font-mono text-slate-400 font-bold">{sub.hrs.toFixed(1)} Hours</span>
                      </div>
                      
                      <div style={{ height: "10px", backgroundColor: "#090d1a", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${percent}%`,
                          backgroundColor: sub.color,
                          borderRadius: "5px",
                          boxShadow: `0 0 10px ${sub.color}80`,
                          transition: "width 0.5s ease-out"
                        }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: "0.62rem", letterSpacing: "1.5px", padding: "1.5rem 0", textAlign: "center" }}>
                  Complete pomodoro blocks to populate statistics chart.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right side health checks: burnout logs, AI tips */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Burnout risk assessor warnings */}
          <div className="sc space-y-4">
            
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
              < flame className="text-cyan-400" />
              <Flame size={14} className="text-cyan-400" />
              <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl m-0">
                BURNOUT AUDIT
              </h3>
            </div>

            <div style={{
              backgroundColor: burnoutReport.level === "Critical Risk" || burnoutReport.level === "Elevated Danger"
                ? "rgba(255, 68, 68, 0.04)"
                : "rgba(10, 15, 30, 0.3)",
              borderColor: burnoutReport.level === "Critical Risk" || burnoutReport.level === "Elevated Danger"
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
                color: burnoutReport.level === "Critical Risk" || burnoutReport.level === "Elevated Danger" ? "var(--red)" : "var(--green)",
                fontFamily: "var(--syne)"
              }}>
                {burnoutReport.level}
                <span className="text-xs text-slate-400 font-mono block mt-1">Fatigue Score: {burnoutReport.score}</span>
              </div>

              {/* Suggestions bullets from safety report */}
              <div className="space-y-1.5 mt-4 text-left">
                {burnoutReport.recs.map((rec: string, i: number) => (
                  <div key={i} className="flex gap-2 items-start text-xs text-slate-300">
                    <Coffee size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* AI Intelligence Insights list */}
          <div className="sc space-y-4">
            
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Brain size={14} className="text-cyan-400" />
              <h3 style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--cyan)" }} className="sl m-0">
                ARKMAESTER INTEL
              </h3>
            </div>

            <div className="space-y-3">
              {insights.map((ins, idx) => (
                <div 
                  key={idx}
                  className="bg-[#090d1a] border border-slate-900 rounded p-3 flex.5 space-y-1"
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 font-mono uppercase">
                    <Sparkles size={10} /> recommendation
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text)", lineHeight: 1.4 }}>
                    {ins}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
export type InsightsPageState = ReturnType<typeof InsightsPage>;
