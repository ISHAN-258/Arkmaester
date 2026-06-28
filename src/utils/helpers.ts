export function todayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  if (h > 0) {
    return `${h}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function getSubjectColor(subjId: string | null, subjects: any[]): string {
  if (!subjId) return "#5a6a8a"; // Muted fallback
  const sub = subjects.find((s) => s.id === subjId);
  return sub ? sub.color : "#5a6a8a";
}

export function getSubjectName(subjId: string | null, subjects: any[]): string {
  if (!subjId) return "General Study";
  const sub = subjects.find((s) => s.id === subjId);
  return sub ? sub.name : "General Study";
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function getDayName(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[d.getDay()];
}

export function getDayOfMonth(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getDate();
}
