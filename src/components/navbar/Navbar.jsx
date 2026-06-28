import { useState, useCallback } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useTheme, THEMES } from "../../hooks/useTheme.js";
import { fmtTime } from "../../utils/helpers.js";

const NAV = [
  { id:"home",     label:"Home"     },
  { id:"study",    label:"Timer"    },
  { id:"tracker",  label:"Tracker"  },
  { id:"planner",  label:"Planner"  },
  { id:"insights", label:"Insights" },
  { id:"history",  label:"History"  },
  { id:"chat",     label:"AI Chat"  },
];

export default function Navbar({ timerState }) {
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
            {item.label}
          </button>
        ))}
        <button className={`timer-pill${running?" running":""}`} onClick={() => goTo("study")} title="Timer">
          {running ? "▶ " : ""}{fmtTime(tl)}
        </button>
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
          <button key={item.id} className={`nav-btn${page===item.id?" active":""}`} onClick={() => goTo(item.id)}>{item.label}</button>
        ))}
        <button className={`timer-pill${running?" running":""}`} onClick={() => goTo("study")}>{running ? "▶ " : ""}{fmtTime(tl)}</button>
        <select className="theme-select" value={theme} onChange={(e) => setTheme(e.target.value)} style={{ marginTop:".4rem", width:"100%", padding:".4rem" }}>
          {THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>
    </nav>
  );
}
