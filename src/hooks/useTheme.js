import { useState, useEffect } from "react";
import { storageGet, storageSet, KEYS } from "../utils/storage.js";

export const THEMES = [
  { id:"dark",  label:"🌙 Dark",  cls:""      },
  { id:"oled",  label:"⚫ OLED",  cls:"oled"  },
  { id:"light", label:"☀ Light", cls:"light" },
];

function applyTheme(t) {
  document.body.className = THEMES.find((x) => x.id === t)?.cls ?? "";
}

export function useTheme() {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    storageGet(KEYS.THEME, "dark").then((t) => {
      setThemeState(t);
      applyTheme(t);
    });
  }, []);

  const setTheme = (t) => {
    setThemeState(t);
    applyTheme(t);
    void storageSet(KEYS.THEME, t);
  };

  const cycleTheme = () => {
    setThemeState((prev) => {
      const idx  = THEMES.findIndex((x) => x.id === prev);
      const next = THEMES[(idx + 1) % THEMES.length].id;
      applyTheme(next);
      void storageSet(KEYS.THEME, next);
      return next;
    });
  };

  return { theme, setTheme, cycleTheme, THEMES };
}
