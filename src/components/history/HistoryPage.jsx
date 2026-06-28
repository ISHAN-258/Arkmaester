import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { fmtDuration } from "../../utils/helpers.js";
import { exportSessionCSV, exportSessionTxt } from "../../utils/export.js";

export default function HistoryPage() {
  const { sessionLog, subjects, clearSessionLog, setReportEntry } = useApp();
  const [filter, setFilter] = useState("all");
  const [sort,   setSort]   = useState("newest");
  const [search, setSearch] = useState("");
  const [page,   setPageNum] = useState(1);
  const PER_PAGE = 12;

  const filtered = useMemo(() => {
    let list = [...sessionLog];

    // Subject filter
    if (filter !== "all") {
      const id = +filter;
      list = list.filter((e) => e.subjId === id);
    }

    // Search in notes
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.notes?.toLowerCase().includes(q));
    }

    // Sort
    if (sort === "newest")   list.sort((a, b) => b.ts - a.ts);
    if (sort === "oldest")   list.sort((a, b) => a.ts - b.ts);
    if (sort === "longest")  list.sort((a, b) => b.secs - a.secs);
    if (sort === "shortest") list.sort((a, b) => a.secs - b.secs);

    return list;
  }, [sessionLog, filter, sort, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalHrs  = useMemo(() => sessionLog.reduce((a, e) => a + e.secs, 0) / 3600, [sessionLog]);
  const avgMins   = useMemo(() => sessionLog.length > 0 ? Math.round(sessionLog.reduce((a, e) => a + e.secs, 0) / sessionLog.length / 60) : 0, [sessionLog]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="sl">// ARKMAESTER — HISTORY</div>
        <h2 className="page-title">History</h2>
        <p className="page-sub">Complete record of every study session.</p>
      </div>

      {/* Summary row */}
      <div className="ag" style={{ marginBottom: "1.1rem" }}>
        {[
          { l: "Total Sessions", v: sessionLog.length,           c: "var(--cyan)"  },
          { l: "Total Hours",    v: `${totalHrs.toFixed(1)}h`,   c: "var(--green)" },
          { l: "Avg Duration",   v: `${avgMins} min`,            c: "var(--amber)" },
        ].map(({ l, v, c }) => (
          <div className="as-card" key={l}>
            <div className="as-l">{l}</div>
            <div className="as-v" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "center" }}>
        <input
          className="ti" style={{ flex: 1, minWidth: 150 }}
          placeholder="Search notes…"
          value={search} onChange={(e) => { setSearch(e.target.value); setPageNum(1); }}
        />
        <select className="ai" value={filter} onChange={(e) => { setFilter(e.target.value); setPageNum(1); }}>
          <option value="all">All subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="ai" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="longest">Longest first</option>
          <option value="shortest">Shortest first</option>
        </select>
        <button className="export-btn" onClick={() => exportSessionCSV(sessionLog, subjects)}>↓ CSV</button>
        {sessionLog.length > 0 && (
          <button
            className="export-btn"
            style={{ color: "var(--red)", borderColor: "var(--red)" }}
            onClick={() => { if (confirm("Clear ALL session history?")) clearSessionLog(); }}
          >
            🗑 Clear
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="log-empty">No sessions found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
          {paginated.map((e, i) => {
            const subj = subjects.find((s) => s.id === e.subjId);
            const d    = new Date(e.ts);
            return (
              <div
                key={e.id ?? i}
                className="sc"
                style={{ padding: ".75rem 1rem", display: "flex", alignItems: "center", gap: ".75rem", cursor: "pointer", transition: "border-color .2s" }}
                onClick={() => setReportEntry(e)}
                onMouseEnter={(el) => el.currentTarget.style.borderColor = "rgba(0,229,255,.35)"}
                onMouseLeave={(el) => el.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--muted)", minWidth: 90, flexShrink: 0 }}>
                  {d.toLocaleDateString([], { month: "short", day: "numeric" })}<br />
                  <span style={{ fontSize: ".62rem" }}>{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                    {subj && <span style={{ width: 8, height: 8, borderRadius: 2, background: subj.color, flexShrink: 0 }} />}
                    <span style={{ fontSize: ".8rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {subj?.name ?? "Untagged"}
                    </span>
                  </div>
                  {e.notes && (
                    <div style={{ fontSize: ".7rem", color: "var(--muted)", marginTop: ".15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.notes}
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".8rem", color: "var(--cyan)", flexShrink: 0 }}>
                  {fmtDuration(e.secs)}
                </div>
                <button
                  className="export-btn"
                  style={{ flexShrink: 0 }}
                  onClick={(ev) => { ev.stopPropagation(); exportSessionTxt(e, subjects); }}
                >
                  ↓
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: ".35rem", justifyContent: "center", marginTop: "1rem", flexWrap: "wrap" }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`mb${page === i + 1 ? " active" : ""}`}
              onClick={() => setPageNum(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
