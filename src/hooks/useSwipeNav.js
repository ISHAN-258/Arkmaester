import { useEffect, useRef } from "react";

const PAGES = ["home", "study", "tracker", "planner", "insights", "history", "chat"];

/**
 * Detects horizontal swipe on touch devices and navigates pages.
 */
export function useSwipeNav({ page, setPage }) {
  const startX = useRef(null);
  const startY = useRef(null);

  useEffect(() => {
    const onStart = (e) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };

    const onEnd = (e) => {
      if (startX.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      startX.current = null;

      // Only horizontal swipes > 60px, must be more horizontal than vertical
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

      const idx = PAGES.indexOf(page);
      if (dx < 0 && idx < PAGES.length - 1) setPage(PAGES[idx + 1]); // swipe left → next
      if (dx > 0 && idx > 0)               setPage(PAGES[idx - 1]); // swipe right → prev
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend",   onEnd);
    };
  }, [page, setPage]);
}
