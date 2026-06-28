import { useState, useRef, useCallback } from "react";
import { parseVoiceInput } from "../utils/planner.js";

/**
 * Voice-to-task planner using SpeechRecognition API.
 * Returns { listening, transcript, parsedTasks, start, stop, reset, supported }
 */
export function useVoicePlanner({ onTasksGenerated } = {}) {
  const [listening,    setListening]    = useState(false);
  const [transcript,   setTranscript]   = useState("");
  const [parsedTasks,  setParsedTasks]  = useState([]);
  const [interimText,  setInterimText]  = useState("");
  const recognitionRef = useRef(null);

  const supported = typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const start = useCallback(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r  = new SR();
    r.lang           = "en-IN";
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.continuous     = true;

    r.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      setInterimText(interim);
      if (final) setTranscript((prev) => prev + final);
    };

    r.onend = () => {
      setListening(false);
      setInterimText("");
      setTranscript((t) => {
        const trimmed = t.trim();
        const tasks = parseVoiceInput(trimmed);
        setParsedTasks(tasks);
        if (tasks.length > 0) onTasksGenerated?.(tasks);
        return trimmed;
      });
    };

    r.onerror = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
    setTranscript("");
    setParsedTasks([]);
  }, [supported, onTasksGenerated]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
    setTranscript("");
    setParsedTasks([]);
    setInterimText("");
  }, []);

  return { listening, transcript, interimText, parsedTasks, start, stop, reset, supported };
}
