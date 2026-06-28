// ── Persistence: MongoDB Atlas (via API) + localStorage cache ─────────────
import env from "../config/env.js";

const PREFIX = "ark:";
const USE_API = env.USE_API;

function apiUrl(key) {
  const base = env.API_BASE_URL.replace(/\/$/, "");
  return `${base}/data/${encodeURIComponent(key)}`;
}

async function apiGet(key) {
  const res = await fetch(apiUrl(key));
  if (!res.ok) throw new Error(`GET ${key} failed: ${res.status}`);
  const { value } = await res.json();
  return value;
}

async function apiSet(key, value) {
  const res = await fetch(apiUrl(key), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `PUT ${key} failed: ${res.status}`);
  }
}

function hasLocal(key) {
  try {
    return localStorage.getItem(PREFIX + key) !== null;
  } catch {
    return false;
  }
}

function localGet(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function localSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage set failed:", key, e);
  }
}

/**
 * Get a value from Atlas (or localStorage fallback / one-time migration).
 */
export async function storageGet(key, fallback) {
  if (USE_API) {
    try {
      const value = await apiGet(key);
      if (value !== null) return value;

      // One-time: push existing browser data up to Atlas
      if (hasLocal(key)) {
        const local = localGet(key, fallback);
        await apiSet(key, local);
        if (import.meta.env.DEV) {
          console.info(`[arkmaester] Migrated "${key}" from localStorage → Atlas`);
        }
        return local;
      }
      return fallback;
    } catch (e) {
      console.warn("storageGet API failed, using localStorage:", key, e.message);
    }
  }
  return localGet(key, fallback);
}

/**
 * Save to Atlas (and mirror in localStorage as offline cache).
 */
export async function storageSet(key, value) {
  localSet(key, value);

  if (USE_API) {
    try {
      await apiSet(key, value);
      return;
    } catch (e) {
      console.error(`[arkmaester] Failed to save "${key}" to Atlas:`, e.message);
      throw e;
    }
  }
}

export async function storageDelete(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {}

  if (USE_API) {
    await apiSet(key, null);
  }
}

export function storageClear() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

export const KEYS = {
  TASKS:           "tasks",
  SUBJECTS:        "subjects",
  SESSION_LOG:     "sessions",
  STUDIED_DAYS:    "studied_days",
  POMO_MINS:       "pomo_mins",
  THEME:           "theme",
  SOUND:           "sound",
  DAILY_GOAL:      "daily_goal",
  WEEKLY_GOAL:     "weekly_goal",
  DISTRACTION_LOG: "distractions",
  TOMORROW_PLAN:   "tomorrow_plan",
  ONBOARDED:       "onboarded",
  USERNAME:        "username",
};
