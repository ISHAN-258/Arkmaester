import { todayStr } from "./helpers";

export function rescheduleOverdueTasks(tasks: any[]): any[] {
  const today = todayStr();
  return tasks.map((t) => {
    // If the task is not completed and its date is in the past, roll it over to today
    if (!t.done && t.date && t.date < today) {
      return { ...t, date: today, originalDate: t.date, rescheduled: true };
    }
    return t;
  });
}

export function buildOptimalRoutine(tasks: any[]): any[] {
  // Sort tasks by priority (high > medium > low) and status (not done first)
  const priorityWeight: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
  
  return [...tasks]
    .filter((t) => !t.done)
    .sort((a, b) => {
      const wa = priorityWeight[a.priority] || 2;
      const wb = priorityWeight[b.priority] || 2;
      return wb - wa; // descending order of weight
    });
}
