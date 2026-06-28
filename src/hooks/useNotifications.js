import { useState } from "react";
import {
  requestNotifPermission,
  getNotifPermission,
  schedulePlanningReminder,
  scheduleMorningReminder,
} from "../utils/notifications.js";

export function useNotifications() {
  const [permission, setPermission] = useState(getNotifPermission);

  const askPermission = async () => {
    await requestNotifPermission();
    setPermission(getNotifPermission());
  };

  const startSchedulers = (tasks = []) => {
    if (permission !== "granted") return;
    schedulePlanningReminder(21, () => {});
    scheduleMorningReminder(8, tasks, () => {});
  };

  return { permission, askPermission, startSchedulers };
}
