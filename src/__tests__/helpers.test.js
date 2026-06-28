import { describe, it, expect } from "vitest";
import { fmtTime, fmtDuration, clamp, uid, ordinal, todayStr } from "../utils/helpers.js";

describe("fmtTime", () => {
  it("formats 0 as 00:00", ()  => expect(fmtTime(0)).toBe("00:00"));
  it("formats 65s as 01:05",   () => expect(fmtTime(65)).toBe("01:05"));
  it("formats 3600s as 60:00", () => expect(fmtTime(3600)).toBe("60:00"));
});

describe("fmtDuration", () => {
  it("formats 3661s as 1h 1m",  () => expect(fmtDuration(3661)).toBe("1h 1m"));
  it("formats 0s as 0h 0m",     () => expect(fmtDuration(0)).toBe("0h 0m"));
  it("formats 7200s as 2h 0m",  () => expect(fmtDuration(7200)).toBe("2h 0m"));
});

describe("clamp", () => {
  it("clamps below min", () => expect(clamp(-5, 0, 100)).toBe(0));
  it("clamps above max", () => expect(clamp(150, 0, 100)).toBe(100));
  it("passes through",   () => expect(clamp(50, 0, 100)).toBe(50));
});

describe("uid", () => {
  it("generates unique ids", () => {
    const a = uid(), b = uid();
    expect(a).not.toBe(b);
  });
});

describe("ordinal", () => {
  it("1st", () => expect(ordinal(1)).toBe("1st"));
  it("2nd", () => expect(ordinal(2)).toBe("2nd"));
  it("3rd", () => expect(ordinal(3)).toBe("3rd"));
  it("4th", () => expect(ordinal(4)).toBe("4th"));
  it("11th", () => expect(ordinal(11)).toBe("11th"));
  it("21st", () => expect(ordinal(21)).toBe("21st"));
});

describe("todayStr", () => {
  it("returns YYYY-MM-DD format", () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
