// ── Analytics & AI Insight Engine ────────────────────────────────────────
import { last7Days, last28Days, toDateStr } from "./helpers.js";
import { HEALTH_WEIGHTS } from "./constants.js";

// ── Weekly data from session log ──────────────────────────────────────────
export function buildWeeklyData(sessionLog) {
  const days = last7Days();
  return days.map(({ str, label }) => {
    const secs = sessionLog
      .filter((e) => e.date === str)
      .reduce((a, e) => a + e.secs, 0);
    return { label, hours: +(secs / 3600).toFixed(1), date: str };
  });
}

// ── 24-hour peak hours array ──────────────────────────────────────────────
export function buildPeakHours(sessionLog) {
  const arr = new Array(24).fill(0);
  sessionLog.forEach((e) => {
    if (e.hour >= 0 && e.hour < 24) arr[e.hour] += e.secs;
  });
  return arr;
}

// ── Subject hours mapping ─────────────────────────────────────────────────
export function enrichSubjectsWithHours(subjects, sessionLog) {
  return subjects.map((s) => {
    const loggedSecs = sessionLog
      .filter((e) => e.subjId === s.id)
      .reduce((a, e) => a + e.secs, 0);
    return { ...s, hours: +(s.manualHours + loggedSecs / 3600).toFixed(2) };
  });
}

// ── 28-day heatmap data ───────────────────────────────────────────────────
export function buildHeatmapData(sessionLog) {
  const days = last28Days();
  return days.map(({ str, label, date }) => {
    const secs = sessionLog.filter((e) => e.date === str).reduce((a, e) => a + e.secs, 0);
    const hours = +(secs / 3600).toFixed(1);
    return { date: str, label, hours, intensity: Math.min(4, Math.floor(hours / 0.75)) };
  });
}

// ── Distraction timeline ──────────────────────────────────────────────────
export function buildDistractionTimeline(distractionLog) {
  return [...distractionLog]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 50)
    .map((d) => ({
      ...d,
      timeStr: new Date(d.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      dateStr: new Date(d.ts).toLocaleDateString([], { month: "short", day: "numeric" }),
    }));
}

// ── Study Health Score (0–100) ────────────────────────────────────────────
export function calcHealthScore({ avgPosture, avgFocus, streak, distractionsToday, sessionsToday }) {
  const postureScore    = Math.min(100, avgPosture  ?? 50);
  const focusScore      = Math.min(100, avgFocus    ?? 50);
  const consistencyScore= Math.min(100, streak * 10);
  const distractionScore= Math.max(0, 100 - (distractionsToday ?? 0) * 10);

  return Math.round(
    postureScore     * HEALTH_WEIGHTS.posture     +
    focusScore       * HEALTH_WEIGHTS.focus       +
    consistencyScore * HEALTH_WEIGHTS.consistency +
    distractionScore * HEALTH_WEIGHTS.distraction
  );
}

export function healthScoreLabel(score) {
  if (score >= 85) return { label: "Excellent", color: "var(--green)" };
  if (score >= 70) return { label: "Good",      color: "var(--cyan)"  };
  if (score >= 50) return { label: "Fair",      color: "var(--amber)" };
  return             { label: "Needs Work",     color: "var(--red)"   };
}

// ── AI Productivity Insights ──────────────────────────────────────────────
export function generateInsights({ peakHours, weeklyData, sessionLog, streak, distractionLog = [] }) {
  const insights = [];

  // Peak hour insight
  const maxHourSecs = Math.max(...peakHours);
  if (maxHourSecs > 0) {
    const peakHour = peakHours.indexOf(maxHourSecs);
    const period   = peakHour < 12 ? "morning" : peakHour < 17 ? "afternoon" : "night";
    insights.push({
      icon: "🕐",
      text: `You focus best during the ${period} — peak hour is ${peakHour}:00–${peakHour+1}:00.`,
      type: "positive",
    });
  }

  // Best day of week
  const dayTotals = new Array(7).fill(0);
  sessionLog.forEach((e) => {
    const day = new Date(e.ts).getDay();
    dayTotals[day] += e.secs;
  });
  const bestDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
  const dayNames   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  if (dayTotals[bestDayIdx] > 0)
    insights.push({ icon: "📅", text: `Your best study day is ${dayNames[bestDayIdx]}.`, type: "positive" });

  // Streak insight
  if (streak >= 7)
    insights.push({ icon: "🔥", text: `${streak}-day streak! Consistency is your superpower.`, type: "positive" });
  else if (streak === 0)
    insights.push({ icon: "⚠️", text: "Arkmaester recommends starting a session today. Start a session to keep your streak alive.", type: "warning" });

  // Distraction pattern
  if (distractionLog.length >= 3) {
    const phoneEvents   = distractionLog.filter((d) => d.type === "phone").length;
    const postureEvents = distractionLog.filter((d) => d.type === "posture").length;
    if (phoneEvents > postureEvents)
      insights.push({ icon: "📵", text: `Phone distractions are your #1 issue (${phoneEvents} events). Try placing phone face-down.`, type: "warning" });
    else if (postureEvents > 0)
      insights.push({ icon: "🧍", text: `Your posture tends to drop after long sessions. Set a 30-min posture reminder.`, type: "warning" });
  }

  // Weekly trend
  const thisWeek = weeklyData.reduce((a, d) => a + d.hours, 0);
  if (thisWeek >= 10)
    insights.push({ icon: "📈", text: `Strong week — ${thisWeek.toFixed(1)}h logged. Keep the momentum.`, type: "positive" });
  else if (thisWeek < 2 && sessionLog.length > 0)
    insights.push({ icon: "📉", text: `Only ${thisWeek.toFixed(1)}h this week. Try adding one more 25-min session daily.`, type: "warning" });

  // Session length pattern — posture note
  const longSessions = sessionLog.filter((e) => e.secs >= 45 * 60);
  if (longSessions.length >= 3)
    insights.push({ icon: "💡", text: "Arkmaester notes you often study 45+ min without break. Posture tends to drop — consider shorter pomodoros.", type: "info" });

  // Fallback
  if (insights.length === 0)
    insights.push({ icon: "🚀", text: "Arkmaester needs more session data — complete more sessions to unlock personalised AI insights.", type: "info" });

  return insights;
}

