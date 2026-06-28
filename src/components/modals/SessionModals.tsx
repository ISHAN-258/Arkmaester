import { useApp } from "../../context/AppContext";
import { X, Flame, Sparkles, BookOpen, Clock, AlertCircle } from "lucide-react";
import { getSubjectName, getSubjectColor, formatTime } from "../../utils/helpers";
import { useState, useEffect, FormEvent } from "react";

export default function SessionModals() {
  const { 
    toast, setToast, 
    notesModal, setNotesModal, updateSessionNotes, 
    subjects 
  } = useApp();

  const [notesInput, setNotesInput] = useState("");

  // Keep notes synchronized with modal entry changes
  useEffect(() => {
    if (notesModal?.entry) {
      setNotesInput("");
    }
  }, [notesModal]);

  const handleNotesSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (notesModal?.entry) {
      updateSessionNotes(notesModal.entry.id, notesInput.trim());
      setNotesModal(null);
    }
  };

  return (
    <>
      {/* 1. Bottom Toast Notification Overlay */}
      {toast && (
        <div 
          style={{
            position: "fixed",
            bottom: "1.5rem", right: "1.5rem",
            backgroundColor: "rgba(5, 8, 16, 0.95)",
            border: "1px solid var(--cyan)",
            boxShadow: "0 0 20px rgba(0, 229, 255, 0.2)",
            borderRadius: "12px",
            padding: "1rem",
            width: "320px",
            zIndex: 1500,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem"
          }}
          className="slide-left"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-cyan-400 uppercase">
              <Sparkles size={12} /> Study Cycle Logged!
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-500 hover:text-white"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <X size={14} />
            </button>
          </div>

          <p style={{ fontSize: "0.76rem", color: "var(--text)" }}>
            Completed focus block of{" "}
            <strong className="text-cyan-400">{formatTime(toast.secs)}</strong>
            {toast.subjId && (
              <>
                {" "}for{" "}
                <strong style={{ color: getSubjectColor(toast.subjId, subjects) }}>
                  {getSubjectName(toast.subjId, subjects)}
                </strong>
              </>
            )}
            . Well done scholar!
          </p>
        </div>
      )}

      {/* 2. Pomodoro Session Notes annotation Prompt (Full scale Modal overlay) */}
      {notesModal?.entry && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(3, 5, 10, 0.85)",
          backdropFilter: "blur(6px)",
          zIndex: 1600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem"
        }} className="fade-in">
          
          <div style={{
            maxWidth: "440px",
            width: "100%",
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "1.5rem",
            position: "relative"
          }} className="scale-up space-y-4">
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs font-bold uppercase">
                <BookOpen size={14} /> Annotate Journal Entry
              </div>
              <button 
                onClick={() => setNotesModal(null)}
                className="text-slate-500 hover:text-white"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", fontFamily: "var(--syne)" }}>
                Describe Your Flow
              </h3>
              <p style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                Supplement the study session with text summary logs. What questions were answered?
              </p>
            </div>

            {/* Quick stats tags */}
            <div className="flex gap-4 p-2 bg-[#090d1a] border border-slate-900 rounded-lg text-xs font-mono">
              <div className="flex items-center gap-1">
                <Clock size={11} className="text-cyan-400" />
                <span className="text-slate-400">Duration:</span>
                <span className="text-white font-bold">{formatTime(notesModal.entry.secs)}</span>
              </div>
              {notesModal.entry.subjId && (
                <div className="flex items-center gap-1">
                  <span style={{ color: getSubjectColor(notesModal.entry.subjId, subjects) }}>■</span>
                  <span className="text-slate-400">Module:</span>
                  <span className="text-white font-bold truncate max-w-[120px]">
                    {getSubjectName(notesModal.entry.subjId, subjects)}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleNotesSubmit} className="space-y-4">
              
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                rows={3}
                style={{
                  width: "100%", padding: "0.6rem",
                  backgroundColor: "rgba(5, 8, 16, 0.5)",
                  border: "1px solid var(--border)",
                  color: "white", fontSize: "0.8rem", borderRadius: "8px",
                  outline: "none", resize: "none"
                }}
                className="focus:border-cyan-400"
                placeholder="E.g., Solved electromagnetic vector integrals under section 5.2. Understood formulas but struggled with cross ratios."
              />

              <div className="flex gap-2.5 justify-end">
                <button 
                  type="button"
                  onClick={() => setNotesModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Skip annotation
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-cyan-400 text-black text-xs font-bold rounded-lg hover:bg-cyan-300 transition"
                >
                  Commit Entry
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

    </>
  );
}
export type SessionModalsState = ReturnType<typeof SessionModals>;
