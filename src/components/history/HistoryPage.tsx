import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getSubjectColor, getSubjectName, formatTime } from "../../utils/helpers";
import { exportSessionCSV } from "../../utils/export";
import { Download, Upload, Trash2, Calendar, FileText, CheckCircle } from "lucide-react";

export default function HistoryPage() {
  const { 
    sessionLog, subjects, clearSessionLog, updateSessionNotes 
  } = useApp();

  const [notesEditingID, setNotesEditingID] = useState<number | null>(null);
  const [editingNotesText, setEditingNotesText] = useState("");

  const handleEditNotes = (id: number, currentNotes: string) => {
    setNotesEditingID(id);
    setEditingNotesText(currentNotes || "");
  };

  const handleSaveNotes = (id: number) => {
    updateSessionNotes(id, editingNotesText);
    setNotesEditingID(null);
  };

  const handleExportCSV = () => {
    exportSessionCSV(sessionLog, subjects);
  };

  // Safe History Purge
  const handlePurge = () => {
    if (window.confirm("Are you positive you wish to fully purge and delete your entire study history log? This cannot be undone.")) {
      clearSessionLog();
    }
  };

  return (
    <div className="constrain-layout py-8 space-y-8 fade-in">
      
      {/* Page Header */}
      <div className="page-header-container">
        <div className="sl">// Course Archives & Ledger Databases</div>
        <h2 className="page-title">Completed Study Journals</h2>
        <p className="page-sub">
          Review, annotate, and export logs compiled across previous learning blocks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main List Column */}
        <div className="lg:col-span-9 space-y-4">
          
          <div className="sc">
            
            {/* List Headers */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-4">
              <span className="text-xs font-bold text-slate-400">// STUDY JOURNAL</span>
              <span className="font-mono text-[10px] text-slate-500">{sessionLog.length} rows</span>
            </div>

            {/* List Iteration */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {sessionLog.length > 0 ? (
                sessionLog.slice().reverse().map((entry, idx) => (
                  <div 
                    key={entry.id}
                    className="bg-[#090d1a] border border-slate-900 rounded-lg p-4 space-y-3 hover:border-slate-800 transition"
                  >
                    
                    {/* Row meta headers */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-900 pb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-cyan-400" />
                        <span className="font-bold text-slate-200">Session #{entry.sessionIndex || sessionLog.length - idx}</span>
                        {entry.subjId && (
                          <span 
                            style={{
                              backgroundColor: "rgba(0, 229, 255, 0.04)",
                              borderColor: getSubjectColor(entry.subjId, subjects),
                              color: getSubjectColor(entry.subjId, subjects),
                              fontSize: "0.65rem",
                              padding: "0.1rem 0.5rem",
                              borderRadius: "12px",
                              border: "1px solid"
                            }}
                            className="font-mono truncate max-w-[120px]"
                          >
                            {getSubjectName(entry.subjId, subjects)}
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: "0.7rem" }} className="font-mono text-slate-500">
                        {new Date(entry.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>

                    {/* Completion stats outputs */}
                    <div className="flex justify-between items-center text-xs pt-1">
                      <div>
                        <span className="text-slate-500">Worked:</span>{" "}
                        <span className="font-mono font-bold text-cyan-400">{formatTime(entry.secs)}</span>
                      </div>
                    </div>

                    {/* Notes editing block */}
                    <div className="bg-slate-950/40 p-2 border border-slate-900/60 rounded">
                      {notesEditingID === entry.id ? (
                        <div className="space-y-2">
                          <textarea 
                            value={editingNotesText}
                            onChange={(e) => setEditingNotesText(e.target.value)}
                            rows={2}
                            style={{
                              width: "100%", padding: "0.5rem",
                              backgroundColor: "rgba(5, 8, 16, 0.5)",
                              border: "1px solid var(--border)",
                              color: "white", fontSize: "0.75rem", borderRadius: "6px",
                              outline: "none", resize: "none"
                            }}
                            className="focus:border-cyan-400"
                            placeholder="Add self-assessment logs..."
                          />
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => setNotesEditingID(null)}
                              className="px-2 py-1 text-[10px] text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleSaveNotes(entry.id)}
                              className="px-2.5 py-1 text-[10px] bg-cyan-400 text-black font-semibold rounded"
                            >
                              Save Notes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-3">
                          <p style={{ fontSize: "0.74rem", color: entry.notes ? "var(--text)" : "var(--muted)", margin: 0 }} className="italic">
                            {entry.notes ? `"${entry.notes}"` : "No session notes added."}
                          </p>
                          <button 
                            onClick={() => handleEditNotes(entry.id, entry.notes)}
                            style={{
                              padding: "0.2rem 0.5rem",
                              fontSize: "0.62rem",
                              color: "var(--cyan)",
                              backgroundColor: "rgba(0, 229, 255, 0.04)",
                              border: "1px solid var(--border)",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                            className="flex items-center gap-1 hover:border-cyan-400"
                          >
                            <FileText size={10} /> Edit notes
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))
              ) : (
                <div style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: "0.62rem", letterSpacing: "1.5px", padding: "3rem 0", textAlign: "center" }} className="sc">
                  No previous sessions stored in ledger. Complete focus intervals to register history logs!
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right backup panel */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="sc space-y-4">
            
            <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl">
              METRIC ACTIONS
            </h3>

            {/* Export CSV buttons */}
            <button
              onClick={handleExportCSV}
              disabled={sessionLog.length === 0}
              style={{
                width: "100%", padding: "0.6rem",
                backgroundColor: "rgba(0, 229, 255, 0.08)",
                borderColor: "var(--cyan)",
                color: "var(--cyan)",
                border: "1px solid",
                fontWeight: "semibold", fontSize: "0.75rem", borderRadius: "6px",
                cursor: "pointer"
              }}
              className="flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition"
            >
              <Download size={12} /> Export CSV Spreadsheet
            </button>

            {/* Clear database log option */}
            <button
              onClick={handlePurge}
              disabled={sessionLog.length === 0}
              style={{
                width: "100%", padding: "0.6rem",
                backgroundColor: "rgba(255, 68, 68, 0.08)",
                borderColor: "rgba(255, 68, 68, 0.2)",
                color: "var(--red)",
                border: "1px solid",
                fontWeight: "semibold", fontSize: "0.75rem", borderRadius: "6px",
                cursor: "pointer"
              }}
              className="flex items-center justify-center gap-1.5 hover:bg-opacity-90 active:scale-[0.98] transition"
            >
              <Trash2 size={12} /> Purge Ledger Rows
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
export type HistoryPageState = ReturnType<typeof HistoryPage>;
