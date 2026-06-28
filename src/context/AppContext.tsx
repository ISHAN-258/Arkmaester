import { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, ReactNode } from "react";
import { storageGet, storageSet, KEYS } from "../utils/storage";
import { DEF_TASKS, DEF_SUBJ, DEF_POMO_MINS } from "../utils/constants";
import { enrichSubjectsWithHours } from "../utils/analytics";
import { todayStr } from "../utils/helpers";
import { fireConfetti } from "../utils/export";
import { setSelectedSound as audioSetSound } from "../utils/audio";
import { rescheduleOverdueTasks } from "../utils/planner";

interface AppContextType {
  tasks: any[];
  subjects: any[];
  subjectsWithHours: any[];
  sessionLog: any[];
  studiedDays: Set<number>;
  distractionLog: any[];
  streak: number;
  todayStudiedHrs: number;
  dailyGoalPct: number;
  dailyGoalHrs: number;
  weeklyGoalHrs: number;
  pomoMins: number;
  selectedSound: string;
  activeSubjId: string | null;
  page: string;
  toast: any;
  reportEntry: any;
  notesModal: any;
  loaded: boolean;
  setPage: (p: string) => void;
  setPomoMins: (m: number) => void;
  setSelectedSound: (s: string) => void;
  setDailyGoalHrs: (h: number) => void;
  setWeeklyGoalHrs: (h: number) => void;
  addTask: (text: string, extras?: any) => void;
  togTask: (id: number) => void;
  delTask: (id: number) => void;
  updateTask: (id: number, changes: any) => void;
  setTasks: (updater: any) => void;
  saveSubjects: (s: any[]) => void;
  updateSubject: (id: string, field: string, val: any) => void;
  deleteSubject: (id: string) => void;
  addSubject: (s: any) => void;
  clearSessionLog: () => void;
  updateSessionNotes: (entryId: number, notes: string) => void;
  handleSessionComplete: (entry: any) => void;
  toggleDay: (d: number) => void;
  addDistraction: (event: any) => void;
  setActiveSubjId: (id: string | null) => void;
  showToast: (t: any) => void;
  setToast: (t: any) => void;
  setReportEntry: (entry: any) => void;
  setNotesModal: (entry: any) => void;
}

