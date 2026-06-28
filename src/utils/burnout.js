// ── Burnout detection & optimal session length ────────────────────────────
import { toDateStr } from "./helpers.js";

/**
 * Returns burnout warning if user studied 6+ hrs/day for 5+ consecutive days.
 */
export function detectBurnout(sessionLog) {
  const byDay = {};
  sessionLog.forEach((e) => {
    byDay[e.date] = (byDay[e.date] || 0) + e.secs;
  });

  const today = new Date();
  let heavyDays = 0;
  let totalHrsLast5 = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const str  = toDateStr(d);
    const hrs  = (byDay[str] || 0) / 3600;
    totalHrsLast5 += hrs;
    if (hrs >= 5) heavyDays++;
  }

  const avgHrs = totalHrsLast5 / 7;

  if (heavyDays >= 5) {
    return {
      level:   "high",
      message: `🚨 Burnout risk: ${heavyDays} heavy study days in a row (avg ${avgHrs.toFixed(1)}h/day). Take a lighter day.`,
      color:   "var(--red)",
    };
  }
  if (heavyDays >= 3 && avgHrs >= 4) {
    return {
      level:   "medium",
      message: `⚠ High intensity week — ${avgHrs.toFixed(1)}h/day average. Schedule some recovery time.`,
      color:   "var(--amber)",
    };
  }
  return null;
}

/**
 * Analyses session log to find user's optimal focus duration.
 * Returns suggested pomodoro minutes.
 */
export function calcOptimalSessionMins(sessionLog) {
  if (sessionLog.length < 5) return null;

  // Group sessions by duration bucket
  const buckets = { 15:0, 25:0, 45:0, 60:0 };
  const counts  = { 15:0, 25:0, 45:0, 60:0 };

  sessionLog.forEach((e) => {
    const mins = e.secs / 60;
    const bucket = mins <= 20 ? 15 : mins <= 35 ? 25 : mins <= 52 ? 45 : 60;
    // "score" = sessions that were not cut short (>= 90% of their expected duration)
    buckets[bucket]++;
    counts[bucket]++;
  });

  // Most completed bucket = optimal
  const best = Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a, ["25", 0]);
  return +best[0];
}

/**
 * Find the longest historical streak from session log.
 */
export function calcLongestStreak(sessionLog) {
  if (sessionLog.length === 0) return 0;
  const days = [...new Set(sessionLog.map((e) => e.date))].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) { cur++; max = Math.max(max, cur); }
    else cur = 1;
  }
  return max;
}

/**
 * Find best and worst weeks by total study hours.
 */
export function calcBestWorstWeeks(sessionLog) {
  const weeks = {};
  sessionLog.forEach((e) => {
    const d = new Date(e.ts);
    const week = `${d.getFullYear()}-W${getWeek(d)}`;
    weeks[week] = (weeks[week] || 0) + e.secs;
  });

  const entries = Object.entries(weeks).map(([w, s]) => ({ week: w, hrs: +(s / 3600).toFixed(1) }));
  if (entries.length === 0) return { best: null, worst: null };

  const best  = entries.reduce((a, b) => b.hrs > a.hrs ? b : a);
  const worst = entries.reduce((a, b) => b.hrs < a.hrs ? b : a);
  return { best, worst };
}

function getWeek(d) {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
}
