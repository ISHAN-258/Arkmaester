import { useState, useMemo, useCallback, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useVoicePlanner } from "../../hooks/useVoicePlanner.js";
import { buildTomorrowPlan, sortTasksSmart } from "../../utils/planner.js";
import { fmtHours } from "../../utils/helpers.js";
import { SUBJ_COLORS, TASK_PRIORITIES } from "../../utils/constants.js";
import { generateRoutine } from "../../utils/analytics.js";
import { exportSessionCSV } from "../../utils/export.js";
import { detectSubjectLabel } from "../../utils/subjectDetect.js";

const PRIORITY_COLORS = { high:"var(--red)", medium:"var(--amber)", low:"var(--cyan)" };
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function PlannerPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="sl">// ARKMAESTER — PLANNER</div>
        <h2 className="page-title">Planner</h2>
        <p className="page-sub">Track subjects, tasks, streaks and build smart routines.</p>
      </div>

      {/* Analytics overview */}
      <AnalyticsOverview />

      <div className="plan-layout">
        <div style={{ display:"flex", flexDirection:"column", gap:".9rem" }}>
          <SubjectTracker />
          <StreakCalendar />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:".9rem" }}>
          <TaskBoard />
          <VoicePlannerCard />
          <TomorrowPlanCard />
          <RoutineCard />
        </div>
      </div>
    </div>
  );
}

