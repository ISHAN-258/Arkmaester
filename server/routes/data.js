import { Router } from "express";
import { getDb } from "../db.js";

const router = Router();
const COLLECTION = "appdata";

/** Allowed storage keys (matches src/utils/storage.js KEYS) */
const ALLOWED_KEYS = new Set([
  "tasks",
  "subjects",
  "sessions",
  "studied_days",
  "pomo_mins",
  "theme",
  "sound",
  "daily_goal",
  "weekly_goal",
  "distractions",
  "tomorrow_plan",
  "onboarded",
  "username",
]);

function assertKey(key) {
  if (!ALLOWED_KEYS.has(key)) {
    const err = new Error(`Unknown storage key: ${key}`);
    err.status = 400;
    throw err;
  }
}

/** GET /api/data/:key — returns { key, value } (value null if missing) */
router.get("/:key", async (req, res, next) => {
  try {
    assertKey(req.params.key);
    const doc = await getDb()
      .collection(COLLECTION)
      .findOne({ key: req.params.key });
    res.json({ key: req.params.key, value: doc?.value ?? null });
  } catch (err) {
    next(err);
  }
});

/** PUT /api/data/:key — body: { value } */
router.put("/:key", async (req, res, next) => {
  try {
    assertKey(req.params.key);
    if (!("value" in req.body)) {
      return res.status(400).json({ error: "Request body must include 'value'" });
    }
    const { value } = req.body;
    await getDb().collection(COLLECTION).updateOne(
      { key: req.params.key },
      { $set: { key: req.params.key, value, updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ key: req.params.key, value });
  } catch (err) {
    next(err);
  }
});

export default router;
