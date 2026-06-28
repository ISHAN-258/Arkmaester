import { describe, it, expect } from "vitest";
import { buildWeeklyData, buildPeakHours, calcHealthScore, generateInsights } from "../utils/analytics.js";
import { calcLongestStreak, detectBurnout, calcOptimalSessionMins } from "../utils/burnout.js";
import { todayStr } from "../utils/helpers.js";

const makeLog = (n, secsEach = 1500, daysAgo = 0) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return { id: i, ts: d.getTime(), date: todayStr(), hour: 10, secs: secsEach, subjId: null };
  });

describe("buildWeeklyData", () => {
  it("returns 7 days", () => {
    const data = buildWeeklyData([]);
    expect(data).toHaveLength(7);
  });

  it("sums session hours correctly", () => {
    const log = makeLog(2, 3600); // 2 × 1h sessions today
    const data = buildWeeklyData(log);
    const today = data[data.length - 1];
    expect(today.hours).toBe(2);
  });
});

describe("buildPeakHours", () => {
  it("returns 24-element array", () => {
    expect(buildPeakHours([])).toHaveLength(24);
  });

  it("accumulates by hour", () => {
    const log = [
      { ts: Date.now(), date: todayStr(), hour: 14, secs: 3600, subjId: null },
      { ts: Date.now(), date: todayStr(), hour: 14, secs: 1800, subjId: null },
    ];
    const hours = buildPeakHours(log);
    expect(hours[14]).toBe(5400);
  });
});

describe("calcHealthScore", () => {
  it("returns 0–100", () => {
    const score = calcHealthScore({ avgPosture: 80, avgFocus: 75, streak: 5, distractionsToday: 1, sessionsToday: 3 });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("perfect inputs → high score", () => {
    const score = calcHealthScore({ avgPosture: 100, avgFocus: 100, streak: 10, distractionsToday: 0, sessionsToday: 4 });
    expect(score).toBeGreaterThan(85);
  });
});

describe("calcLongestStreak", () => {
  it("returns 0 for empty log", () => {
    expect(calcLongestStreak([])).toBe(0);
  });

  it("counts consecutive days", () => {
    const base = new Date();
    const log = [0, 1, 2].map((i) => {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      return { ts: d.getTime(), date: str, secs: 1800, hour: 10, subjId: null };
    });
    expect(calcLongestStreak(log)).toBe(3);
  });
});

describe("detectBurnout", () => {
  it("returns null for empty log", () => {
    expect(detectBurnout([])).toBeNull();
  });

  it("detects high burnout after 5 heavy days", () => {
    const log = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      // 6h each day
      for (let j = 0; j < 4; j++)
        log.push({ ts: d.getTime(), date: str, secs: 5400, hour: 10, subjId: null });
    }
    const result = detectBurnout(log);
    expect(result).not.toBeNull();
    expect(result.level).toBe("high");
  });
});

describe("generateInsights", () => {
  it("returns at least 1 insight", () => {
    const insights = generateInsights({ peakHours: new Array(24).fill(0), weeklyData: [], sessionLog: [], streak: 0 });
    expect(insights.length).toBeGreaterThanOrEqual(1);
  });
});
