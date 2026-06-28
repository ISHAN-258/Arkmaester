import { useCallback } from "react";
import { requestPermission, sendNotification } from "../utils/notifications";

export function useNotifications() {
  const askPermission = useCallback(async () => {
    return await requestPermission();
  }, []);

  const startSchedulers = useCallback((tasks: any[]) => {
    // Schedule check for pending tasks
    const pendingCount = tasks.filter((t) => !t.done).length;
    if (pendingCount > 0) {
      setTimeout(() => {
        sendNotification(
          "Unfinished task review",
          `Arkmaester observes: you have ${pendingCount} pending task blocks waiting to be completed.`
        );
      }, 3000); // Trigger a helpful prompt soon after boot
    }
  }, []);

  return {
    askPermission,
    startSchedulers,
  };
}
