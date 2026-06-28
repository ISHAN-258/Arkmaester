import { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { storageGet, storageSet, KEYS } from "../utils/storage.js";
import { DEF_TASKS, DEF_SUBJ, DEF_POMO_MINS } from "../utils/constants.js";
import { enrichSubjectsWithHours } from "../utils/analytics.js";
import { todayStr } from "../utils/helpers.js";
import { fireConfetti } from "../utils/export.js";
import { setSelectedSound as audioSetSound } from "../utils/audio.js";
import { rescheduleOverdueTasks } from "../utils/planner.js";

// ── Context ────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// ── Provider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  // ── Core data ────────────────────────────────────────────────────────────
  const [tasks,       setTasksState]    = useState(DEF_TASKS);
  const [subjects,    setSubjectsState] = useState(DEF_SUBJ);
  const [sessionLog,  setSessionLog]    = useState([]);
  const [studiedDays, setStudiedDays]   = useState(new Set());

  // ── Pomodoro settings ─────────────────────────────────────────────────────
  const [pomoMins, setPomoMinsState] = useState(DEF_POMO_MINS);
  const pomoMinsRef = useRef(DEF_POMO_MINS);
  const setPomoMins = useCallback((m) => {
    pomoMinsRef.current = m;
    setPomoMinsState(m);
    void storageSet(KEYS.POMO_MINS, m);
  }, []);

  // ── Sound ─────────────────────────────────────────────────────────────────
  const [selectedSound, setSelectedSoundState] = useState("piano");
  const setSelectedSound = useCallback((s) => {
    setSelectedSoundState(s);
    audioSetSound(s);
    void storageSet(KEYS.SOUND, s);
  }, []);

  // ── Goals ─────────────────────────────────────────────────────────────────
  const [dailyGoalHrs,  setDailyGoalHrsState]  = useState(4);
  const [weeklyGoalHrs, setWeeklyGoalHrsState] = useState(20);
  const setDailyGoalHrs  = useCallback((h) => { setDailyGoalHrsState(h);  void storageSet(KEYS.DAILY_GOAL,  h); }, []);
  const setWeeklyGoalHrs = useCallback((h) => { setWeeklyGoalHrsState(h); void storageSet(KEYS.WEEKLY_GOAL, h); }, []);

  // ── Distraction log (for tracker) ────────────────────────────────────────
  const [distractionLog, setDistractionLog] = useState([]);

  // ── Toast / modals ────────────────────────────────────────────────────────
  const [toast,       setToast]       = useState(null);
  const [reportEntry, setReportEntry] = useState(null);
  const [notesModal,  setNotesModal]  = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((t) => {
    clearTimeout(toastTimerRef.current);
    setToast(t);
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  }, []);

  // ── Active subject (for timer) ────────────────────────────────────────────
  const [activeSubjId, setActiveSubjId] = useState(null);

  // ── Active page ────────────────────────────────────────────────────────────
  const [page, setPage] = useState("home");

  // ── Load persisted data ───────────────────────────────────────────────────
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      const [tk, su, log, sd, pm, snd, dg, wg, dl] = await Promise.all([
        storageGet(KEYS.TASKS,          DEF_TASKS),
        storageGet(KEYS.SUBJECTS,       DEF_SUBJ),
        storageGet(KEYS.SESSION_LOG,    []),
        storageGet(KEYS.STUDIED_DAYS,   []),
        storageGet(KEYS.POMO_MINS,      DEF_POMO_MINS),
        storageGet(KEYS.SOUND,          "piano"),
        storageGet(KEYS.DAILY_GOAL,     4),
        storageGet(KEYS.WEEKLY_GOAL,    20),
        storageGet(KEYS.DISTRACTION_LOG,[]),
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

  // ── Session complete callback (passed to useTimer) ────────────────────────
  const handleSessionComplete = useCallback((entry) => {
    setSessionLog((prev) => {
      const todaySessions = prev.filter((e) => e.date === entry.date).length;
      const enriched = { ...entry, sessionIndex: todaySessions + 1 };
      const next = [...prev, enriched];
      void storageSet(KEYS.SESSION_LOG, next);
      showToast({ subjId: enriched.subjId, secs: enriched.secs, entry: enriched });
      setTimeout(() => setNotesModal({ entry: enriched }), 400);
      return next;
    });
    setStudiedDays((prev) => {
      const dom = new Date().getDate();
      const ns = new Set(prev);
      ns.add(dom);
      void storageSet(KEYS.STUDIED_DAYS, [...ns]);
      return ns;
    });
  }, [showToast]);

  // ── Tasks CRUD ────────────────────────────────────────────────────────────
  const setTasks = useCallback((updater) => {
    setTasksState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      void storageSet(KEYS.TASKS, next);
      return next;
    });
  }, []);
  const addTask    = useCallback((text, extras = {}) => setTasks((ts) => [...ts, { id:Date.now(), text, done:false, priority:"medium", ...extras }]), [setTasks]);
  const togTask    = useCallback((id) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t)), [setTasks]);
  const delTask    = useCallback((id) => setTasks((ts) => ts.filter((t) => t.id !== id)), [setTasks]);
  const updateTask = useCallback((id, changes) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, ...changes } : t)), [setTasks]);

  // ── Subjects CRUD ─────────────────────────────────────────────────────────
  const saveSubjects   = useCallback((s) => { setSubjectsState(s); void storageSet(KEYS.SUBJECTS, s); }, []);
  const updateSubject  = useCallback((id, field, val) => saveSubjects(subjects.map((s) => s.id === id ? { ...s, [field]: val } : s)), [saveSubjects, subjects]);
  const deleteSubject  = useCallback((id) => saveSubjects(subjects.filter((s) => s.id !== id)), [saveSubjects, subjects]);
  const addSubject     = useCallback((s) => saveSubjects([...subjects, s]), [saveSubjects, subjects]);

  // ── Session log ───────────────────────────────────────────────────────────
  const clearSessionLog = useCallback(() => { setSessionLog([]); void storageSet(KEYS.SESSION_LOG, []); }, []);
  const updateSessionNotes = useCallback((entryId, notes) => {
    setSessionLog((prev) => {
      const next = prev.map((e) => e.id === entryId ? { ...e, notes } : e);
      void storageSet(KEYS.SESSION_LOG, next);
      return next;
    });
  }, []);

  // ── Studied days ──────────────────────────────────────────────────────────
  const toggleDay = useCallback((d) => {
    const dom = new Date().getDate();
    if (d > dom) return;
    setStudiedDays((prev) => {
      const ns = new Set(prev);
      ns.has(d) ? ns.delete(d) : ns.add(d);
      void storageSet(KEYS.STUDIED_DAYS, [...ns]);
      return ns;
    });
  }, []);

  // ── Distraction log ───────────────────────────────────────────────────────
  const addDistraction = useCallback((event) => {
    setDistractionLog((prev) => {
      const next = [...prev, { ...event, id: Date.now() }];
      void storageSet(KEYS.DISTRACTION_LOG, next);
      return next;
    });
  }, []);

  // ── Derived / computed ────────────────────────────────────────────────────
  const subjectsWithHours = useMemo(
    () => enrichSubjectsWithHours(subjects, sessionLog),
    [subjects, sessionLog]
  );

  const todayStudiedHrs = useMemo(() => {
    const today = todayStr();
    return sessionLog.filter((e) => e.date === today).reduce((a, e) => a + e.secs, 0) / 3600;
  }, [sessionLog]);

  const dailyGoalPct = Math.min(100, Math.round((todayStudiedHrs / dailyGoalHrs) * 100));

  const streak = useMemo(() => {
    const dom = new Date().getDate();
    return [...studiedDays].filter((d) => d <= dom).length;
  }, [studiedDays]);

  // ── Confetti on goal hits ─────────────────────────────────────────────────
  const prevDailyPct  = useRef(0);
  const prevStreak    = useRef(0);
  useEffect(() => {
    if (dailyGoalPct >= 100 && prevDailyPct.current < 100) fireConfetti({ count: 70 });
    prevDailyPct.current = dailyGoalPct;
  }, [dailyGoalPct]);
  useEffect(() => {
    if (streak > 0 && streak !== prevStreak.current && streak % 5 === 0) fireConfetti({ count: 60 });
    prevStreak.current = streak;
  }, [streak]);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = useMemo(() => ({
    // State
    tasks, subjects, subjectsWithHours,
    sessionLog, studiedDays, distractionLog,
    streak, todayStudiedHrs, dailyGoalPct,
    dailyGoalHrs, weeklyGoalHrs,
    pomoMins, selectedSound,
    activeSubjId, page,
    toast, reportEntry, notesModal,
    loaded,
    // Actions
    setPage,
    setPomoMins, setSelectedSound,
    setDailyGoalHrs, setWeeklyGoalHrs,
    addTask, togTask, delTask, updateTask, setTasks,
    saveSubjects, updateSubject, deleteSubject, addSubject,
    clearSessionLog, updateSessionNotes,
    handleSessionComplete,
    toggleDay,
    addDistraction,
    setActiveSubjId,
    showToast, setToast, setReportEntry, setNotesModal,
  }), [
    tasks, subjects, subjectsWithHours,
    sessionLog, studiedDays, distractionLog,
    streak, todayStudiedHrs, dailyGoalPct,
    dailyGoalHrs, weeklyGoalHrs,
    pomoMins, selectedSound,
    activeSubjId, page,
    toast, reportEntry, notesModal, loaded,
    setPomoMins, setSelectedSound, setDailyGoalHrs, setWeeklyGoalHrs,
    addTask, togTask, delTask, updateTask, setTasks,
    saveSubjects, updateSubject, deleteSubject, addSubject,
    clearSessionLog, updateSessionNotes,
    handleSessionComplete, toggleDay, addDistraction,
    setActiveSubjId, showToast, setToast, setReportEntry, setNotesModal,
  ]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