// ── Analytics overview stat cards ─────────────────────────────────────────
function AnalyticsOverview() {
  const { sessionLog, subjects, streak, tasks, weeklyGoalHrs, setWeeklyGoalHrs } = useApp();

  const totalSecs   = useMemo(() => sessionLog.reduce((a, e) => a + e.secs, 0), [sessionLog]);
  const weekSecs    = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    return sessionLog.filter((e) => e.ts >= cutoff).reduce((a, e) => a + e.secs, 0);
  }, [sessionLog]);

  const doneTasks   = tasks.filter((t) => t.done).length;
  const totalTasks  = tasks.length;
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const weekHrs       = +(weekSecs / 3600).toFixed(1);
  const weekGoalPct   = Math.min(100, Math.round((weekHrs / weeklyGoalHrs) * 100));

  return (
    <div style={{ marginBottom:"1.1rem" }}>
      <div className="ag">
        {[
          { l:"Total Studied",    v: fmtHours(totalSecs),    s:`${sessionLog.length} sessions`,     c:"var(--cyan)"   },
          { l:"This Week",        v: `${weekHrs}h`,          s:`${weekGoalPct}% of goal`,            c:"var(--green)"  },
          { l:"Day Streak",       v: `${streak} 🔥`,         s:"consecutive days",                   c:"var(--amber)"  },
          { l:"Task Completion",  v: `${completionPct}%`,    s:`${doneTasks}/${totalTasks} done`,    c:"var(--purple)" },
        ].map(({ l,v,s,c }) => (
          <div className="as-card" key={l} style={{ "--accent": c }}>
            <style>{`.as-card::after { background: var(--accent) !important; }`}</style>
            <div className="as-l">{l}</div>
            <div className="as-v" style={{ color:c }}>{v}</div>
            <div className="as-s">{s}</div>
          </div>
        ))}
      </div>

      {/* Weekly goal bar */}
      <div className="sc" style={{ padding:".85rem 1rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".45rem" }}>
          <span style={{ fontSize:".7rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"1px", textTransform:"uppercase" }}>Weekly Goal</span>
          <div style={{ display:"flex", alignItems:"center", gap:".45rem" }}>
            <span style={{ fontFamily:"var(--mono)", fontSize:".78rem", color:"var(--cyan)" }}>{weekHrs}h / {weeklyGoalHrs}h</span>
            <WeeklyGoalEdit weeklyGoalHrs={weeklyGoalHrs} setWeeklyGoalHrs={setWeeklyGoalHrs} />
          </div>
        </div>
        <div className="weekly-goal-bar">
          <div
            className="weekly-goal-fill"
            style={{ width:`${weekGoalPct}%`, background: weekGoalPct >= 100 ? "var(--green)" : "var(--cyan)" }}
          />
        </div>
      </div>
    </div>
  );
}

function WeeklyGoalEdit({ weeklyGoalHrs, setWeeklyGoalHrs }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(weeklyGoalHrs);
  if (editing) return (
    <span style={{ display:"flex", gap:".3rem", alignItems:"center" }}>
      <input
        className="goal-input" type="number" min="1" max="168" value={val}
        onChange={(e) => setVal(+e.target.value)}
        onKeyDown={(e) => { if (e.key==="Enter") { setWeeklyGoalHrs(val); setEditing(false); } if(e.key==="Escape") setEditing(false); }}
        autoFocus style={{ width:50 }}
      />
      <span style={{ fontSize:".68rem", color:"var(--muted)" }}>h</span>
      <button className="goal-set-btn" onClick={() => { setWeeklyGoalHrs(val); setEditing(false); }}>Set</button>
    </span>
  );
  return <button className="notes-expand" onClick={() => { setVal(weeklyGoalHrs); setEditing(true); }}>✏</button>;
}

// ── Subject tracker ───────────────────────────────────────────────────────
function SubjectTracker() {
  const { subjects: rawSubjects, subjectsWithHours, sessionLog, updateSubject, deleteSubject, addSubject, saveSubjects } = useApp();
  const [newSubj, setNewSubj] = useState("");
  const [colorPick, setColorPick] = useState(SUBJ_COLORS[0]);
  const [editingId, setEditingId] = useState(null);

  const maxHrs = useMemo(
    () => Math.max(1, ...subjectsWithHours.map((s) => s.target || 1)),
    [subjectsWithHours]
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSubj.trim()) return;
    addSubject({ id: Date.now(), name: newSubj.trim(), color: colorPick, target: 10, manualHours: 0 });
    setNewSubj(""); setColorPick(SUBJ_COLORS[Math.floor(Math.random() * SUBJ_COLORS.length)]);
  };

  return (
    <div className="pc">
      <h3>Subject Tracker</h3>
      {subjectsWithHours.map((s) => {
        const pct = Math.min(100, Math.round((s.hours / (s.target || 1)) * 100));
        return (
          <div className="sr-row" key={s.id}>
            <div className="sr-left">
              <span className="sdot2" style={{ background: s.color }} />
              {editingId === s.id ? (
                <input
                  className="ei"
                  defaultValue={s.name}
                  onBlur={(e) => { updateSubject(s.id, "name", e.target.value); setEditingId(null); }}
                  onKeyDown={(e) => { if (e.key==="Enter") { updateSubject(s.id,"name",e.target.value); setEditingId(null); } }}
                  autoFocus style={{ width:110 }}
                />
              ) : (
                <span className="sn" onDoubleClick={() => setEditingId(s.id)} title="Double-click to rename">{s.name}</span>
              )}
            </div>
            <div className="sr-right">
              <span className="sh">{s.hours.toFixed(1)}h /</span>
              <input
                className="ei"
                type="number" min="1" max="200" value={s.target}
                onChange={(e) => updateSubject(s.id, "target", +e.target.value)}
                title="Target hours"
              />
              <div className="sp"><div className="spf" style={{ width:`${pct}%`, background:s.color }} /></div>
              <button className="bsm dng" onClick={() => deleteSubject(s.id)} title="Delete">✕</button>
            </div>
          </div>
        );
      })}

      <form className="add-row" onSubmit={handleAdd}>
        <input className="ai" placeholder="New subject…" value={newSubj} onChange={(e) => setNewSubj(e.target.value)} />
        <select
          style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:4, padding:".3rem .4rem", color:"var(--text)", cursor:"pointer" }}
          value={colorPick}
          onChange={(e) => setColorPick(e.target.value)}
        >
          {SUBJ_COLORS.map((c) => (
            <option key={c} value={c} style={{ background:c }}>{'█'}</option>
          ))}
        </select>
        <button className="ba" type="submit">+</button>
      </form>
    </div>
  );
}

