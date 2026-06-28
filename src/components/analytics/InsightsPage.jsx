import { useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useAnalytics } from "../../hooks/useAnalytics.js";
import { buildDistractionTimeline } from "../../utils/analytics.js";
import { healthScoreLabel } from "../../utils/analytics.js";
import { hourLabel } from "../../utils/helpers.js";
import { exportWeeklyReportTxt, generateShareCard } from "../../utils/export.js";
import { detectBurnout, calcOptimalSessionMins, calcLongestStreak, calcBestWorstWeeks } from "../../utils/burnout.js";

export default function InsightsPage() {
  const { sessionLog, subjects, subjectsWithHours, streak, distractionLog, weeklyGoalHrs } = useApp();

  const {
    weeklyData, peakHours, heatmap,
    totalSecs, totalSessions,
    todayStudiedHrs, weeklyStudiedHrs,
    insights, weeklySummary,
    todayDistractions, healthScore,
  } = useAnalytics({ sessionLog, subjects: subjectsWithHours, streak, distractionLog });

  const burnout     = useMemo(() => detectBurnout(sessionLog),          [sessionLog]);
  const optimalMins = useMemo(() => calcOptimalSessionMins(sessionLog),  [sessionLog]);
  const longestStreak = useMemo(() => calcLongestStreak(sessionLog),     [sessionLog]);
  const { best: bestWeek, worst: worstWeek } = useMemo(() => calcBestWorstWeeks(sessionLog), [sessionLog]);

  const { label: healthLabel, color: healthColor } = healthScoreLabel(healthScore);
  const distrTimeline = useMemo(() => buildDistractionTimeline(distractionLog), [distractionLog]);

  const CIRC = 2 * Math.PI * 42;
  const healthDash = CIRC * (healthScore / 100);

  return (
    <div className="page">
      <div className="page-header">
        <div className="sl">// ARKMAESTER — INTELLIGENCE</div>
        <h2 className="page-title">AI Insights</h2>
        <p className="page-sub">Personalised productivity intelligence from your study patterns.</p>
      </div>

      {/* Burnout warning */}
      {burnout && (
        <div className="ab" style={{ marginBottom:"1rem", padding:".75rem 1rem", borderRadius:8, background:`rgba(${burnout.level==="high"?"255,68,68":"255,179,0"},.08)`, border:`1px solid ${burnout.color}`, color:burnout.color }}>
          {burnout.message}
        </div>
      )}

      {/* Extra stats row */}
      <div className="ag" style={{ marginBottom:"1.1rem" }}>
        {[
          { l:"Longest Streak",    v:`${longestStreak} days`,                         c:"var(--amber)"  },
          { l:"Optimal Session",   v:optimalMins ? `${optimalMins} min` : "Need data", c:"var(--cyan)"  },
          { l:"Best Week",         v:bestWeek  ? `${bestWeek.hrs}h`  : "—",           c:"var(--green)"  },
          { l:"Worst Week",        v:worstWeek ? `${worstWeek.hrs}h` : "—",           c:"var(--purple)" },
        ].map(({ l,v,c }) => (
          <div className="as-card" key={l}>
            <div className="as-l">{l}</div>
            <div className="as-v" style={{ color:c, fontSize:"1.2rem" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Top row: health score + weekly chart */}
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"1.1rem", marginBottom:"1.1rem" }}>
        {/* Health score ring */}
        <div className="sc" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:".65rem", padding:"1.25rem 1.5rem" }}>
          <div style={{ fontSize:".63rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"2px", textTransform:"uppercase" }}>Health Score</div>
          <div className="health-ring">
            <svg viewBox="0 0 96 96" width="100" height="100">
              <circle cx="48" cy="48" r="42" fill="none" stroke="var(--border)" strokeWidth="7" />
              <circle
                cx="48" cy="48" r="42"
                fill="none" stroke={healthColor} strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${healthDash} ${CIRC}`}
                style={{ transform:"rotate(-90deg)", transformOrigin:"50% 50%", transition:"stroke-dasharray .8s ease" }}
              />
            </svg>
            <div className="health-ring-label">
              <span className="health-score-num" style={{ color: healthColor }}>{healthScore}</span>
              <span className="health-score-lbl">/100</span>
            </div>
          </div>
          <div style={{ fontWeight:700, fontSize:".82rem", color: healthColor }}>{healthLabel}</div>
          <div style={{ fontSize:".68rem", color:"var(--muted)", textAlign:"center", lineHeight:1.5 }}>
            Streak: {streak} days<br />
            Today: {todayStudiedHrs.toFixed(1)}h<br />
            Distractions: {todayDistractions.length}
          </div>
        </div>

        {/* Weekly bar chart */}
        <div className="cc2">
          <h3>
            Weekly Study Hours
            <span style={{ fontFamily:"var(--mono)", fontSize:".65rem", color:"var(--cyan)", marginLeft:".6rem" }}>
              {weeklyStudiedHrs.toFixed(1)}h / {weeklyGoalHrs}h goal
            </span>
          </h3>
          <WeeklyBarChart weeklyData={weeklyData} />
        </div>
      </div>

      {/* AI Insights */}
      <div style={{ marginBottom:"1.1rem" }}>
        <div className="sl" style={{ marginBottom:".65rem" }}>// AI INSIGHTS</div>
        <div className="insights-grid">
          {insights.map((ins, i) => (
            <div key={i} className={`insight-card ${ins.type}`} style={{ animationDelay:`${i*.07}s` }}>
              <span className="insight-icon">{ins.icon}</span>
              <span className="insight-text">{ins.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-col: heatmap + peak hours */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.1rem", marginBottom:"1.1rem" }}>
        <FocusHeatmap heatmap={heatmap} />
        <PeakHoursChart peakHours={peakHours} />
      </div>

      {/* Subject breakdown */}
      {subjectsWithHours.length > 0 && (
        <div className="sc" style={{ marginBottom:"1.1rem" }}>
          <h4>Subject-wise Analytics</h4>
          <div className="sbd">
            {subjectsWithHours.map((s) => {
              const max = Math.max(1, ...subjectsWithHours.map((x) => x.hours));
              const pct = Math.round((s.hours / max) * 100);
              return (
                <div className="bdi" key={s.id}>
                  <div className="bdd" style={{ background: s.color }} />
                  <div className="bdi-info">
                    <div className="bdi-name">{s.name}</div>
                    <div className="bdi-pct">{s.hours.toFixed(1)}h · {Math.round((s.hours/(s.target||1))*100)}% of target</div>
                    <div className="bdi-bar"><div className="bdi-bf" style={{ width:`${pct}%`, background:s.color }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Distraction timeline */}
      {distrTimeline.length > 0 && (
        <div className="sc" style={{ marginBottom:"1.1rem" }}>
          <h4>Distraction Timeline</h4>
          <div style={{ maxHeight:200, overflowY:"auto" }}>
            {distrTimeline.map((d, i) => (
              <div key={i} className={`distraction-item ${d.type}`}>
                <span style={{ fontSize:"1rem" }}>
                  {d.type==="phone" ? "📵" : d.type==="posture" ? "🧍" : "👁"}
                </span>
                <span style={{ flex:1, fontWeight:600, textTransform:"capitalize" }}>{d.type}</span>
                <span className="distraction-ts">{d.timeStr} · {d.dateStr}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly report + Pie chart */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.1rem", marginBottom:"1.1rem" }}>
        <MonthlyReport sessionLog={sessionLog} />
        <SubjectPie subjects={subjectsWithHours} />
      </div>

      {/* Weekly summary */}
      <WeeklySummaryCard summary={weeklySummary} sessionLog={sessionLog} subjects={subjectsWithHours} totalSessions={totalSessions} />
    </div>
  );
}

// ── Weekly bar chart ───────────────────────────────────────────────────────
function WeeklyBarChart({ weeklyData }) {
  const max = Math.max(1, ...weeklyData.map((d) => d.hours));
  return (
    <div className="bc" style={{ height:110, alignItems:"flex-end" }}>
      {weeklyData.map((d, i) => {
        const h = Math.max(3, (d.hours / max) * 90);
        const isToday = i === weeklyData.length - 1;
        return (
          <div className="bcol" key={d.label}>
            <div className="bval">{d.hours > 0 ? `${d.hours}h` : ""}</div>
            <div
              className="bbar"
              style={{ height:h, background: isToday ? "var(--cyan)" : "rgba(0,229,255,.35)", borderRadius:"3px 3px 0 0" }}
            />
            <div className="blbl" style={{ color: isToday ? "var(--cyan)" : "var(--muted)" }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Focus heatmap (28-day GitHub style) ──────────────────────────────────
function FocusHeatmap({ heatmap }) {
  return (
    <div className="sc">
      <h4>28-Day Focus Heatmap</h4>
      <div className="heatmap-grid">
        {heatmap.map((d, i) => (
          <div
            key={i}
            className={`hm-cell hm-${d.intensity}`}
            title={`${d.label} ${d.date} — ${d.hours}h`}
            style={{ animation:`heatPop .3s ${i*.012}s ease both` }}
          />
        ))}
      </div>
      <div style={{ display:"flex", gap:".35rem", alignItems:"center", marginTop:".65rem", fontSize:".65rem", color:"var(--muted)" }}>
        Less
        {[0,1,2,3,4].map((n) => (
          <div key={n} className={`hm-cell hm-${n}`} style={{ width:12, height:12, flexShrink:0 }} />
        ))}
        More
      </div>
    </div>
  );
}

// ── Peak hours chart ───────────────────────────────────────────────────────
function PeakHoursChart({ peakHours }) {
  const max = Math.max(1, ...peakHours);
  const shown = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  return (
    <div className="sc">
      <h4>Peak Study Hours</h4>
      <div style={{ display:"flex", alignItems:"flex-end", gap:"2px", height:90 }}>
        {shown.map((h) => {
          const val = peakHours[h] ?? 0;
          const pct = (val / max) * 82;
          const isPeak = val === max && val > 0;
          return (
            <div key={h} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <div
                style={{
                  width:"100%", minHeight:2, height:Math.max(2, pct),
                  background: isPeak ? "var(--cyan)" : "rgba(0,229,255,.3)",
                  borderRadius:"2px 2px 0 0", transition:"height .5s ease",
                }}
                title={`${hourLabel(h)}: ${Math.round(val/60)}m`}
              />
              <span style={{ fontFamily:"var(--mono)", fontSize:".48rem", color: isPeak ? "var(--cyan)" : "var(--muted)" }}>
                {h % 3 === 0 ? hourLabel(h) : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Weekly summary card ───────────────────────────────────────────────────
function WeeklySummaryCard({ summary, sessionLog, subjects, totalSessions }) {
  const handleShare = () => {
    generateShareCard({
      totalSessions,
      streak: summary.streak,
      weeklyHrs: summary.totalHrs,
      topSubject: summary.topSubject,
    });
  };

  return (
    <div className="summary-card">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".85rem" }}>
        <div>
          <div className="sl">// ARKMAESTER — WEEKLY REPORT</div>
          <div style={{ fontSize:".62rem", color:"var(--muted)", fontFamily:"var(--mono)", marginTop:".15rem" }}>Arkmaester has analysed your patterns.</div>
          <h4 style={{ fontWeight:800, fontSize:"1rem", marginTop:".2rem" }}>{summary.rating}</h4>
        </div>
        <div style={{ display:"flex", gap:".4rem" }}>
          <button className="share-card-btn" onClick={handleShare}>🖼 Share Card</button>
          <button className="export-btn" onClick={() => exportWeeklyReportTxt(summary)}>↓ TXT</button>
        </div>
      </div>

      {[
        ["Total Hours",      `${summary.totalHrs}h`],
        ["Sessions",         summary.sessions],
        ["Best Day",         summary.bestDay],
        ["Top Subject",      summary.topSubject],
        ["Streak",           `${summary.streak} days 🔥`],
        ["Distractions",     summary.distractions],
      ].map(([l, v]) => (
        <div className="summary-stat" key={l}>
          <span style={{ color:"var(--muted)", fontSize:".8rem" }}>{l}</span>
          <span className="summary-val">{v}</span>
        </div>
      ))}

      <div className="summary-ai-comment">
        💡 Arkmaester recommends: {summary.aiComment}
      </div>
    </div>
  );
}

// ── Monthly report component (append-exported for use in InsightsPage) ──
export function MonthlyReport({ sessionLog }) {
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow    = new Date(year, month, 1).getDay();

  const studiedSet = new Set(
    sessionLog
      .filter((e) => { const d = new Date(e.ts); return d.getFullYear()===year && d.getMonth()===month; })
      .map((e) => new Date(e.ts).getDate())
  );

  const totalHrs = sessionLog
    .filter((e) => { const d = new Date(e.ts); return d.getFullYear()===year && d.getMonth()===month; })
    .reduce((a, e) => a + e.secs, 0) / 3600;

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push({ pad: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d });

  return (
    <div className="sc" style={{ marginBottom:"1.1rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".75rem" }}>
        <h4 style={{ margin:0 }}>
          {today.toLocaleString("default",{month:"long"})} Report
        </h4>
        <span style={{ fontFamily:"var(--mono)", fontSize:".72rem", color:"var(--cyan)" }}>
          {totalHrs.toFixed(1)}h · {studiedSet.size} days
        </span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:".5rem" }}>
        {["S","M","T","W","T","F","S"].map((d,i) => (
          <div key={i} style={{ textAlign:"center", fontSize:".52rem", color:"var(--muted)", fontFamily:"var(--mono)", paddingBottom:3 }}>{d}</div>
        ))}
        {cells.map((c,i) => {
          if (c.pad) return <div key={`p${i}`} className="month-cell pad" />;
          const isToday   = c.d === today.getDate();
          const isStudied = studiedSet.has(c.d);
          return (
            <div
              key={c.d}
              className={`month-cell${isToday?" today":isStudied?" studied":" empty"}`}
              title={`${c.d}${isStudied?" ✓":""}`}
            >
              {c.d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Subject pie chart ─────────────────────────────────────────────────────
export function SubjectPie({ subjects }) {
  const total = subjects.reduce((a, s) => a + s.hours, 0) || 1;
  const SIZE  = 100, CX = 50, CY = 50, R = 38;
  const CIRC  = 2 * Math.PI * R;

  let cumulativeAngle = 0;
  const slices = subjects
    .filter((s) => s.hours > 0)
    .map((s) => {
      const pct   = s.hours / total;
      const start = cumulativeAngle;
      cumulativeAngle += pct * 360;
      return { ...s, pct, startAngle: start, sweepAngle: pct * 360 };
    });

  function arcPath(cx, cy, r, startDeg, sweepDeg) {
    const toRad = (d) => (d - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(startDeg + sweepDeg));
    const y2 = cy + r * Math.sin(toRad(startDeg + sweepDeg));
    const large = sweepDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="sc" style={{ marginBottom:"1.1rem" }}>
      <h4>Subject Distribution</h4>
      {slices.length === 0 ? (
        <p className="log-empty">No subject hours logged yet.</p>
      ) : (
        <div className="pie-wrap">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={120} height={120} style={{ flexShrink:0 }}>
            {slices.map((s) => (
              <path
                key={s.id}
                d={arcPath(CX, CY, R, s.startAngle, s.sweepAngle)}
                fill={s.color}
                opacity={.85}
                stroke="var(--bg)"
                strokeWidth={1}
              />
            ))}
            <circle cx={CX} cy={CY} r={18} fill="var(--card)" />
          </svg>
          <div className="pie-legend">
            {slices.map((s) => (
              <div className="pie-item" key={s.id}>
                <span className="pie-dot" style={{ background:s.color }} />
                <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</span>
                <span style={{ fontFamily:"var(--mono)", fontSize:".7rem", color:"var(--muted)", flexShrink:0 }}>
                  {(s.pct*100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
