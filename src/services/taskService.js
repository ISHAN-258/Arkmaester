// ── Task Service ─────────────────────────────────────────────────────────
import { storageGet, storageSet, KEYS } from "../utils/storage.js";
import { DEF_TASKS } from "../utils/constants.js";

export async function getTasks() {
  return storageGet(KEYS.TASKS, DEF_TASKS);
}

export async function saveTasks(tasks) {
  await storageSet(KEYS.TASKS, tasks);
  return tasks;
}
