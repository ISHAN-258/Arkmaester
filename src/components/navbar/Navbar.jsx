import { useState, useCallback } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useTheme, THEMES } from "../../hooks/useTheme.js";
import { fmtTime } from "../../utils/helpers.js";

const NAV = [
  { id:"home",     label:"Home",     icon:"H" },
  { id:"study",    label:"Timer",    icon:"T" },
  { id:"tracker",  label:"Tracker",  icon:"F" },
  { id:"planner",  label:"Planner",  icon:"P" },
  { id:"insights", label:"Insights", icon:"I" },
  { id:"history",  label:"History",  icon:"R" },
  { id:"chat",     label:"AI Chat",  icon:"AI" },
];

export default function Navbar({ timerState, onOpenHelp }) {
  const { page, setPage } = useApp();
  const { theme, setTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { tl, running } = timerState;

  const goTo = useCallback((id) => { setPage(id); setDrawerOpen(false); }, [setPage]);

  return (
    <nav className="nav">
      {/* Logo */}
      <div className="nav-logo" onClick={() => goTo("home")}>
        <div className="nav-logo-mark">A</div>
        ARK<span>MAESTER</span>
      </div>

      {/* Desktop links */}
      <div className="nav-links">
        {NAV.map((item) => (
          <button key={item.id} className={`nav-btn${page===item.id?" active":""}`} onClick={() => goTo(item.id)}>
            <span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
        <button className={`timer-pill${running?" running":""}`} onClick={() => goTo("study")} title="Timer">
          {running ? "▶ " : ""}{fmtTime(tl)}
        </button>
        <button className="nav-help-btn" onClick={onOpenHelp} title="How Arkmaester Works" aria-label="How Arkmaester Works">?</button>
        <select className="theme-select" value={theme} onChange={(e) => setTheme(e.target.value)} title="Theme">
          {THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      {/* Hamburger */}
      <button className={`nav-hamburger${drawerOpen?" open":""}`} onClick={() => setDrawerOpen((o) => !o)} aria-label="Menu">
        <span /><span /><span />
      </button>

      {/* Mobile drawer */}
      <div className={`nav-drawer${drawerOpen?" open":""}`}>
        {NAV.map((item) => (
          <button key={item.id} className={`nav-btn${page===item.id?" active":""}`} onClick={() => goTo(item.id)}><span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></button>
        ))}
        <button className={`timer-pill${running?" running":""}`} onClick={() => goTo("study")}>{running ? "▶ " : ""}{fmtTime(tl)}</button>
        <button className="nav-help-btn" onClick={() => { onOpenHelp?.(); setDrawerOpen(false); }} style={{ width:"100%", borderRadius:8, marginTop:".4rem" }}>
          ? How It Works
        </button>
        <select className="theme-select" value={theme} onChange={(e) => setTheme(e.target.value)} style={{ marginTop:".4rem", width:"100%", padding:".4rem" }}>
          {THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>
    

      <div className="mobile-nav" aria-label="Primary navigation">
        {NAV.filter((item) => ["home", "study", "tracker", "planner", "chat"].includes(item.id)).map((item) => (
          <button key={item.id} className={"mobile-nav-item" + (page===item.id ? " active" : "")} onClick={() => goTo(item.id)}>
            <span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}



