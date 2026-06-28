import { useState, FormEvent } from "react";
import { useApp } from "../../context/AppContext";
import { useVoicePlanner } from "../../hooks/useVoicePlanner";
import { Mic, MicOff, Plus, Trash2, Calendar, CornerDownLeft, Target, AlertCircle } from "lucide-react";
import { getSubjectColor, getSubjectName } from "../../utils/helpers";

export default function PlannerPage() {
  const { 
    tasks, addTask, delTask, togTask, subjects, 
    activeSubjId, setActiveSubjId 
  } = useApp();

  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

  // Callback to handle transcribed voice tasks
  const handleVoiceParsed = (res: { text: string; priority: "high" | "medium" | "low"; subjectId: string | null }) => {
    addTask(res.text, { priority: res.priority, subjId: res.subjectId });
    // Alert user that voice worked
    setTranscriptionActive(true);
    setTranscribedSummary(`Allocated: "${res.text}" as ${res.priority} priority.`);
    setTimeout(() => {
      setTranscriptionActive(false);
      setTranscribedSummary("");
    }, 4500);
  };

  const { isListening, errorText, startListening, stopListening } = useVoicePlanner({
    onParsed: handleVoiceParsed,
    subjects
  });

  const [transcriptionActive, setTranscriptionActive] = useState(false);
  const [transcribedSummary, setTranscribedSummary] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    addTask(taskText.trim(), { priority, subjId: activeSubjId });
    setTaskText("");
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Divide tasks into Priority buckets for a Kanban visual presentation board
  const highTasks = tasks.filter((t) => t.priority === "high");
  const medTasks = tasks.filter((t) => t.priority === "medium");
  const lowTasks = tasks.filter((t) => t.priority === "low");

  return (
    <div className="constrain-layout py-8 space-y-8 fade-in">
      
      {/* Header Container Titles */}
      <div className="page-header-container">
        <div className="sl">// AI Routine & Voice Structurer</div>
        <h2 className="page-title">Task Planner Operating Table</h2>
        <p className="page-sub">
          Dictate study blocks using spoken statements or structure targeted subject backlogs here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Column: Speech Transcriber Overlay & Add panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Real-time Voice dictation hub */}
          <div className="sc space-y-4">
            
            <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl">
              VOICE PIPELINE
            </h3>

            <div style={{
              backgroundColor: isListening ? "rgba(0, 229, 255, 0.05)" : "rgba(10, 15, 30, 0.3)",
              borderColor: isListening ? "var(--cyan)" : "var(--border)",
              borderWidth: "1px",
              padding: "1.25rem",
              borderRadius: "12px",
              textAlign: "center",
              position: "relative"
            }}>
              
              <button 
                onClick={handleMicToggle}
                style={{
                  width: "54px", height: "54px",
                  borderRadius: "50%",
                  backgroundColor: isListening ? "var(--red)" : "rgba(0, 229, 255, 0.08)",
                  color: isListening ? "white" : "var(--cyan)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: isListening ? "none" : "1px solid var(--cyan)",
                  margin: "0 auto"
                }}
                className={`hover:scale-105 active:scale-95 transition-all ${isListening ? "pulse-anim shadow-lg shadow-red-500" : ""}`}
                title={isListening ? "Cease Dictation" : "Dictate Task Block"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <div style={{ fontSize: "0.78rem", fontWeight: "600", marginTop: "1rem" }}>
                {isListening ? "Listening... Speak naturally." : "Voice Parser offline"}
              </div>

              <p style={{ fontSize: "0.68rem", color: "var(--muted)", fontStyle: "italic", marginTop: "0.5rem" }} className="max-w-[240px] mx-auto">
                "Solve chemistry calculus tasks tonight at high priority"
              </p>

              {/* Speech Engine Feedback alerts */}
              {errorText && (
                <div style={{ fontSize: "0.7rem", color: "var(--red)", marginTop: "0.75rem" }} className="flex items-center gap-1 justify-center">
                  <AlertCircle size={10} /> {errorText}
                </div>
              )}

              {transcriptionActive && (
                <div style={{
                  fontSize: "0.72rem",
                  color: "var(--green)",
                  backgroundColor: "rgba(0, 255, 136, 0.03)",
                  border: "1px solid rgba(0, 255, 136, 0.2)",
                  padding: "0.5rem", borderRadius: "6px",
                  marginTop: "0.75rem"
                }} className="slide-left">
                  {transcribedSummary}
                </div>
              )}

            </div>

          </div>

          {/* Core manual schedule injector form */}
          <div className="sc space-y-4">
            
            <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl">
              SCHEDULE BLOCK
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Task description</label>
                <input 
                  type="text" 
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "0.55rem",
                    backgroundColor: "rgba(5, 8, 16, 0.5)",
                    border: "1px solid var(--border)",
                    color: "white", fontSize: "0.8rem", borderRadius: "6px",
                    outline: "none"
                  }}
                  className="focus:border-cyan-400"
                  placeholder="E.g., Complete section 2 labs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Priority Scale</label>
                  <select 
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    style={{
                      width: "100%", padding: "0.5rem",
                      backgroundColor: "rgba(10, 15, 30, 0.7)",
                      border: "1px solid var(--border)",
                      color: "var(--text)", fontSize: "0.75rem", borderRadius: "6px",
                      outline: "none"
                    }}
                  >
                    <option value="high">🔥 High</option>
                    <option value="medium">⚡ Medium</option>
                    <option value="low">🌱 Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Link Subject</label>
                  <select 
                    value={activeSubjId || ""}
                    onChange={(e: any) => setActiveSubjId(e.target.value || null)}
                    style={{
                      width: "100%", padding: "0.5rem",
                      backgroundColor: "rgba(10, 15, 30, 0.7)",
                      border: "1px solid var(--border)",
                      color: "var(--text)", fontSize: "0.75rem", borderRadius: "6px",
                      outline: "none"
                    }}
                  >
                    <option value="">No Subject module</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>■ {s.name}</option>
                    ))}
                  </select>
                </div>

              </div>

              <button 
                type="submit"
                style={{
                  width: "100%", padding: "0.6rem",
                  backgroundColor: "var(--cyan)", color: "black",
                  fontWeight: "600", fontSize: "0.8rem", borderRadius: "6px",
                  cursor: "pointer", transition: "transform 0.15s, opacity 0.15s"
                }}
                className="flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
              >
                <Plus size={12} /> Link Schedule Item
              </button>

            </form>

          </div>

        </div>

        {/* Right Columns: Kanban boards categorized by Priority status */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* HIGH PRIORITY */}
          <div className="sc space-y-3 flex flex-col justify-between" style={{ minHeight: "350px", borderColor: "rgba(255, 68, 68, 0.15)" }}>
            <div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                <span className="text-red-400 text-xs font-bold tracking-wider">// 🔥 CRITICAL</span>
                <span className="font-mono text-[10px] text-slate-500">{highTasks.length} left</span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {highTasks.map((t) => (
                  <div key={t.id} style={{ borderLeft: "2px solid #ff4444" }} className="bg-[#090d1a] border border-slate-900 rounded p-2 flex.5 flex justify-between gap-1 text-xs text-slate-200">
                    <div className="min-w-0 flex items-start gap-1 py-1">
                      <input 
                        type="checkbox" 
                        checked={t.done} 
                        onChange={() => togTask(t.id)}
                        className="mt-0.5"
                      />
                      <span className={`truncate ${t.done ? "line-through text-slate-600" : ""}`}>{t.text}</span>
                    </div>
                    <button onClick={() => delTask(t.id)} className="text-slate-600 hover:text-red-400 p-0 bg-none border-none cursor-pointer"><Trash2 size={11} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MEDIUM PRIORITY */}
          <div className="sc space-y-3 flex flex-col justify-between" style={{ minHeight: "350px", borderColor: "rgba(0, 229, 255, 0.15)" }}>
            <div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                <span className="text-cyan-400 text-xs font-bold tracking-wider">// ⚡ MEDIUM</span>
                <span className="font-mono text-[10px] text-slate-500">{medTasks.length} left</span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {medTasks.map((t) => (
                  <div key={t.id} style={{ borderLeft: "2px solid #00e5ff" }} className="bg-[#090d1a] border border-slate-900 rounded p-2 flex.5 flex justify-between gap-1 text-xs text-slate-200">
                    <div className="min-w-0 flex items-start gap-1 py-1">
                      <input 
                        type="checkbox" 
                        checked={t.done} 
                        onChange={() => togTask(t.id)}
                        className="mt-0.5"
                      />
                      <span className={`truncate ${t.done ? "line-through text-slate-600" : ""}`}>{t.text}</span>
                    </div>
                    <button onClick={() => delTask(t.id)} className="text-slate-600 hover:text-red-400 p-0 bg-none border-none cursor-pointer"><Trash2 size={11} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LOW PRIORITY */}
          <div className="sc space-y-3 flex flex-col justify-between" style={{ minHeight: "350px", borderColor: "rgba(0, 255, 136, 0.15)" }}>
            <div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                <span className="text-emerald-400 text-xs font-bold tracking-wider">// 🌱 EXPANSION</span>
                <span className="font-mono text-[10px] text-slate-500">{lowTasks.length} left</span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {lowTasks.map((t) => (
                  <div key={t.id} style={{ borderLeft: "2px solid #00ff88" }} className="bg-[#090d1a] border border-slate-900 rounded p-2 flex.5 flex justify-between gap-1 text-xs text-slate-200">
                    <div className="min-w-0 flex items-start gap-1 py-1">
                      <input 
                        type="checkbox" 
                        checked={t.done} 
                        onChange={() => togTask(t.id)}
                        className="mt-0.5"
                      />
                      <span className={`truncate ${t.done ? "line-through text-slate-600" : ""}`}>{t.text}</span>
                    </div>
                    <button onClick={() => delTask(t.id)} className="text-slate-600 hover:text-red-400 p-0 bg-none border-none cursor-pointer"><Trash2 size={11} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
export type PlannerPageState = ReturnType<typeof PlannerPage>;
