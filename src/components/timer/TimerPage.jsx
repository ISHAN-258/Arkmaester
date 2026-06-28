import { useState, useCallback, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import TimerRing from "./TimerRing.jsx";
import GoalCard from "./GoalCard.jsx";
import PomoSettings from "./PomoSettings.jsx";
import AmbientPanel from "./AmbientPanel.jsx";
import ShortcutsCard from "./ShortcutsCard.jsx";
import { fmtTime, fmtDuration } from "../../utils/helpers.js";
import { generateBreakSuggestion } from "../../utils/analytics.js";

const PRIORITY_COLORS = { high:"var(--red)", medium:"var(--amber)", low:"var(--cyan)" };

export default function TimerPage({ timerState }) {
  const {
    tasks, addTask, togTask, delTask,
    subjects, activeSubjId, setActiveSubjId,
    pomoMins, sessionLog,
  } = useApp();

  const { mode, setMode, tl, running, toggleTimer, resetTimer, skipMode } = timerState;
  const [newTask,    setNewTask]    = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const totalSecs     = pomoMins[mode] * 60;
  const elapsedSecs   = totalSecs - tl;
  const elapsedMins   = elapsedSecs / 60;
  const todaySessions = sessionLog.filter((e) => e.date === new Date().toISOString().slice(0,10)).length;

  const breakHint = useMemo(() => generateBreakSuggestion({
    sessionCount: todaySessions,
    avgPosture:   null,
    avgFocus:     null,
    elapsedMins,
  }), [todaySessions, elapsedMins]);

  const handleAdd = useCallback((e) => {
    e.preventDefault();
    if (newTask.trim()) { addTask(newTask.trim()); setNewTask(""); }
  }, [newTask, addTask]);

  const pendingTasks = useMemo(() => tasks.filter((t) => !t.done), [tasks]);
  const doneTasks    = useMemo(() => tasks.filter((t) =>  t.done), [tasks]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="sl">// ARKMAESTER — TIMER</div>
        <h2 className="page-title">Focus Timer</h2>
        <p className="page-sub">Work in focused sprints. Rest intentionally.</p>
      </div>

      {/* Break suggestion banner */}
      {breakHint && (
        <div className="nb" style={{ marginBottom:"1rem" }}>
          <span>{breakHint.type === "long" ? "🏆" : breakHint.type === "posture" ? "🧍" : "⏰"} {breakHint.msg}</span>
        </div>
      )}

      <div className="timer-layout">
        {/* Timer main */}
        <div className="timer-main">
          {/* Mode buttons */}
          <div className="mode-btns">
            {["focus","short","long"].map((m) => (
              <button key={m} className={`mb${mode===m?" active":""}`} onClick={() => setMode(m)}>
                {m === "focus" ? "Focus" : m === "short" ? "Short" : "Long"}
                <span style={{ fontFamily:"var(--mono)", fontSize:".6rem", color:"var(--muted)", marginLeft:".3rem" }}>
                  {pomoMins[m]}m
                </span>
              </button>
            ))}
            <button className="pomo-settings" onClick={() => setShowSettings((s) => !s)} title="Settings">⚙</button>
          </div>

          {showSettings && (
            <div style={{ width:"100%", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:6, padding:"1rem" }}>
              <PomoSettings onClose={() => setShowSettings(false)} />
            </div>
          )}

          {/* Ring */}
          <TimerRing tl={tl} totalSecs={totalSecs} mode={mode} running={running} />

          {/* Controls */}
          <div className="timer-ctrls">
            <button className="bti" onClick={resetTimer} title="Reset">↺</button>
            <button className="bti prim" onClick={toggleTimer}>{running ? "⏸" : "▶"}</button>
            <button className="bti" onClick={skipMode} title="Skip">⏭</button>
          </div>

          {/* Subject picker */}
          <select
            className="subj-picker"
            value={activeSubjId ?? ""}
            onChange={(e) => setActiveSubjId(e.target.value ? +e.target.value : null)}
          >
            <option value="">— No Subject —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Session stats */}
          <div style={{ display:"flex", gap:"1.4rem", marginTop:".2rem" }}>
            {[
              ["Today",    `${todaySessions} sessions`],
              ["Elapsed",  fmtTime(elapsedSecs)],
              ["Mode",     mode === "focus" ? "Focus" : "Break"],
            ].map(([l, v]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"var(--mono)", fontSize:".65rem", color:"var(--muted)", letterSpacing:"1px", textTransform:"uppercase" }}>{l}</div>
                <div style={{ fontFamily:"var(--mono)", fontSize:".88rem", fontWeight:600, color:"var(--cyan)", marginTop:".18rem" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <GoalCard />

          {/* Task list */}
          <div className="sc">
            <h4>Today's Tasks</h4>
            <form className="ti-row" onSubmit={handleAdd}>
              <input
                className="ti"
                placeholder="Add a task…"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button className="ba" type="submit">+</button>
            </form>

            {pendingTasks.length === 0 && doneTasks.length === 0 && (
              <p className="log-empty">No tasks yet. Add one above.</p>
            )}

            {pendingTasks.map((t) => (
              <div className="task" key={t.id}>
                <div
                  className={`tck${t.done?" done":""}`}
                  onClick={() => togTask(t.id)}
                >
                  {t.done && "✓"}
                </div>
                <span
                  className={`priority-dot`}
                  style={{ background: PRIORITY_COLORS[t.priority] ?? "var(--muted)" }}
                />
                <span className={`ttx${t.done?" done":""}`}>{t.text}</span>
                <button className="tdl" onClick={() => delTask(t.id)}>✕</button>
              </div>
            ))}

            {doneTasks.length > 0 && (
              <>
                <div className="divider" />
                <div style={{ fontSize:".65rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:".38rem" }}>
                  Completed ({doneTasks.length})
                </div>
                {doneTasks.slice(0, 4).map((t) => (
                  <div className="task" key={t.id} style={{ opacity:.55 }}>
                    <div className="tck done" onClick={() => togTask(t.id)}>✓</div>
                    <span className="ttx done">{t.text}</span>
                    <button className="tdl" onClick={() => delTask(t.id)}>✕</button>
                  </div>
                ))}
              </>
            )}
          </div>

          <AmbientPanel />
          <ShortcutsCard />

          {/* Recent sessions */}
          {sessionLog.length > 0 && (
            <div className="sc">
              <h4>Recent Sessions</h4>
              {sessionLog.slice(-4).reverse().map((e, i) => {
                const subj = subjects.find((s) => s.id === e.subjId);
                return (
                  <div className="ss" key={e.id ?? i}>
                    <span className="ss-l">
                      {subj ? <span style={{ color:subj.color }}>● </span> : null}
                      {subj?.name ?? "Untagged"}
                    </span>
                    <span className="ss-v">{fmtDuration(e.secs)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
