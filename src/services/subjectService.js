// ── Subject Service ───────────────────────────────────────────────────────
import { storageGet, storageSet, KEYS } from "../utils/storage.js";
import { DEF_SUBJ } from "../utils/constants.js";

export async function getSubjects() {
  return storageGet(KEYS.SUBJECTS, DEF_SUBJ);
}

export async function saveSubjects(subjects) {
  await storageSet(KEYS.SUBJECTS, subjects);
  return subjects;
}
