import { todayStr, getSubjectName } from "./helpers";

export interface AnalyticsSummary {
  totalSecs: number;
  totalHrs: number;
  averageSessionSecs: number;
  streak: number;
  subjectBreakdown: { name: string; hours: number; color: string }[];
  distractionCount: number;
}

export function enrichSubjectsWithHours(subjects: any[], sessionLog: any[]): any[] {
  return subjects.map((sub) => {
    const totalSecs = sessionLog
      .filter((e) => e.subjId === sub.id)
      .reduce((acc, e) => acc + e.secs, 0);
    return { ...sub, hours: Number((totalSecs / 3600).toFixed(1)) };
  });
}

export function generateInsights(sessionLog: any[], distractionLog: any[], streak: number, subjects: any[]): any[] {
  const insights: any[] = [];

  // Streak Insight
  if (streak > 0) {
    insights.push({
      id: "streak",
      icon: "🔥",
      text: `Arkmaester notes: ${streak}-day streak! Consistency is your superpower. Settle the score daily.`,
      type: "positive"
    });
  } else {
    insights.push({
      id: "no-streak",
      icon: "⚠️",
      text: "Arkmaester recommends: no study activity recorded today. Begin a Pomodoro block to ignite your streak!",
      type: "warning"
    });
  }

  // Peak Hours Insight
  if (sessionLog.length > 0) {
    // Collect peak hour
    const hourCounts: { [key: number]: number } = {};
    sessionLog.forEach((s) => {
      if (s.timestamp) {
        const h = new Date(s.timestamp).getHours();
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      }
    });

    let peakHour = 9; // default morning
    let maxCount = 0;
    Object.entries(hourCounts).forEach(([h, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(h);
      }
    });

    const period = peakHour >= 12 ? "afternoon/evening" : "morning";
    insights.push({
      id: "peak-hour",
      icon: "🕐",
      text: `Arkmaester has observed: you focus best during the ${period} — peak session activation hour is ${peakHour}:00–${peakHour + 1}:00.`,
      type: "positive"
    });
  } else {
    insights.push({
      id: "no-sessions",
      icon: "ℹ️",
      text: "Arkmaester has observed: insufficient data logged yet. Complete standard study blocks to feed the intelligence engine.",
      type: "info"
    });
  }

  // Distraction alerts
  if (distractionLog.length > 5) {
    insights.push({
      id: "distractions",
      icon: "⚠️",
      text: `Arkmaester warns: we flagged ${distractionLog.length} distraction incidents. Consider locking phone posture guard controls.`,
      type: "warning"
    });
  } else if (sessionLog.length >= 2) {
    insights.push({
      id: "no-distractions",
      icon: "🛡️",
      text: "Arkmaester observes: excellent posture control and minimal phone pickups. Keep your focus shield active!",
      type: "positive"
    });
  }

  return insights;
}

export function generateWeeklySummary(sessionLog: any[]): any {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklySessions = sessionLog.filter((s) => {
    return new Date(s.timestamp || s.date) >= oneWeekAgo;
  });

  const totalSecs = weeklySessions.reduce((acc, s) => acc + s.secs, 0);
  const totalHrs = totalSecs / 3600;

  let aiComment = "Arkmaester recommends: Increase daily sessions to hit your study goals.";
  if (totalHrs >= 15) {
    aiComment = "Arkmaester says: Outstanding consistency! Maintain this rhythm.";
  } else if (totalHrs >= 8) {
    aiComment = "Arkmaester says: Solid effort. Push for one extra session next week.";
  }

  return {
    totalSecs,
    totalHrs: Number(totalHrs.toFixed(1)),
    avgSessionMins: weeklySessions.length > 0 ? Math.round((totalSecs / 60) / weeklySessions.length) : 0,
    sessionCount: weeklySessions.length,
    aiComment
  };
}
