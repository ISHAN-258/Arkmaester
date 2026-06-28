import { useState, useEffect, useRef, useCallback } from "react";
import { playPomoAlert } from "../utils/audio";
import { sendNotification } from "../utils/notifications";
import { todayStr } from "../utils/helpers";

interface UseTimerProps {
  pomoMins: number;
  activeSubjId: string | null;
  onSessionComplete: (entry: { id: number; date: string; subjId: string | null; secs: number; notes: string; timestamp: string }) => void;
}

export function useTimer({ pomoMins, activeSubjId, onSessionComplete }: UseTimerProps) {
  const [mode, setMode] = useState<"study" | "break">("study");
  const [timeLeft, setTimeLeft] = useState<number>(pomoMins * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const totalSecsRecordRef = useRef<number>(pomoMins * 60);

  // Keep track of accumulated seconds studied during active session (even if settings variable changes)
  const secsStudiedRef = useRef<number>(0);

  // Sync timeLeft when pomoMins updates, but only if timer is inactive to prevent jumps during active session.
  useEffect(() => {
    if (!isActive && mode === "study") {
      setTimeLeft(pomoMins * 60);
      totalSecsRecordRef.current = pomoMins * 60;
    }
  }, [pomoMins, isActive, mode]);

  const startTimer = useCallback(() => {
    setIsActive(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (mode === "study") {
      setTimeLeft(pomoMins * 60);
      totalSecsRecordRef.current = pomoMins * 60;
    } else {
      setTimeLeft(5 * 60); // standard 5 min break
      totalSecsRecordRef.current = 5 * 60;
    }
    secsStudiedRef.current = 0;
  }, [pomoMins, mode]);

  const setMins = useCallback((m: number) => {
    setIsActive(false);
    setTimeLeft(m * 60);
    totalSecsRecordRef.current = m * 60;
    secsStudiedRef.current = 0;
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);

            // Handle timer completion transitions
            playPomoAlert();

            if (mode === "study") {
              // Log study session completion
              const totalSessionSecs = totalSecsRecordRef.current;
              onSessionComplete({
                id: Date.now(),
                date: todayStr(),
                subjId: activeSubjId,
                secs: totalSessionSecs,
                notes: "",
                timestamp: new Date().toISOString(),
              });

              sendNotification("Study Block Complete!", "Take a 5-minute breather to settle the score.");
              setMode("break");
              secsStudiedRef.current = 0;
              return 5 * 60; // 5 min break default
            } else {
              sendNotification("Breather Is Over!", "Back to work. Conquer the chaos!");
              setMode("study");
              secsStudiedRef.current = 0;
              return pomoMins * 60;
            }
          }
          if (mode === "study") {
            secsStudiedRef.current += 1;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, mode, pomoMins, activeSubjId, onSessionComplete]);

  return {
    timeLeft,
    isActive,
    mode,
    startTimer,
    pauseTimer,
    resetTimer,
    setMins,
    totalDuration: totalSecsRecordRef.current,
    secsStudied: secsStudiedRef.current,
  };
}
export type TimerState = ReturnType<typeof useTimer>;
