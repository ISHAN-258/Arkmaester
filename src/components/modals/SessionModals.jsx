import { useState, useCallback } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { fmtDuration } from "../../utils/helpers.js";
import { exportSessionTxt } from "../../utils/export.js";

// ── Session completion toast ───────────────────────────────────────────────
export function SessionToast() {
  const { toast, setToast, subjects, setReportEntry } = useApp();
  if (!toast) return null;

  const subj = subjects.find((s) => s.id === toast.subjId);
  return (
    <div className="session-toast" onClick={() => setToast(null)}>
      <h5>🎉 Session Complete!</h5>
      <p>
        {subj ? <><span style={{ color:subj.color }}>● </span>{subj.name} · </> : ""}
        {fmtDuration(toast.secs)}
      </p>
      {toast.entry && (
        <button
          className="report-btn"
          style={{ marginTop:".5rem", fontSize:".68rem", padding:".28rem .65rem" }}
          onClick={(e) => { e.stopPropagation(); setReportEntry(toast.entry); setToast(null); }}
        >
          📊 View Report
        </button>
      )}
    </div>
  );
}

// ── Session report modal ───────────────────────────────────────────────────
export function ReportModal() {
  const { reportEntry, setReportEntry, subjects } = useApp();
  if (!reportEntry) return null;

  const e    = reportEntry;
  const subj = subjects.find((s) => s.id === e.subjId);
  const d    = new Date(e.ts);

  return (
    <div className="modal-bg" onClick={() => setReportEntry(null)}>
      <div className="modal" onClick={(ev) => ev.stopPropagation()}>
        <button className="modal-close" onClick={() => setReportEntry(null)}>✕</button>
        <h4>📊 Arkmaester Session Report</h4>

        {[
          ["Subject",   subj ? subj.name : "Untagged"],
          ["Duration",  fmtDuration(e.secs)],
          ["Date",      d.toLocaleDateString([], { weekday:"long", year:"numeric", month:"long", day:"numeric" })],
          ["Time",      d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })],
          ["Session #", e.sessionIndex ?? 1],
        ].map(([l, v]) => (
          <div className="report-row" key={l}>
            <span style={{ color:"var(--muted)", fontSize:".8rem" }}>{l}</span>
            <span className="report-val">{v}</span>
          </div>
        ))}

        {e.notes && (
          <div style={{ marginTop:".75rem" }}>
            <div style={{ fontSize:".68rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"1px", marginBottom:".3rem" }}>NOTES</div>
            <div className="notes-entry">{e.notes}</div>
          </div>
        )}

        <div>
          <button
            className="report-btn primary"
            onClick={() => exportSessionTxt(e, subjects)}
          >
            ↓ Export TXT
          </button>
          <button className="report-btn" onClick={() => setReportEntry(null)}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Session notes modal ────────────────────────────────────────────────────
export function NotesModal() {
  const { notesModal, setNotesModal, updateSessionNotes, subjects, setReportEntry } = useApp();
  const [text,     setText]     = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSave = useCallback(() => {
    if (notesModal?.entry) updateSessionNotes(notesModal.entry.id, text.trim());
    setNotesModal(null);
    setText("");
    setExpanded(false);
  }, [notesModal, text, updateSessionNotes, setNotesModal]);

  const handleSkip = () => {
    setNotesModal(null);
    setText("");
    setExpanded(false);
  };

  if (!notesModal) return null;
  const e    = notesModal.entry;
  const subj = subjects.find((s) => s.id === e?.subjId);

  return (
    <div className="modal-bg" onClick={handleSkip}>
      <div className="modal notes-modal" onClick={(ev) => ev.stopPropagation()}>
        <button className="modal-close" onClick={handleSkip}>✕</button>
        <h4>📝 Arkmaester — Session Reflection</h4>
        <p style={{ fontSize:".78rem", color:"var(--muted)", marginBottom:".85rem", lineHeight:1.6 }}>
          Arkmaester commends your effort!{subj ? ` Subject: ${subj.name}.` : ""} Take a moment to reflect on this session.
        </p>

        <textarea
          className="notes-ta"
          style={{ minHeight: expanded ? 150 : 72 }}
          placeholder="What did you learn? Any blockers? What to do differently next time?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <button className="notes-expand" onClick={() => setExpanded((x) => !x)}>
          {expanded ? "▲ Collapse" : "▼ Expand"}
        </button>

        <div style={{ display:"flex", gap:".5rem", marginTop:".85rem" }}>
          <button className="btn-p" style={{ flex:1 }} onClick={handleSave}>Save Note</button>
          <button className="btn-o" onClick={handleSkip}>Skip</button>
          {e && (
            <button
              className="btn-o"
              onClick={() => { handleSkip(); setReportEntry(e); }}
            >
              View Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
