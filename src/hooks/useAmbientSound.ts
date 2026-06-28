import { useState, useEffect, useCallback } from "react";
import { playAmbientSound, stopAmbientSound, setSelectedSound } from "../utils/audio";

export function useAmbientSound(initialSound = "piano") {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundName, setSoundName] = useState<string>(initialSound);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        playAmbientSound();
      } else {
        stopAmbientSound();
      }
      return next;
    });
  }, []);

  const changeSound = useCallback((sound: string) => {
    setSoundName(sound);
    setSelectedSound(sound);
  }, []);

  useEffect(() => {
    // Make sure we stop sound when unmounting
    return () => {
      stopAmbientSound();
    };
  }, []);

  return {
    isPlaying,
    soundName,
    togglePlay,
    changeSound,
  };
}
export type AmbientSoundState = ReturnType<typeof useAmbientSound>;
