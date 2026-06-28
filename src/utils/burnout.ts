export interface BurnoutAssessment {
  score: number;
  level: "Low" | "Moderate" | "High";
  advice: string;
}

export function assessBurnoutRisk(sessionLog: any[], distractionLog: any[]): BurnoutAssessment {
  let score = 0;

  // 1. Study Hours factor (more than 10 hours in past 2 days = +score)
  const today = new Date();
  const past2DaysLog = sessionLog.filter((s) => {
    const sDate = new Date(s.date);
    const diffTime = Math.abs(today.getTime() - sDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  });

  const recentSecs = past2DaysLog.reduce((acc, s) => acc + s.secs, 0);
  const recentHrs = recentSecs / 3600;

  if (recentHrs > 14) {
    score += 40;
  } else if (recentHrs > 8) {
    score += 20;
  } else if (recentHrs > 4) {
    score += 10;
  }

  // 2. Continuous Sessions without breaks (sessions > 90 mins = +score)
  const extraLongSessions = sessionLog.filter((s) => s.secs > 5400).length;
  score += Math.min(30, extraLongSessions * 10);

  // 3. Distractions factor (high distraction events recently)
  const recentDistractions = distractionLog.length;
  score += Math.min(30, recentDistractions * 5);

  score = Math.min(100, score);

  let level: "Low" | "Moderate" | "High" = "Low";
  let advice = "Your study routine looks healthy and highly sustainable. Keep up the rhythm!";

  if (score >= 70) {
    level = "High";
    advice = "Arkmaester warning: severe burnout risk! Settle the score, but conquer the chaos. Reduce study blocks to 25 mins and take a full rest day.";
  } else if (score >= 35) {
    level = "Moderate";
    advice = "Moderate mental fatigue detected. Take a 10-minute synthesised binaural wave break and hydrate before your next block.";
  }

  return { score, level, advice };
}
