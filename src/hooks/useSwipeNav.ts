import { useEffect, useRef } from "react";

const PAGES = ["home", "study", "tracker", "planner", "insights", "history", "chat"];

interface UseSwipeNavProps {
  page: string;
  setPage: (p: string) => void;
}

export function useSwipeNav({ page, setPage }: UseSwipeNavProps) {
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartRef.current === null) return;

      const diff = touchStartRef.current - e.changedTouches[0].clientX;
      const threshold = 120; // min swipe distance in px

      if (Math.abs(diff) > threshold) {
        const currIndex = PAGES.indexOf(page);
        if (currIndex !== -1) {
          if (diff > 0) {
            // Swiped Left -> Go to next page
            const nextIdx = (currIndex + 1) % PAGES.length;
            setPage(PAGES[nextIdx]);
          } else {
            // Swiped Right -> Go to previous page
            const prevIdx = (currIndex - 1 + PAGES.length) % PAGES.length;
            setPage(PAGES[prevIdx]);
          }
        }
      }
      touchStartRef.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [page, setPage]);
}
