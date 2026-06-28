import { useEffect } from "react";

/**
 * Global keyboard shortcuts for Arkmaester.
 * Skips if focus is inside an input / textarea.
 */
export function useKeyboardShortcuts({ timerState, setPage }) {
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          timerState.toggleTimer();
          break;
        case "r":
        case "R":
          timerState.resetTimer();
          break;
        case "s":
        case "S":
          timerState.skipMode();
          break;
        case "1": setPage("home");     break;
        case "2": setPage("study");    break;
        case "3": setPage("tracker");  break;
        case "4": setPage("planner");  break;
        case "5": setPage("insights"); break;
        case "6": setPage("history");  break;
        case "7": setPage("chat");     break;
        default: break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [timerState, setPage]);
}
