import { useEffect, useState, FormEvent } from "react";
import { useApp } from "../../context/AppContext";
import { FEATURES, REVS } from "../../utils/constants";
import { Play, Eye, HelpCircle, Star, Send } from "lucide-react";
import { fireConfetti } from "../../utils/export";

export default function LandingPage() {
  const { setPage, sessionLog, todayStudiedHrs, streak, studiedDays } = useApp();

  // Animated statistics state
  const [sessionsCount, setSessionsCount] = useState(0);
  const [hoursCount, setHoursCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [daysCount, setDaysCount] = useState(0);

  // Help state
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Reviews list backed by local state
  const [reviewsList, setReviewsList] = useState<any[]>(REVS);
  const [newReview, setNewReview] = useState({ name: "", role: "", text: "", stars: 5 });

  // Calculate real stat goals or fallback of standard defaults for stunning blank state
  const realSessions = Math.max(sessionLog.length, 12);
  const realHours = Math.max(Number((sessionLog.reduce((a, s) => a + s.secs, 0) / 3600).toFixed(1)), 34.2);
  const realStreak = Math.max(streak, 5);
  const realDays = Math.max(studiedDays.size, 11);

  useEffect(() => {
    // 1.2s increments logic
    const duration = 1200;
    const intervalTime = 30;
    const steps = duration / intervalTime;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setSessionsCount(Math.min(realSessions, Math.round((realSessions / steps) * step)));
      setHoursCount(Math.min(realHours, Number(((realHours / steps) * step).toFixed(1))));
      setStreakCount(Math.min(realStreak, Math.round((realStreak / steps) * step)));
      setDaysCount(Math.min(realDays, Math.round((realDays / steps) * step)));

      if (step >= steps) {
        clearInterval(timer);
        // Ensure final exact values matching
        setSessionsCount(realSessions);
        setHoursCount(realHours);
        setStreakCount(realStreak);
        setDaysCount(realDays);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [realSessions, realHours, realStreak, realDays]);

  const handleReviewSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;

    const parsed: any = {
      name: newReview.name,
      role: newReview.role || "Independent Student",
      init: newReview.name.charAt(0).toUpperCase() + (newReview.name.split(" ")[1]?.charAt(0) || "").toUpperCase(),
      stars: newReview.stars,
      text: newReview.text
    };

    setReviewsList((prev) => [parsed, ...prev]);
    setNewReview({ name: "", role: "", text: "", stars: 5 });
    fireConfetti({ count: 40 });
  };

  return (
    <div style={{ paddingBottom: "5rem" }} className="fade-in">
      
      {/* Hero Header Section */}
      <header className="hero min-h-[75vh] flex flex-col items-center justify-center text-center px-4 md:px-8 border-b border-slate-900 pt-10">
        
        <div style={{ marginBottom: "0.5rem" }} className="sl">
          // AI-POWERED PRODUCTIVITY PLATFORM — v3.0
        </div>

        <h1 style={{
          fontFamily: "var(--syne)",
          fontSize: "4.50rem",
          fontWeight: "800",
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          textShadow: "0 0 100px rgba(0, 229, 255, 0.25)",
          color: "var(--text)",
          marginTop: "1rem"
        }} className="md:text-8xl">
          ARKMAESTER
        </h1>

        <p style={{
          fontFamily: "var(--font)",
          fontSize: "1.75rem",
          fontWeight: "500",
          color: "var(--cyan)",
          marginTop: "1rem",
          letterSpacing: "-0.02em"
        }}>
          Conquer the Chaos. Settle the Score.
        </p>

        <p style={{
          maxWidth: "580px",
          fontSize: "0.95rem",
          color: "var(--muted)",
          lineHeight: 1.5,
          margin: "1.5rem auto 2.5rem"
        }}>
          Arkmaester is an AI-powered productivity platform that helps students plan smarter, focus deeper, and achieve more — all in one futuristic study workspace.
        </p>

        {/* Call-To-Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          
          <button 
            onClick={() => setPage("study")}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "var(--cyan)",
              color: "black",
              fontWeight: "600",
              fontSize: "0.85rem",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "transform 0.15s, opacity 0.15s"
            }}
            className="flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Play size={14} fill="currentColor" /> Start Session
          </button>

          <button 
            onClick={() => setPage("tracker")}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "transparent",
              color: "white",
              fontWeight: "600",
              fontSize: "0.85rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "transform 0.15s"
            }}
            className="flex items-center gap-2 hover:border-cyan-400 hover:scale-105 active:scale-95"
          >
            <Eye size={14} /> Focus Tracker
          </button>

        </div>

      </header>

      {/* Cyber stats increments deck */}
      <section className="stats-divider max-w-5xl mx-auto py-8 px-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 text-center">
        
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "2rem", fontWeight: "700", color: "var(--text)" }}>
            {sessionsCount}
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", marginTop: "0.25rem" }}>
            SESSIONS LOGGED
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "2rem", fontWeight: "700", color: "var(--cyan)" }}>
            {hoursCount}H
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", marginTop: "0.25rem" }}>
            HOURS RECORDED
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "2rem", fontWeight: "700", color: "var(--green)" }}>
            {streakCount}D
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", marginTop: "0.25rem" }}>
            ACTIVE STREAK
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "2rem", fontWeight: "700", color: "var(--purple)" }}>
            {daysCount}
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", marginTop: "0.25rem" }}>
            WORK DAYS
          </div>
        </div>

      </section>

      {/* Premium Features Bento Sections */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
        
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="sl" style={{ marginBottom: "0.25rem" }}>Feature Deck</div>
          <h2 style={{ fontFamily: "var(--syne)", fontSize: "2.25rem", fontWeight: "bold" }}>
            Operational Capabilities
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Eight specialized systems co-operating to safeguard your academic routine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat, idx) => (
            <div 
              key={idx} 
              className="feat-card"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div className="feat-icon-wrap">
                {feat.icon}
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text)", marginBottom: "0.5rem" }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: "0.80rem", color: "var(--muted)", lineHeight: 1.45 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

      </section>

      {/* Interactive Reviews Panel & Star Feedback Submitter */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="sl" style={{ marginBottom: "0.25rem" }}>Feedback Logs</div>
          <h2 style={{ fontFamily: "var(--syne)", fontSize: "2.25rem", fontWeight: "bold" }}>
            Maester Assessments
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            Sustaining study velocity for computer engineers and researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main reviews grid list */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {reviewsList.map((rev, idx) => (
              <div 
                key={idx} 
                className="sc"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} fill={i < rev.stars ? "var(--amber)" : "none"} color={i < rev.stars ? "var(--amber)" : "var(--border)"} />
                    ))}
                  </div>
                  <p style={{ fontSize: "0.80rem", color: "var(--text)", lineHeight: 1.45, italic: true }}>
                    "{rev.text}"
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-900">
                  <div style={{
                    width: "30px", height: "30px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 229, 255, 0.08)",
                    border: "1px solid var(--border)",
                    fontSize: "0.75rem",
                    fontFamily: "var(--mono)",
                    color: "var(--cyan)"
                  }}>
                    {rev.init}
                  </div>
                  <div>
                    <h5 style={{ fontSize: "0.75rem", fontWeight: "bold" }}>{rev.name}</h5>
                    <p style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{rev.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Review form */}
          <div>
            <div className="sc">
              <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>
                Submit Assessment
              </h4>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                
                <div>
                  <label style={{ fontSize: "0.68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Your Name
                  </label>
                  <input 
                    type="text" 
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    required
                    style={{
                      width: "100%", padding: "0.5rem",
                      backgroundColor: "rgba(5, 8, 16, 0.5)",
                      border: "1px solid var(--border)",
                      color: "white", fontSize: "0.8rem", borderRadius: "6px",
                      marginTop: "0.25rem", outline: "none"
                    }}
                    placeholder="E.g., Arjun P."
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Academic/Degree Role
                  </label>
                  <input 
                    type="text" 
                    value={newReview.role}
                    onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                    style={{
                      width: "100%", padding: "0.5rem",
                      backgroundColor: "rgba(5, 8, 16, 0.5)",
                      border: "1px solid var(--border)",
                      color: "white", fontSize: "0.8rem", borderRadius: "6px",
                      marginTop: "0.25rem", outline: "none"
                    }}
                    placeholder="E.g., MSc, NIT"
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Focus Assessment Rating
                  </label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button 
                        key={stars}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, stars })}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        <Star size={18} fill={stars <= newReview.stars ? "var(--amber)" : "none"} color={stars <= newReview.stars ? "var(--amber)" : "var(--muted)"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Your Review
                  </label>
                  <textarea 
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    required
                    rows={3}
                    style={{
                      width: "100%", padding: "0.5rem",
                      backgroundColor: "rgba(5, 8, 16, 0.5)",
                      border: "1px solid var(--border)",
                      color: "white", fontSize: "0.8rem", borderRadius: "6px",
                      marginTop: "0.25rem", outline: "none", resize: "none"
                    }}
                    placeholder="Type your feedback here..."
                  />
                </div>

                <button 
                  type="submit"
                  style={{
                    width: "100%", padding: "0.6rem",
                    backgroundColor: "var(--cyan)", color: "black",
                    fontWeight: "600", fontSize: "0.8rem", borderRadius: "6px",
                    cursor: "pointer", transition: "transform 0.15s, opacity 0.15s"
                  }}
                  className="flex items-center justify-center gap-2 hover:opacity-90"
                >
                  <Send size={12} /> Dispatch Assessment
                </button>

              </form>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
export type LandingPageState = ReturnType<typeof LandingPage>;
