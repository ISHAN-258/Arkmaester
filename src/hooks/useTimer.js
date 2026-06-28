import { useState, useRef, useEffect, useCallback } from "react";
import { sfxTick, sfxSessionEnd, sfxBreakEnd } from "../utils/audio.js";
import { sendNotif } from "../utils/notifications.js";
import { todayStr } from "../utils/helpers.js";
import { ML, DEF_POMO_MINS } from "../utils/constants.js";

/**
 * Core Pomodoro timer logic extracted into a hook.
 * Calls onSessionComplete(entry) when a focus session finishes.
 */
export function useTimer({ pomoMins = DEF_POMO_MINS, activeSubjId = null, onSessionComplete }) {
  const [mode,    setModeState] = useState("focus");
  const [tl,      setTl]        = useState(pomoMins.focus * 60);
  const [running, setRunning]   = useState(false);

  const modeRef   = useRef("focus");
  const intervalRef = useRef(null);

  // Keep pomoMins current in closure
  const pomoRef = useRef(pomoMins);
  useEffect(() => { pomoRef.current = pomoMins; }, [pomoMins]);

  // Tick
  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setTl((t) => {
        if (t <= 6 && modeRef.current === "focus") sfxTick();
        if (t > 1) return t - 1;

        clearInterval(intervalRef.current);
        setRunning(false);

        const m = modeRef.current;
        if (m === "focus") {
          sfxSessionEnd();
          sendNotif("🎉 Session Done!", "Take a break — great work.");
          const focusSecs = pomoRef.current.focus * 60;
          const entry = {
            id:      Date.now(),
            date:    todayStr(),
            hour:    new Date().getHours(),
            subjId:  activeSubjId,
            secs:    focusSecs,
            ts:      Date.now(),
            notes:   "",
          };
          if (typeof onSessionComplete === "function") onSessionComplete(entry);
        } else {
          sfxBreakEnd();
          sendNotif("⏱ Break Over", "Back to work!");
        }
        return pomoRef.current[m] * 60;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, activeSubjId, onSessionComplete]);

  const setMode = useCallback((m) => {
    modeRef.current = m;
    setModeState(m);
    setTl(pomoRef.current[m] * 60);
    setRunning(false);
  }, []);

  const resetTimer  = useCallback(() => { setTl(pomoRef.current[modeRef.current] * 60); setRunning(false); }, []);
  const toggleTimer = useCallback(() => setRunning((r) => !r), []);
  const skipMode    = useCallback(() => {
    const next = modeRef.current === "focus" ? "short" : "focus";
    setMode(next);
  }, [setMode]);

  // Sync tl when pomoMins change externally
  useEffect(() => {
    if (!running) setTl(pomoMins[mode] * 60);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomoMins]);

  return { mode, setMode, tl, running, toggleTimer, resetTimer, skipMode };
}
