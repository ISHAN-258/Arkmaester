export const KEYS = {
  TASKS: "ef:tasks",
  SUBJECTS: "ef:subjects",
  SESSION_LOG: "ef:log",
  STUDIED_DAYS: "ef:studied_days",
  POMO_MINS: "ef:pomo_mins",
  SOUND: "ef:sound",
  DAILY_GOAL: "ef:daily_goal",
  WEEKLY_GOAL: "ef:weekly_goal",
  DISTRACTION_LOG: "ef:distraction_log",
};

const hasWindowStorage = typeof window !== "undefined" && typeof (window as any).storage !== "undefined";

export async function storageGet<T>(key: string, defaultVal: T): Promise<T> {
  if (hasWindowStorage) {
    try {
      const val = (window as any).storage.getItem(key);
      if (val !== null && val !== undefined) {
        return JSON.parse(val);
      }
    } catch (e) {
      console.error("storageGet window.storage error:", e);
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    try {
      const val = localStorage.getItem(key);
      if (val !== null && val !== undefined) {
        return JSON.parse(val);
      }
    } catch (e) {
      console.error("storageGet localStorage error:", e);
    }
  }

  return defaultVal;
}

export async function storageSet<T>(key: string, val: T): Promise<void> {
  const str = JSON.stringify(val);

  if (hasWindowStorage) {
    try {
      (window as any).storage.setItem(key, str);
      return;
    } catch (e) {
      console.error("storageSet window.storage error:", e);
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, str);
    } catch (e) {
      console.error("storageSet localStorage error:", e);
    }
  }
}
