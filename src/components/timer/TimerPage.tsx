import { useApp } from "../../context/AppContext";
import TimerRing from "./TimerRing";
import PomoSettings from "./PomoSettings";
import AmbientPanel from "./AmbientPanel";
import GoalCard from "./GoalCard";
import ShortcutsCard from "./ShortcutsCard";
import { CheckSquare, Square, Trash2, Plus, Target } from "lucide-react";
import { useState, FormEvent } from "react";
import { getSubjectColor, getSubjectName } from "../../utils/helpers";

interface TimerPageProps {
  timerState: any;
}

export default function TimerPage({ timerState }: TimerPageProps) {
  const { 
    tasks, togTask, delTask, addTask, subjects,
    activeSubjId 
  } = useApp();

  const [newTaskText, setNewTaskText] = useState("");

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(newTaskText.trim(), { subjId: activeSubjId });
    setNewTaskText("");
  };

  // Filter tasks belonging to active subject, or all if none selected
  const filteredTasks = tasks.filter((t) => !activeSubjId || t.subjId === activeSubjId);

  return (
    <div className="constrain-layout py-8 space-y-8 fade-in">
      
      {/* Page Title Header */}
      <div className="page-header-container">
        <div className="sl">// Operational Study Matrix</div>
        <h2 className="page-title">Pomodoro Study Core</h2>
        <p className="page-sub">
          Lock in focus blocks, synthesize neural waves, and track active course modules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Radial Time Gauge clock (Large span) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sc flex flex-col items-center">
            {activeSubjId && (
              <div 
                style={{
                  backgroundColor: "rgba(0, 229, 255, 0.05)",
                  borderColor: getSubjectColor(activeSubjId, subjects),
                  color: getSubjectColor(activeSubjId, subjects),
                  fontFamily: "var(--mono)",
                  fontSize: "0.7rem",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  border: "1px solid",
                  marginBottom: "1rem"
                }}
                className="flex items-center gap-1 slide-left"
              >
                <Target size={11} /> Tracking: {getSubjectName(activeSubjId, subjects)}
              </div>
            )}
            <TimerRing timerState={timerState} />
          </div>
          
          <GoalCard />
        </div>

        {/* Center: settings sliders and Audio synthesis dials */}
        <div className="lg:col-span-4 space-y-6">
          <PomoSettings />
          <AmbientPanel />
        </div>

        {/* Right Side: Subject Specific Task Checklist & Hotkeys */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active board checklists */}
          <div className="sc space-y-3">
            <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl">
              SUBJECT CHECKLISTS
            </h3>

            {/* Quick Task input form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input 
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder={activeSubjId ? `Add task to ${getSubjectName(activeSubjId, subjects)}...` : "Add study task..."}
                className="flex-1 text-xs bg-[#090d1a] border border-slate-800 rounded p-2 text-white outline-none focus:border-cyan-400"
              />
              <button 
                type="submit"
                className="p-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded transition font-bold"
              >
                <Plus size={14} />
              </button>
            </form>

            {/* Checkbox tasks iteration List */}
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t) => (
                  <div 
                    key={t.id}
                    className="flex justify-between items-center bg-[#090d1a] border border-slate-900 rounded p-2 text-xs text-slate-300 hover:border-slate-800 transition"
                  >
                    <div 
                      onClick={() => togTask(t.id)}
                      className="flex items-center gap-2 cursor-pointer min-w-0"
                    >
                      {t.done ? (
                        <CheckSquare size={13} className="text-cyan-400 flex-shrink-0" />
                      ) : (
                        <Square size={13} className="text-slate-500 flex-shrink-0" />
                      )}
                      <span className={`truncate ${t.done ? "line-through text-slate-600" : ""}`}>
                        {t.text}
                      </span>
                    </div>

                    <button 
                      onClick={() => delTask(t.id)}
                      className="text-slate-600 hover:text-red-400 p-1 bg-none border-none cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: "0.62rem", letterSpacing: "1.5px", padding: "1rem 0" }}>
                  No tasks scheduled. Add one above!
                </div>
              )}
            </div>

          </div>

          <ShortcutsCard />
        </div>

      </div>

    </div>
  );
}
export type TimerPageState = ReturnType<typeof TimerPage>;
