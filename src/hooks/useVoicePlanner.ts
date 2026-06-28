import { useState, useCallback, useRef } from "react";
import { summarizeToTaskTitle } from "../utils/planner.js";

interface VoiceParseResult {
  text: string;
  priority: "high" | "medium" | "low";
  subjectId: string | null;
}

interface UseVoicePlannerProps {
  onParsed: (result: VoiceParseResult) => void;
  subjects: any[];
}

export function useVoicePlanner({ onParsed, subjects }: UseVoicePlannerProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    setErrorText(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorText("Browser does not support Web Speech dictation.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          // Parse keywords from transcipts
          const parsed = parseSpeech(transcript);
          onParsed(parsed);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech error", e);
        setErrorText("Speech check failed, please try again.");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      setErrorText("Web Dictation could not initialize.");
      setIsListening(false);
    }
  }, [onParsed]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Parse dictation transcript text
  const parseSpeech = (transcript: string): VoiceParseResult => {
    const text = transcript.trim();
    const cleanLower = text.toLowerCase();

    // 1. Detect priority
    let priority: "high" | "medium" | "low" = "medium";
    if (cleanLower.includes("high") || cleanLower.includes("urgent") || cleanLower.includes("critical") || cleanLower.includes("immediate")) {
      priority = "high";
    } else if (cleanLower.includes("low") || cleanLower.includes("easy") || cleanLower.includes("trivial")) {
      priority = "low";
    }

    // 2. Detect subject keys matching
    let subjectId: string | null = null;
    const rules: { [key: string]: string[] } = {
      math: ["math", "calculus", "sums", "algebra", "geometry", "limit", "limitations"],
      cs: ["computer", "code", "dev", "programming", "react", "database", "api"],
      phys: ["physics", "waves", "optics", "mechanics", "gravity", "speed"],
      chem: ["chem", "organic", "bonding", "acid", "molecule", "reaction"],
    };

    for (const [subjKey, kwArray] of Object.entries(rules)) {
      if (kwArray.some((kw) => cleanLower.includes(kw))) {
        // Double check does subject exist
        const matched = subjects.find((s) => s.id === subjKey);
        if (matched) {
          subjectId = matched.id;
          break;
        }
      }
    }

    const displayTaskText = summarizeToTaskTitle(text) || text;

    return {
      text: displayTaskText,
      priority,
      subjectId,
    };
  };

  return {
    isListening,
    errorText,
    startListening,
    stopListening,
  };
}
export type VoiceResult = VoiceParseResult;