// ── Streak calendar ───────────────────────────────────────────────────────
function StreakCalendar() {
  const { studiedDays, toggleDay } = useApp();
  const today = new Date();
  const dom   = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
  const firstDow = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDow; i++) arr.push({ pad:true, n:i });
    for (let d = 1; d <= daysInMonth; d++) arr.push({ d });
    return arr;
  }, [firstDow, daysInMonth]);

  return (
    <div className="cc2">
      <h3>
        {today.toLocaleString("default",{month:"long"})} {today.getFullYear()}
        <span style={{ fontFamily:"var(--mono)", fontSize:".65rem", color:"var(--cyan)", marginLeft:".6rem" }}>
          {studiedDays.size} day{studiedDays.size!==1?"s":""} studied
        </span>
      </h3>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:".3rem" }}>
        {DAYS.map((d) => <div key={d} className="wdl">{d}</div>)}
        {cells.map((c, i) => {
          if (c.pad) return <div key={`p${i}`} />;
          const isToday   = c.d === dom;
          const isStudied = studiedDays.has(c.d);
          const isPast    = c.d < dom;
          return (
            <div
              key={c.d}
              className={`wc${isToday?" today":""}${isStudied?" studied":""}${isPast&&!isStudied?" past":""}`}
              onClick={() => toggleDay(c.d)}
              title={`${c.d} ${isStudied?"✓":""}`}
            >
              {c.d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Task board ────────────────────────────────────────────────────────────
function TaskBoard() {
  const { tasks, addTask, togTask, delTask, updateTask, setTasks, subjects, sessionLog } = useApp();
  const [newTask,    setNewTask]    = useState("");
  const [priority,   setPriority]   = useState("medium");
  const [subjTag,    setSubjTag]    = useState("");
  const [filter,     setFilter]     = useState("all");
  const [autoDetect, setAutoDetect] = useState(true);
  const dragId = useRef(null);

  // Auto-detect subject while typing
  const detected = useMemo(() => {
    if (!autoDetect || !newTask.trim()) return null;
    return detectSubjectLabel(newTask, subjects);
  }, [newTask, subjects, autoDetect]);

  const sorted = useMemo(() => sortTasksSmart(tasks), [tasks]);
  const visible = useMemo(() => {
    if (filter === "all")    return sorted;
    if (filter === "pending") return sorted.filter((t) => !t.done);
    if (filter === "done")    return sorted.filter((t) => t.done);
    return sorted.filter((t) => t.priority === filter);
  }, [sorted, filter]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const subjId = subjTag ? +subjTag : (autoDetect && detected ? detected.id : null);
    addTask(newTask.trim(), { priority, subjId });
    setNewTask("");
  };

  // Drag handlers
  const onDragStart = (id) => { dragId.current = id; };
  const onDrop      = (targetId) => {
    if (!dragId.current || dragId.current === targetId) return;
    setTasks((prev) => {
      const arr  = [...prev];
      const from = arr.findIndex((t) => t.id === dragId.current);
      const to   = arr.findIndex((t) => t.id === targetId);
      if (from < 0 || to < 0) return prev;
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    dragId.current = null;
  };

  const exportTasks = () => {
    const csv = ["Task,Priority,Done,Subject"]
      .concat(tasks.map((t) => {
        const s = subjects.find((s) => s.id === t.subjId);
        return `"${t.text}",${t.priority},${t.done},${s?.name ?? "—"}`;
      })).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download = "tasks.csv"; a.click();
  };

  return (
    <div className="pc">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".85rem" }}>
        <h3 style={{ margin:0 }}>Task Board</h3>
        <div style={{ display:"flex", gap:".3rem", alignItems:"center" }}>
          <button className="export-btn" onClick={exportTasks}>↓ CSV</button>
          <button className="export-btn" onClick={() => exportSessionCSV(sessionLog, subjects)}>↓ Sessions</button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display:"flex", gap:".25rem", flexWrap:"wrap", marginBottom:".75rem" }}>
        {["all","pending","done","high","medium","low"].map((f) => (
          <button key={f} className={`mb${filter===f?" active":""}`} onClick={() => setFilter(f)} style={{ fontSize:".65rem", padding:".2rem .5rem" }}>{f}</button>
        ))}
      </div>

      {/* Add task */}
      <form style={{ display:"flex", gap:".3rem", marginBottom:".35rem", flexWrap:"wrap" }} onSubmit={handleAdd}>
        <input className="ai" style={{ flex:1, minWidth:120 }} placeholder="Add task…" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
        <select className="ai" style={{ width:"auto" }} value={priority} onChange={(e) => setPriority(e.target.value)}>
          {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="ai" style={{ width:"auto" }} value={subjTag} onChange={(e) => setSubjTag(e.target.value)}>
          <option value="">No subject</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className="ba" type="submit">+</button>
      </form>

      {/* Auto-detect hint */}
      <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:".65rem" }}>
        {detected && !subjTag && (
          <div style={{ fontSize:".68rem", color: detected.color, fontFamily:"var(--mono)", display:"flex", alignItems:"center", gap:".35rem" }}>
            <span style={{ width:8, height:8, borderRadius:2, background:detected.color, display:"inline-block" }} />
            Auto-detected: {detected.name}
          </div>
        )}
        <label style={{ fontSize:".68rem", color:"var(--muted)", cursor:"pointer", marginLeft:"auto", display:"flex", alignItems:"center", gap:".3rem" }}>
          <input type="checkbox" checked={autoDetect} onChange={(e) => setAutoDetect(e.target.checked)} style={{ accentColor:"var(--cyan)" }} />
          Auto-detect subject
        </label>
      </div>

      {visible.length === 0 && <p className="log-empty">No tasks for this filter.</p>}

      {visible.map((t) => {
        const subj = subjects.find((s) => s.id === t.subjId);
        return (
          <div
            className="task"
            key={t.id}
            draggable
            onDragStart={() => onDragStart(t.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(t.id)}
          >
            <span className="drag-handle" title="Drag to reorder">⣿</span>
            <div className={`tck${t.done?" done":""}`} onClick={() => togTask(t.id)}>{t.done && "✓"}</div>
            <span className="priority-dot" style={{ background: PRIORITY_COLORS[t.priority] ?? "var(--muted)" }} />
            <span className={`ttx${t.done?" done":""}`} style={{ flex:1 }}>
              {t.text}
              {subj && <span style={{ fontFamily:"var(--mono)", fontSize:".6rem", color:subj.color, marginLeft:".4rem" }}>#{subj.name}</span>}
              {t.rescheduled && <span style={{ fontFamily:"var(--mono)", fontSize:".58rem", color:"var(--amber)", marginLeft:".35rem" }}>↻ rescheduled</span>}
            </span>
            <select className="ei" style={{ width:68, fontSize:".62rem" }} value={t.priority} onChange={(e) => updateTask(t.id, { priority:e.target.value })}>
              {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <button className="tdl" onClick={() => delTask(t.id)}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

// ── Voice planner card ────────────────────────────────────────────────────
function VoicePlannerCard() {
  const { addTask } = useApp();
  const [added, setAdded] = useState(false);

  const { listening, transcript, interimText, parsedTasks, start, stop, reset, supported } =
    useVoicePlanner({
      onTasksGenerated: (tasks) => setAdded(false),
    });

  const acceptAll = () => {
    parsedTasks.forEach((t) => addTask(t.text, { priority: t.priority }));
    setAdded(true);
    reset();
  };

  return (
    <div className="sc">
      <h4>🎙 AI Voice Planner</h4>
      {!supported && (
        <p style={{ fontSize:".76rem", color:"var(--muted)" }}>
          SpeechRecognition not supported in this browser. Try Chrome.
        </p>
      )}
      {supported && (
        <>
          <div style={{ display:"flex", gap:".75rem", alignItems:"center", marginBottom:".5rem" }}>
            <button
              className={`voice-btn${listening?" listening":""}`}
              onClick={listening ? stop : start}
              title={listening ? "Stop recording" : "Start recording"}
            >
              {listening ? "🔴" : "🎙"}
            </button>
            <div>
              <div style={{ fontSize:".8rem", fontWeight:700 }}>{listening ? "Listening…" : "Tap to speak"}</div>
              <div style={{ fontSize:".7rem", color:"var(--muted)" }}>Speak naturally — we shorten it to a clear task title before adding.</div>
            </div>
          </div>

          {(transcript || interimText) && (
            <div className="voice-transcript">
              {transcript}
              {interimText && <span className="voice-interim">{interimText}</span>}
            </div>
          )}

          {parsedTasks.length > 0 && !added && (
            <div style={{ marginTop:".5rem" }}>
              <div style={{ fontSize:".7rem", color:"var(--muted)", marginBottom:".38rem", fontFamily:"var(--mono)", letterSpacing:"1px" }}>
                {parsedTasks.length} TASK{parsedTasks.length>1?"S":""} DETECTED
              </div>
              {parsedTasks.map((t, i) => (
                <div key={i} style={{ padding:".35rem .45rem", background:"var(--bg2)", borderRadius:4, marginBottom:".25rem", fontSize:".78rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:".4rem" }}>
                    <span className="priority-dot" style={{ background: PRIORITY_COLORS[t.priority] }} />
                    <span style={{ fontWeight:600 }}>{t.text}</span>
                    <span style={{ fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--muted)", marginLeft:"auto" }}>{t.priority}</span>
                  </div>
                  {t.originalText && t.originalText.toLowerCase() !== t.text.toLowerCase() && (
                    <div style={{ fontSize:".65rem", color:"var(--muted)", marginTop:".2rem", paddingLeft:"1rem", fontStyle:"italic" }}>
                      Heard: {t.originalText}
                    </div>
                  )}
                </div>
              ))}
              <div style={{ display:"flex", gap:".4rem", marginTop:".5rem" }}>
                <button className="btn-p" style={{ fontSize:".75rem", padding:".4rem .9rem" }} onClick={acceptAll}>
                  ✓ Add All Tasks
                </button>
                <button className="btn-o" style={{ fontSize:".75rem", padding:".4rem .9rem" }} onClick={reset}>
                  ✕ Discard
                </button>
              </div>
            </div>
          )}

          {added && (
            <div className="ab good" style={{ marginTop:".5rem" }}>
              ✅ Tasks added to your board!
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Tomorrow plan card ────────────────────────────────────────────────────
function TomorrowPlanCard() {
  const { tasks, subjects } = useApp();
  const plan = useMemo(() => buildTomorrowPlan(tasks, subjects), [tasks, subjects]);

  const SECTIONS = [
    { key:"high",   label:"🔴 High Priority",   cls:"pri-high"   },
    { key:"medium", label:"🟡 Medium Priority",  cls:"pri-medium" },
    { key:"low",    label:"🟢 Low Priority",     cls:"pri-low"    },
  ];

  return (
    <div className="tomorrow-section">
      <h4>📅 Tomorrow's Plan</h4>
      <div style={{ fontSize:".7rem", color:"var(--muted)", marginBottom:".75rem" }}>
        {plan.total} pending task{plan.total!==1?"s":""} — auto-organised by priority
      </div>
      {SECTIONS.map(({ key, label, cls }) =>
        plan[key].length > 0 && (
          <div className="pri-section" key={key}>
            <div className={`pri-label ${cls}`}>{label}</div>
            {plan[key].map((t) => (
              <div key={t.id} style={{ fontSize:".78rem", padding:".25rem .4rem", borderLeft:"2px solid var(--border)", marginBottom:".2rem", color:"var(--muted)" }}>
                {t.text}
              </div>
            ))}
          </div>
        )
      )}
      {plan.total === 0 && <p className="log-empty">All tasks complete! Add more from the task board.</p>}
    </div>
  );
}

// ── Smart routine card ────────────────────────────────────────────────────
function RoutineCard() {
  const { tasks, sessionLog } = useApp();
  const [freeHours, setFreeHours] = useState(6);

  const peakHour = useMemo(() => {
    const arr = new Array(24).fill(0);
    sessionLog.forEach((e) => { if (e.hour >= 0 && e.hour < 24) arr[e.hour] += e.secs; });
    return arr.indexOf(Math.max(...arr)) || 10;
  }, [sessionLog]);

  const routine = useMemo(
    () => generateRoutine(tasks, freeHours, peakHour),
    [tasks, freeHours, peakHour]
  );

  return (
    <div className="sc">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".85rem" }}>
        <h4 style={{ margin:0 }}>🗓 Smart Routine</h4>
        <div style={{ display:"flex", alignItems:"center", gap:".4rem", fontSize:".72rem", color:"var(--muted)" }}>
          Free time:
          <input
            className="goal-input" type="number" min="1" max="16" value={freeHours}
            onChange={(e) => setFreeHours(+e.target.value)}
            style={{ width:44 }}
          />
          hrs
        </div>
      </div>

      {routine.length === 0 ? (
        <p className="log-empty">Add pending tasks to generate a routine.</p>
      ) : (
        routine.map((r, i) => (
          <div key={i} className={`routine-row${r.isPeak?" routine-peak":""}`}>
            <span className="routine-time">{r.label}</span>
            <span className="routine-task">{r.task.text}</span>
            {r.isPeak && <span style={{ fontFamily:"var(--mono)", fontSize:".6rem", color:"var(--cyan)", whiteSpace:"nowrap" }}>⚡ peak</span>}
            <span className="routine-dur">{r.durationMins}m</span>
          </div>
        ))
      )}

      <div style={{ fontSize:".68rem", color:"var(--muted)", marginTop:".55rem", fontFamily:"var(--mono)" }}>
        Peak study hour detected: {peakHour}:00
      </div>
    </div>
  );
}
