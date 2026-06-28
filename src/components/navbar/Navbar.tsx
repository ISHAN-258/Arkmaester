import { useApp } from "../../context/AppContext";
import { useTheme } from "../../hooks/useTheme";
import { formatTime } from "../../utils/helpers";
import { HelpCircle, Sparkles, Sliders, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  timerState: any;
  onOpenHelp?: () => void;
}

export default function Navbar({ timerState, onOpenHelp }: NavbarProps) {
  const { page, setPage } = useApp();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Dashboard" },
    { id: "study", label: "Pomo Timer" },
    { id: "tracker", label: "Focus Shield" },
    { id: "planner", label: "Routine" },
    { id: "insights", label: "Intelligence" },
    { id: "history", label: "Reports" },
    { id: "chat", label: "AI Study" },
  ];

  const handleNavClick = (id: string) => {
    setPage(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      backgroundColor: "rgba(5, 8, 16, 0.8)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      zIndex: 100,
      width: "100%"
    }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick("home")}
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1.1rem",
            letterSpacing: "3px",
            fontFamily: "var(--mono)"
          }}
          className="hover:scale-[1.02] transition"
        >
          <span style={{ color: "var(--cyan)", fontWeight: "bold" }}>ARK</span>
          <span style={{ color: "var(--text)" }}>MAESTER</span>
        </div>

        {/* Desktop Links Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  padding: "0.45rem 0.85rem",
                  color: active ? "var(--cyan)" : "var(--muted)",
                  position: "relative"
                }}
                className="hover:text-white transition rounded"
              >
                {item.label}
                {/* Active animated bottom highlight */}
                {active && (
                  <div 
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      left: "15%",
                      width: "70%",
                      height: "2px",
                      backgroundColor: "var(--cyan)",
                      borderRadius: "1px",
                      boxShadow: "0 0 10px var(--cyan)"
                    }}
                    className="slide-left"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Corner: Pill Timer / Help Icon / Theme Option */}
        <div className="flex items-center gap-3">
          
          {/* Active Timer Pill */}
          <div 
            onClick={() => handleNavClick("study")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer select-none"
            style={{
              backgroundColor: timerState.isActive 
                ? "rgba(0, 229, 255, 0.08)" 
                : "rgba(15, 22, 40, 0.5)",
              borderColor: timerState.isActive 
                ? "var(--cyan)" 
                : "var(--border)",
              color: timerState.isActive ? "var(--cyan)" : "var(--muted)",
              fontFamily: "var(--mono)",
              fontSize: "0.78rem"
            }}
          >
            <span className={timerState.isActive ? "pulse-anim" : ""}>
              {timerState.mode === "study" ? "⏱" : "🍵"}
            </span>
            <span>{formatTime(timerState.timeLeft)}</span>
          </div>

          {/* Help Button */}
          <button 
            className="w-8 h-8 rounded-full border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition"
            onClick={onOpenHelp}
            title="How Arkmaester Works"
            style={{ fontSize: "0.9rem" }}
          >
            ?
          </button>

          {/* Theme Selector Selection */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              backgroundColor: "rgba(10, 15, 30, 0.7)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontSize: "0.75rem",
              borderRadius: "4px",
              padding: "0.25rem 0.65rem",
              outline: "none"
            }}
          >
            <option value="dark">Dark OS</option>
            <option value="oled">OLED OS</option>
            <option value="light">Light OS</option>
          </select>

          {/* Mobile hamburger menu toggle */}
          <button 
            className="flex lg:hidden text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

      </div>

      {/* Mobile drop menu */}
      {mobileMenuOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          backgroundColor: "#050810",
          borderBottom: "1px solid var(--border)",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          zIndex: 99
        }} className="flex lg:hidden scale-up">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                textAlign: "left",
                padding: "0.6rem 1rem",
                borderRadius: "6px",
                backgroundColor: page === item.id ? "rgba(0, 229, 255, 0.08)" : "transparent",
                color: page === item.id ? "var(--cyan)" : "var(--muted)",
                fontSize: "0.85rem",
                fontWeight: "600"
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
