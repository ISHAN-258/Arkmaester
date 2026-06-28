import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  timerState: any;
  setPage: (p: string) => void;
}

export function useKeyboardShortcuts({ timerState, setPage }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard Check: Skip hotkeys if focused on input fields
      const activeEl = document.activeElement;
      if (activeEl) {
        const tag = activeEl.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || activeEl.hasAttribute("contenteditable")) {
          return;
        }
      }

      const key = e.key.toLowerCase();
      const ctrlAlt = e.ctrlKey && e.altKey;

      // 1. Hot Navigation Shortcuts
      if (ctrlAlt) {
        if (key === "s") {
          e.preventDefault();
          setPage("study");
        } else if (key === "t") {
          e.preventDefault();
          setPage("tracker");
        } else if (key === "p") {
          e.preventDefault();
          setPage("planner");
        } else if (key === "i") {
          e.preventDefault();
          setPage("insights");
        } else if (key === "h") {
          e.preventDefault();
          setPage("history");
        } else if (key === "c") {
          e.preventDefault();
          setPage("chat");
        } else if (key === "o") {
          e.preventDefault();
          setPage("home");
        }
      }

      // 2. Play / Pause Control
      if (e.key === " ") {
        e.preventDefault();
        if (timerState.isActive) {
          timerState.pauseTimer();
        } else {
          timerState.startTimer();
        }
      }

      // 3. Reset Option
      if (e.key === "Escape") {
        e.preventDefault();
        timerState.resetTimer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [timerState, setPage]);
}
export type KeyboardShortcutsState = ReturnType<typeof useKeyboardShortcuts>;
