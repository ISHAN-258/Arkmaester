// ── Date & format helpers ─────────────────────────────────────────────────

export const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

export const todayStr = () => toDateStr(new Date());

export const last7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ str: toDateStr(d), label: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()] });
  }
  return days;
};

export const last28Days = () => {
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ str: toDateStr(d), label: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()], date: new Date(d) });
  }
  return days;
};

export const fmtTime = (secs) =>
  `${String(Math.floor(secs/60)).padStart(2,"0")}:${String(secs%60).padStart(2,"0")}`;

export const fmtDuration = (secs) =>
  `${Math.floor(secs/3600)}h ${Math.floor((secs%3600)/60)}m`;

export const fmtMins = (secs) => `${Math.round(secs/60)} min`;

export const fmtHours = (secs) => (secs/3600).toFixed(1)+"h";

export const dayLabel = (d) => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];

export const hourLabel = (h) => h < 12 ? `${h}AM` : h === 12 ? "12PM" : `${h-12}PM`;

/**
 * Returns the week number of the year for a given date.
 */
export const weekOfYear = (d) => {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
};

/**
 * Capitalise first letter.
 */
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Clamp a number between min and max.
 */
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/**
 * Debounce a function.
 */
export const debounce = (fn, ms) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

/**
 * Generate a unique ID.
 */
export const uid = () => Date.now() + Math.random().toString(36).slice(2, 6);

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export const ordinal = (n) => {
  const s = ["th","st","nd","rd"];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
};
