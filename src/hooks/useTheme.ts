import { useState, useEffect } from "react";
import { storageGet, storageSet } from "../utils/storage";

export function useTheme() {
  const [theme, setThemeState] = useState<string>("dark");

  useEffect(() => {
    storageGet("ef:theme", "dark").then((t) => {
      setThemeState(t);
      document.documentElement.setAttribute("data-theme", t);
    });
  }, []);

  const setTheme = (t: string) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    storageSet("ef:theme", t);
  };

  return { theme, setTheme };
}
