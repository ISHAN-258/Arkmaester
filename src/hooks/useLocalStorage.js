import { useState, useEffect, useCallback } from "react";
import { storageGet, storageSet } from "../utils/storage.js";

/**
 * useState synced to localStorage.
 * Returns [value, setValue].
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValueState] = useState(() => {
    try {
      const raw = localStorage.getItem("ark:" + key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback((newVal) => {
    const resolved = typeof newVal === "function" ? newVal(value) : newVal;
    setValueState(resolved);
    storageSet(key, resolved);
  }, [key, value]);

  return [value, setValue];
}