// ── Smart Break Suggestions ───────────────────────────────────────────────
export function generateBreakSuggestion({ sessionCount, avgPosture, avgFocus, elapsedMins }) {
  if (sessionCount > 0 && sessionCount % 4 === 0)
    return { msg: `You've completed ${sessionCount} sessions — take a 15-min long break.`, type: "long" };
  if (avgPosture !== null && avgPosture < 55)
    return { msg: "Posture score is low. Stand up, stretch your back for 2 minutes.", type: "posture" };
  if (avgFocus !== null && avgFocus < 50)
    return { msg: "Focus score dropping — splash water on your face and refocus.", type: "focus" };
  if (elapsedMins >= 50)
    return { msg: `${Math.round(elapsedMins)} min active — recommended 5-min break.`, type: "time" };
  return null;
}

// ── Smart Routine Generator ────────────────────────────────────────────────
export function generateRoutine(tasks, freeHours = 6, peakHour = 10) {
  if (!tasks || tasks.length === 0) return [];

  const priorities = { high: 3, medium: 2, low: 1 };
  const sorted = [...tasks]
    .filter((t) => !t.done)
    .sort((a, b) => (priorities[b.priority] ?? 1) - (priorities[a.priority] ?? 1));

  const routine = [];
  let currentHour = Math.max(7, peakHour - 2); // start 2h before peak
  let remainingMins = freeHours * 60;

  sorted.forEach((task) => {
    if (remainingMins <= 0) return;
    const dur = task.estimatedMins || 30;
    routine.push({
      task,
      startHour: currentHour,
      startMin: 0,
      durationMins: Math.min(dur, remainingMins),
      label: `${String(currentHour).padStart(2,"0")}:00`,
      isPeak: currentHour === peakHour,
    });
    const totalMins = dur + 5; // 5 min buffer
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    currentHour += h + (m > 0 ? 1 : 0);
    remainingMins -= totalMins;
  });

  return routine;
}

// ── Weekly AI Summary ──────────────────────────────────────────────────────
export function generateWeeklySummary({ weeklyData, sessionLog, subjects, streak, distractionLog = [] }) {
  const totalHrs   = weeklyData.reduce((a, d) => a + d.hours, 0);
  const sessions   = sessionLog.filter((e) => {
    const d = new Date(e.ts);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;
  const bestDay    = weeklyData.reduce((a, b) => a.hours >= b.hours ? a : b, { hours: 0, label: "—" });
  const topSubj    = subjects.length > 0 ? subjects.reduce((a, b) => a.hours >= b.hours ? a : b) : null;
  const distracts  = distractionLog.filter((d) => { const w = new Date(); w.setDate(w.getDate()-7); return new Date(d.ts) >= w; }).length;

  return {
    totalHrs:    +totalHrs.toFixed(1),
    sessions,
    bestDay:     bestDay.label,
    topSubject:  topSubj?.name ?? "—",
    streak,
    distractions: distracts,
    rating:      totalHrs >= 15 ? "🏆 Excellent" : totalHrs >= 8 ? "✅ Good" : totalHrs >= 3 ? "⚠️ Fair" : "📉 Low",
    aiComment: totalHrs >= 15
      ? "Arkmaester recommends maintaining this outstanding rhythm."
      : totalHrs >= 8
      ? "Arkmaester recommends one extra session next week to compound progress."
      : "Arkmaester observes low activity — increase daily sessions to hit your goals.",
  };
}
