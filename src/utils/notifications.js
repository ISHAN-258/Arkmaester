// ── Browser Notifications ─────────────────────────────────────────────────

export async function requestNotifPermission() {
  if ("Notification" in window && Notification.permission === "default")
    await Notification.requestPermission();
}

export function sendNotif(title, body) {
  if ("Notification" in window && Notification.permission === "granted")
    try { new Notification(title, { body, silent: true }); } catch {}
}

export function getNotifPermission() {
  return "Notification" in window ? Notification.permission : "denied";
}

// ── Scheduled daily planning notification ────────────────────────────────
let _planningTimer = null;

/**
 * Schedule an evening planning reminder at targetHour (default 21 = 9PM).
 * Fires once per day; clears itself after firing.
 */
export function schedulePlanningReminder(targetHour = 21, onFire) {
  if (_planningTimer) clearTimeout(_planningTimer);
  const now = new Date();
  const target = new Date();
  target.setHours(targetHour, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1); // tomorrow
  const ms = target - now;
  _planningTimer = setTimeout(() => {
    sendNotif("📋 Plan Tomorrow", "Take 2 minutes to set tomorrow's tasks in Arkmaester.");
    if (typeof onFire === "function") onFire();
    _planningTimer = null;
  }, ms);
}

export function clearPlanningReminder() {
  if (_planningTimer) clearTimeout(_planningTimer);
  _planningTimer = null;
}

// ── Morning schedule notification ─────────────────────────────────────────
let _morningTimer = null;

export function scheduleMorningReminder(targetHour = 8, tasks = [], onFire) {
  if (_morningTimer) clearTimeout(_morningTimer);
  const now = new Date();
  const target = new Date();
  target.setHours(targetHour, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const ms = target - now;
  _morningTimer = setTimeout(() => {
    const count = tasks.length;
    sendNotif(
      "☀️ Today's Plan Ready",
      count > 0 ? `You have ${count} task${count > 1 ? "s" : ""} planned for today.` : "Start your study session!"
    );
    if (typeof onFire === "function") onFire();
    _morningTimer = null;
  }, ms);
}

export function clearMorningReminder() {
  if (_morningTimer) clearTimeout(_morningTimer);
  _morningTimer = null;
}
