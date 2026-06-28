import { useMemo } from "react";
import { generateInsights, generateWeeklySummary } from "../utils/analytics";

export function useAnalytics(sessionLog: any[], distractionLog: any[], streak: number, subjects: any[]) {
  const insights = useMemo(() => {
    return generateInsights(sessionLog, distractionLog, streak, subjects);
  }, [sessionLog, distractionLog, streak, subjects]);

  const weeklyReport = useMemo(() => {
    return generateWeeklySummary(sessionLog);
  }, [sessionLog]);

  return {
    insights,
    weeklyReport,
  };
}
