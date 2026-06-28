// ── Planner utilities ─────────────────────────────────────────────────────
import { todayStr } from "./helpers.js";

// ── Adaptive rescheduling — move overdue tasks to today ───────────────────
export function rescheduleOverdueTasks(tasks) {
  const today = todayStr();
  return tasks.map((t) => {
    if (!t.done && t.dueDate && t.dueDate < today)
      return { ...t, dueDate: today, rescheduled: true };
    return t;
  });
}

// ── Voice → short task title ───────────────────────────────────────────────
const FILLER_PREFIX =
  /^(please\s+)?(can you\s+)?(could you\s+)?(i need to|i have to|i want to|i should|i must|remind me to|don't forget to|make sure to|add a task to|add task to|add a|add)\s+/i;

const FILLER_WORDS = /\b(um+|uh+|uhm+|like|you know|basically|actually|just|really|kind of|sort of)\b/gi;
const TIME_FILLER = /\b(for today|tomorrow|this evening|later today|right now|as soon as possible)\b/gi;
const WEAK_END = new Set(["the", "a", "an", "and", "or", "to", "for", "of", "on", "in", "at", "my", "the"]);

/**
 * Turn a full spoken phrase into a short, task-board-style title.
 */
export function summarizeToTaskTitle(raw) {
  if (!raw?.trim()) return "";

  let s = raw.trim().replace(/\s+/g, " ");
  s = s.replace(/^(um+|uh+|uhm+)\s+/i, "").trim();

  let guard = 0;
  while (FILLER_PREFIX.test(s) && guard++ < 8) {
    s = s.replace(FILLER_PREFIX, "").trim();
  }

  s = s
    .replace(FILLER_WORDS, " ")
    .replace(TIME_FILLER, " ")
    .replace(/\b(so that|because|since|in order to)\b.+$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  // Normalize spoken numbers
  s = s
    .replace(/\bten\b/gi, "10")
    .replace(/\bfive\b/gi, "5")
    .replace(/\bthree\b/gi, "3");

  const words = s.split(/\s+/).filter(Boolean);
  while (words.length > 1 && WEAK_END.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }

  const maxWords = 8;
  const maxLen = 52;
  let title = words.slice(0, maxWords).join(" ");
  if (title.length > maxLen) {
    title = title.slice(0, maxLen).replace(/\s+\S*$/, "").trim();
  }

  return cap(title || raw.trim().slice(0, maxLen));
}

function splitVoiceSegments(text) {
  return text
    .replace(/\band then\b/gi, ".")
    .replace(/\balso\b/gi, ".")
    .replace(/\bthen\b/gi, ".")
    .replace(/\bafter that\b/gi, ".")
    .split(/[.,;!?]+|\s+and\s+|\s+then\s+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

// ── Voice input parser — extract titled tasks from raw speech text ─────────
export function parseVoiceInput(text) {
  if (!text?.trim()) return [];

  const normalized = text.trim().replace(/\s+/g, " ");
  const segments = splitVoiceSegments(normalized);
  const items = segments.length > 0 ? segments : [normalized];

  return items
    .map((segment, i) => {
      const originalText = segment.trim();
      const title = summarizeToTaskTitle(originalText);
      return {
        id: Date.now() + i,
        text: title,
        originalText,
        done: false,
        priority: detectPriority(originalText),
        source: "voice",
        estimatedMins: detectDuration(originalText),
        dueDate: todayStr(),
      };
    })
    .filter((t) => t.text.length > 0);
}

function detectPriority(text) {
  const t = text.toLowerCase();
  if (/urgent|important|must|critical|asap/.test(t)) return "high";
  if (/maybe|optional|if time|whenever/.test(t))      return "low";
  return "medium";
}

function detectDuration(text) {
  const match = text.match(/(\d+)\s*(min|hour|hr)/i);
  if (!match) return 30;
  const n = parseInt(match[1]);
  return /hour|hr/i.test(match[2]) ? n * 60 : n;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Tomorrow plan template ─────────────────────────────────────────────────
export function buildTomorrowPlan(tasks, subjects) {
  const pending = tasks.filter((t) => !t.done);
  const high    = pending.filter((t) => t.priority === "high");
  const medium  = pending.filter((t) => t.priority === "medium");
  const low     = pending.filter((t) => t.priority === "low");

  return {
    high:   high.slice(0, 3),
    medium: medium.slice(0, 3),
    low:    low.slice(0, 2),
    total:  pending.length,
    created: new Date().toISOString(),
  };
}

// ── Sort tasks by smart priority ──────────────────────────────────────────
export function sortTasksSmart(tasks) {
  const weights = { high:3, medium:2, low:1 };
  return [...tasks].sort((a, b) => {
    // Done items sink to bottom
    if (a.done !== b.done) return a.done ? 1 : -1;
    // Priority weight
    const pw = (weights[b.priority]||1) - (weights[a.priority]||1);
    if (pw !== 0) return pw;
    // Earlier due date wins
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    return 0;
  });
}
