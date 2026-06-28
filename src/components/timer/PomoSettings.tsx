import { useApp } from "../../context/AppContext";
import { Plus, Trash2, Check } from "lucide-react";
import { useState, FormEvent } from "react";

export default function PomoSettings() {
  const { 
    pomoMins, setPomoMins, 
    subjects, addSubject, deleteSubject, 
    activeSubjId, setActiveSubjId 
  } = useApp();

  const [newSubjName, setNewSubjName] = useState("");
  const [newSubjColor, setNewSubjColor] = useState("#00e5ff");
  const [showAdder, setShowAdder] = useState(false);

  const colorsPreset = ["#00e5ff", "#00ff88", "#ffb300", "#a78bfa", "#ff4444", "#38bdf8", "#ec4899"];

  const handleAddSubject = (e: FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    addSubject({
      id: newSubjName.trim().toLowerCase().replace(/\s+/g, "-"),
      name: newSubjName.trim(),
      color: newSubjColor
    });

    setNewSubjName("");
    setShowAdder(false);
  };

  return (
    <div className="sc space-y-4">
      <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl">
        SESSION CONTROL
      </h3>

      {/* Slider duration block */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">Block Duration</span>
          <span className="font-mono text-cyan-400 font-semibold">{pomoMins} minutes</span>
        </div>
        <input 
          type="range" 
          min="5" 
          max="120" 
          step="5"
          value={pomoMins}
          onChange={(e) => setPomoMins(parseInt(e.target.value))}
          style={{ width: "100%", accentColor: "var(--cyan)", cursor: "pointer" }}
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>5m</span>
          <span>25m</span>
          <span>45m</span>
          <span>90m</span>
          <span>120m</span>
        </div>
      </div>

      {/* Target subject module selection block */}
      <div className="space-y-2 pt-2 border-t border-slate-900">
        <label className="text-xs font-bold text-slate-300 block">Target Subject</label>
        
        {/* Horizontal grid selectors map */}
        <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
          {subjects.map((sub) => {
            const active = activeSubjId === sub.id;
            return (
              <div 
                key={sub.id}
                onClick={() => setActiveSubjId(active ? null : sub.id)}
                style={{
                  borderColor: active ? sub.color : "var(--border)",
                  backgroundColor: active ? "rgba(0, 229, 255, 0.05)" : "transparent",
                  cursor: "pointer",
                }}
                className="p-2 border rounded-lg flex items-center justify-between text-xs text-slate-300 transition-all hover:border-slate-500"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span style={{ color: sub.color }}>■</span>
                  <span className="truncate">{sub.name}</span>
                </div>
                {active && <Check size={11} style={{ color: sub.color }} />}
              </div>
            );
          })}
        </div>

        {/* Dynamic courses adder controls */}
        {showAdder ? (
          <form onSubmit={handleAddSubject} className="space-y-3 p-3 bg-[#090d1a] border border-slate-800 rounded-lg fade-up">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Subject Name</label>
              <input 
                type="text"
                value={newSubjName}
                onChange={(e) => setNewSubjName(e.target.value)}
                required
                className="w-full text-xs p-1.5 bg-slate-950 border border-slate-800 text-white rounded outline-none focus:border-cyan-400"
                placeholder="E.g., Microelectronics"
              />
            </div>
            
            <div>
              <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Color Key</label>
              <div className="flex flex-wrap gap-2">
                {colorsPreset.map((c) => (
                  <button 
                    key={c}
                    type="button"
                    onClick={() => setNewSubjColor(c)}
                    style={{ backgroundColor: c, border: newSubjColor === c ? "2px solid white" : "none" }}
                    className="w-5 h-5 rounded-full cursor-pointer hover:scale-105"
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button 
                type="button" 
                onClick={() => setShowAdder(false)}
                className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-2 py-1 text-[11px] bg-cyan-400 text-black font-semibold rounded"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setShowAdder(true)}
            style={{
              padding: "0.4rem",
              fontSize: "0.72rem",
              width: "100%",
              backgroundColor: "rgba(10, 15, 30, 0.4)",
              color: "var(--cyan)",
              border: "1px dashed var(--cyan)",
              borderRadius: "6px",
              cursor: "pointer"
            }}
            className="flex items-center justify-center gap-1.5 hover:scale-[1.01] transition active:scale-95 mt-1"
          >
            <Plus size={11} /> Add Subject Module
          </button>
        )}
      </div>

    </div>
  );
}
export type PomoSettingsState = ReturnType<typeof PomoSettings>;
