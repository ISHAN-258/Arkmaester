// ── Session Service — backed by storage.js (MongoDB via API when enabled) ─

import { storageGet, storageSet, KEYS } from "../utils/storage.js";

/**
 * Get all sessions for the current user.
 */
export async function getSessions() {
  return storageGet(KEYS.SESSION_LOG, []);
}

/**
 * Append a new session entry.
 */
export async function saveSession(entry) {
  const existing = await getSessions();
  const updated  = [...existing, entry];
  await storageSet(KEYS.SESSION_LOG, updated);
  return updated;
}

/**
 * Update notes on a session by id.
 */
export async function updateSessionNotes(id, notes) {
  const existing = await getSessions();
  const updated  = existing.map((s) => s.id === id ? { ...s, notes } : s);
  await storageSet(KEYS.SESSION_LOG, updated);
  return updated;
}

/**
 * Clear all sessions.
 */
export async function clearSessions() {
  await storageSet(KEYS.SESSION_LOG, []);
  return [];
}
