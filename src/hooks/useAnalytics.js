import { useMemo } from "react";
import {
  buildWeeklyData, buildPeakHours, buildHeatmapData,
  generateInsights, calcHealthScore, generateWeeklySummary,
} from "../utils/analytics.js";
import { todayStr } from "../utils/helpers.js";

export function useAnalytics({ sessionLog, subjects, streak, distractionLog = [] }) {
  const weeklyData = useMemo(() => buildWeeklyData(sessionLog), [sessionLog]);
  const peakHours  = useMemo(() => buildPeakHours(sessionLog),  [sessionLog]);
  const heatmap    = useMemo(() => buildHeatmapData(sessionLog), [sessionLog]);

  const totalSecs     = useMemo(() => sessionLog.reduce((a, e) => a + e.secs, 0), [sessionLog]);
  const totalSessions = useMemo(() => sessionLog.length, [sessionLog]);

  const todayStudiedHrs = useMemo(() => {
    const today = todayStr();
    return sessionLog.filter((e) => e.date === today).reduce((a, e) => a + e.secs, 0) / 3600;
  }, [sessionLog]);

  const weeklyStudiedHrs = useMemo(() => weeklyData.reduce((a, d) => a + d.hours, 0), [weeklyData]);

  const insights = useMemo(
    () => generateInsights({ peakHours, weeklyData, sessionLog, streak, distractionLog }),
    [peakHours, weeklyData, sessionLog, streak, distractionLog]
  );

  const weeklySummary = useMemo(
    () => generateWeeklySummary({ weeklyData, sessionLog, subjects, streak, distractionLog }),
    [weeklyData, sessionLog, subjects, streak, distractionLog]
  );

  const todayDistractions = useMemo(() => {
    const today = todayStr();
    return distractionLog.filter((d) => {
      const ds = new Date(d.ts).toISOString().slice(0, 10);
      return ds === today;
    });
  }, [distractionLog]);

  const avgPosture = useMemo(() => {
    // estimate from session log metadata if available
    const withPosture = sessionLog.filter((e) => e.avgPosture !== undefined);
    if (withPosture.length === 0) return null;
    return Math.round(withPosture.reduce((a, e) => a + e.avgPosture, 0) / withPosture.length);
  }, [sessionLog]);

  const healthScore = useMemo(() => calcHealthScore({
    avgPosture,
    avgFocus:           null,
    streak,
    distractionsToday: todayDistractions.length,
    sessionsToday:     sessionLog.filter((e) => e.date === todayStr()).length,
  }), [avgPosture, streak, todayDistractions, sessionLog]);

  return {
    weeklyData, peakHours, heatmap,
    totalSecs, totalSessions,
    todayStudiedHrs, weeklyStudiedHrs,
    insights, weeklySummary,
    todayDistractions, healthScore, avgPosture,
  };
}