const AppCtx = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppCtx);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasksState] = useState<any[]>(DEF_TASKS);
  const [subjects, setSubjectsState] = useState<any[]>(DEF_SUBJ);
  const [sessionLog, setSessionLog] = useState<any[]>([]);
  const [studiedDays, setStudiedDays] = useState<Set<number>>(new Set());
  const [pomoMins, setPomoMinsState] = useState<number>(DEF_POMO_MINS);
  const pomoMinsRef = useRef<number>(DEF_POMO_MINS);
  
  const setPomoMins = useCallback((m: number) => { 
    pomoMinsRef.current = m; 
    setPomoMinsState(m); 
    storageSet(KEYS.POMO_MINS, m); 
  }, []);

  const [selectedSound, setSelectedSoundState] = useState<string>("piano");
  const setSelectedSound = useCallback((s: string) => { 
    setSelectedSoundState(s); 
    audioSetSound(s); 
    storageSet(KEYS.SOUND, s); 
  }, []);

  const [dailyGoalHrs, setDailyGoalHrsState] = useState<number>(4);
  const [weeklyGoalHrs, setWeeklyGoalHrsState] = useState<number>(20);
  const setDailyGoalHrs = useCallback((h: number) => { 
    setDailyGoalHrsState(h); 
    storageSet(KEYS.DAILY_GOAL, h); 
  }, []);
  const setWeeklyGoalHrs = useCallback((h: number) => { 
    setWeeklyGoalHrsState(h); 
    storageSet(KEYS.WEEKLY_GOAL, h); 
  }, []);

  const [distractionLog, setDistractionLog] = useState<any[]>([]);
  const [toast, setToast] = useState<any>(null);
  const [reportEntry, setReportEntry] = useState<any>(null);
  const [notesModal, setNotesModal] = useState<any>(null);
  const toastTimerRef = useRef<any>(null);

  const showToast = useCallback((t: any) => { 
    clearTimeout(toastTimerRef.current); 
    setToast(t); 
    toastTimerRef.current = setTimeout(() => setToast(null), 5000); 
  }, []);

  const [activeSubjId, setActiveSubjId] = useState<string | null>(null);
  const [page, setPage] = useState<string>("home");
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const [tk, su, log, sd, pm, snd, dg, wg, dl] = await Promise.all([
        storageGet(KEYS.TASKS, DEF_TASKS),
        storageGet(KEYS.SUBJECTS, DEF_SUBJ),
        storageGet(KEYS.SESSION_LOG, []),
        storageGet(KEYS.STUDIED_DAYS, []),
        storageGet(KEYS.POMO_MINS, DEF_POMO_MINS),
        storageGet(KEYS.SOUND, "piano"),
        storageGet(KEYS.DAILY_GOAL, 4),
        storageGet(KEYS.WEEKLY_GOAL, 20),
        storageGet(KEYS.DISTRACTION_LOG, []),
      ]);
      setTasksState(rescheduleOverdueTasks(tk));
      setSubjectsState(su);
      setSessionLog(log);
      setStudiedDays(new Set(sd));
      pomoMinsRef.current = pm;
      setPomoMinsState(pm);
      audioSetSound(snd);
      setSelectedSoundState(snd);
      setDailyGoalHrsState(dg);
      setWeeklyGoalHrsState(wg);
      setDistractionLog(dl);
      setLoaded(true);
    })();
  }, []);

  const handleSessionComplete = useCallback((entry: any) => {
    setSessionLog((prev) => {
      const todaySessions = prev.filter((e) => e.date === entry.date).length;
      const enriched = { ...entry, sessionIndex: todaySessions + 1 };
      const next = [...prev, enriched];
      storageSet(KEYS.SESSION_LOG, next);
      showToast({ subjId: enriched.subjId, secs: enriched.secs, entry: enriched });
      setTimeout(() => setNotesModal({ entry: enriched }), 400);
      return next;
    });
    setStudiedDays((prev) => {
      const dom = new Date().getDate();
      const ns = new Set(prev);
      ns.add(dom);
      storageSet(KEYS.STUDIED_DAYS, [...ns]);
      storageSet(KEYS.STUDIED_DAYS, [...ns]);
      return ns;
    });
  }, [showToast]);

  const setTasks = useCallback((updater: any) => {
    setTasksState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      storageSet(KEYS.TASKS, next);
      return next;
    });
  }, []);

  const addTask = useCallback((text: string, extras = {}) => {
    setTasks((ts: any[]) => [...ts, { id: Date.now(), text, done: false, priority: "medium", date: todayStr(), ...extras }]);
  }, [setTasks]);

  const togTask = useCallback((id: number) => {
    setTasks((ts: any[]) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }, [setTasks]);

  const delTask = useCallback((id: number) => {
    setTasks((ts: any[]) => ts.filter((t) => t.id !== id));
  }, [setTasks]);

  const updateTask = useCallback((id: number, changes: any) => {
    setTasks((ts: any[]) => ts.map((t) => t.id === id ? { ...t, ...changes } : t));
  }, [setTasks]);

  const saveSubjects = useCallback((s: any[]) => { 
    setSubjectsState(s); 
    storageSet(KEYS.SUBJECTS, s); 
  }, []);

  const updateSubject = useCallback((id: string, field: string, val: any) => {
    saveSubjects(subjects.map((s) => s.id === id ? { ...s, [field]: val } : s));
  }, [saveSubjects, subjects]);

  const deleteSubject = useCallback((id: string) => {
    saveSubjects(subjects.filter((s) => s.id !== id));
  }, [saveSubjects, subjects]);

  const addSubject = useCallback((s: any) => {
    saveSubjects([...subjects, s]);
  }, [saveSubjects, subjects]);

  const clearSessionLog = useCallback(() => { 
    setSessionLog([]); 
    storageSet(KEYS.SESSION_LOG, []); 
  }, []);

  const updateSessionNotes = useCallback((entryId: number, notes: string) => {
    setSessionLog((prev) => {
      const next = prev.map((e) => e.id === entryId ? { ...e, notes } : e);
      storageSet(KEYS.SESSION_LOG, next);
      return next;
    });
  }, []);

  const toggleDay = useCallback((d: number) => {
    const dom = new Date().getDate();
    if (d > dom) return;
    setStudiedDays((prev) => {
      const ns = new Set(prev);
      if (ns.has(d)) {
         ns.delete(d);
      } else {
         ns.add(d);
      }
      storageSet(KEYS.STUDIED_DAYS, [...ns]);
      return ns;
    });
  }, []);

  const addDistraction = useCallback((event: any) => {
    setDistractionLog((prev) => {
      const next = [...prev, { ...event, id: Date.now() }];
      storageSet(KEYS.DISTRACTION_LOG, next);
      return next;
    });
  }, []);

  const subjectsWithHours = useMemo(() => enrichSubjectsWithHours(subjects, sessionLog), [subjects, sessionLog]);

  const todayStudiedHrs = useMemo(() => {
    const today = todayStr();
    return sessionLog.filter((e) => e.date === today).reduce((a, e) => a + e.secs, 0) / 3600;
  }, [sessionLog]);

  const dailyGoalPct = Math.min(100, Math.round((todayStudiedHrs / dailyGoalHrs) * 100));

  const streak = useMemo(() => {
    const dom = new Date().getDate();
    return [...studiedDays].filter((d) => d <= dom).length;
  }, [studiedDays]);

  const prevDailyPct = useRef<number>(0);
  const prevStreak = useRef<number>(0);

  useEffect(() => { 
    if (dailyGoalPct >= 100 && prevDailyPct.current < 100) {
      fireConfetti({ count: 70 }); 
    }
    prevDailyPct.current = dailyGoalPct; 
  }, [dailyGoalPct]);

  useEffect(() => { 
    if (streak > 0 && streak !== prevStreak.current && streak % 5 === 0) {
      fireConfetti({ count: 60 }); 
    }
    prevStreak.current = streak; 
  }, [streak]);

  const value = useMemo(() => ({
    tasks, subjects, subjectsWithHours, sessionLog, studiedDays, distractionLog,
    streak, todayStudiedHrs, dailyGoalPct, dailyGoalHrs, weeklyGoalHrs,
    pomoMins, selectedSound, activeSubjId, page,
    toast, reportEntry, notesModal, loaded,
    setPage, setPomoMins, setSelectedSound, setDailyGoalHrs, setWeeklyGoalHrs,
    addTask, togTask, delTask, updateTask, setTasks,
    saveSubjects, updateSubject, deleteSubject, addSubject,
    clearSessionLog, updateSessionNotes, handleSessionComplete,
    toggleDay, addDistraction, setActiveSubjId,
    showToast, setToast, setReportEntry, setNotesModal,
  }), [
    tasks, subjects, subjectsWithHours, sessionLog, studiedDays, distractionLog,
    streak, todayStudiedHrs, dailyGoalPct, dailyGoalHrs, weeklyGoalHrs,
    pomoMins, selectedSound, activeSubjId, page,
    toast, reportEntry, notesModal, loaded,
    setPage, setPomoMins, setSelectedSound, setDailyGoalHrs, setWeeklyGoalHrs,
    addTask, togTask, delTask, updateTask, setTasks,
    saveSubjects, updateSubject, deleteSubject, addSubject,
    clearSessionLog, updateSessionNotes, handleSessionComplete,
    toggleDay, addDistraction, setActiveSubjId,
    showToast, setToast, setReportEntry, setNotesModal,
  ]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
