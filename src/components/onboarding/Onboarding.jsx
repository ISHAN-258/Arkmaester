import { storageSet, KEYS } from "../../utils/storage.js";
import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { SUBJ_COLORS, DEF_SUBJ } from "../../utils/constants.js";

const TOUR_STEPS = [
  {
    icon: "📋",
    title: "Plan Your Day",
    sub: "Step 1 of 5",
    desc: "Use the Voice Planner or Task Board to lay out what you need to accomplish. Arkmaester auto-detects subjects and prioritises your list.",
    color: "var(--cyan)",
    bg: "rgba(0,212,255,.06)",
  },
  {
    icon: "⏱",
    title: "Track Study Sessions",
    sub: "Step 2 of 5",
    desc: "The Pomodoro Timer keeps you in focused sprints. Tag a subject before starting — session hours auto-update your planner.",
    color: "var(--green)",
    bg: "rgba(0,232,150,.06)",
  },
  {
    icon: "🎯",
    title: "Monitor Focus & Posture",
    sub: "Step 3 of 5",
    desc: "Arkmaester uses your webcam with MediaPipe BlazePose to detect slouching, phone distractions and focus drift in real time.",
    color: "var(--amber)",
    bg: "rgba(255,183,0,.06)",
  },
  {
    icon: "📊",
    title: "Get Productivity Insights",
    sub: "Step 4 of 5",
    desc: "Arkmaester analyses your sessions to surface patterns — your peak hours, best day, burnout risk, and subject gaps.",
    color: "var(--purple)",
    bg: "rgba(139,92,246,.06)",
  },
  {
    icon: "🚀",
    title: "Improve Every Day",
    sub: "Step 5 of 5",
    desc: "Weekly AI reports, streak tracking, and your personal AI assistant help you compound progress session by session.",
    color: "var(--pink)",
    bg: "rgba(236,72,153,.06)",
  },
];

const SETUP_STEPS = ["welcome", "tour", "name", "goal", "subjects", "done"];

export default function Onboarding({ onComplete }) {
  const { setDailyGoalHrs, saveSubjects } = useApp();
  const [step,     setStep]     = useState(0);
  const [tourIdx,  setTourIdx]  = useState(0);
  const [name,     setName]     = useState("");
  const [goalHrs,  setGoalHrs]  = useState(4);
  const [subjects, setSubjects] = useState(DEF_SUBJ);
  const [newSubj,  setNewSubj]  = useState("");

  const totalSteps = SETUP_STEPS.length;
  const progress   = ((step) / (totalSteps - 1)) * 100;

  const next = () => {
    if (SETUP_STEPS[step] === "tour" && tourIdx < TOUR_STEPS.length - 1) {
      setTourIdx((i) => i + 1);
      return;
    }
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else finish();
  };

  const prevTour = () => {
    if (tourIdx > 0) setTourIdx((i) => i - 1);
    else setStep((s) => s - 1);
  };

  const finish = () => {
    setDailyGoalHrs(goalHrs);
    saveSubjects(subjects);
    if (name.trim()) void storageSet(KEYS.USERNAME, name.trim());
    onComplete();
  };

  const removeSubj = (id) => setSubjects((s) => s.filter((x) => x.id !== id));
  const addSubj = () => {
    if (!newSubj.trim()) return;
    setSubjects((s) => [...s, { id: Date.now(), name: newSubj.trim(), color: SUBJ_COLORS[s.length % SUBJ_COLORS.length], target: 10, manualHours: 0 }]);
    setNewSubj("");
  };

  const stepName = SETUP_STEPS[step];
  const tour     = TOUR_STEPS[tourIdx];

  return (
    <div className="modal-bg" style={{ zIndex: 500, background: "rgba(4,6,15,.97)" }}>
      <div style={{ position:"relative", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"0", maxWidth:520, width:"100%", overflow:"hidden", boxShadow:"var(--shadow-lg), var(--shadow-glow)", animation:"fadeUp .4s var(--ease)" }}>

        {/* Progress bar */}
        <div style={{ height:3, background:"var(--bg3)" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:"var(--grad-brand)", transition:"width .4s var(--ease)" }} />
        </div>

        {/* Skip */}
        <button
          onClick={() => { finish(); }}
          style={{ position:"absolute", top:"1.1rem", right:"1.25rem", background:"none", border:"none", color:"var(--muted)", fontSize:".75rem", cursor:"pointer", fontFamily:"var(--font)", letterSpacing:".5px", zIndex:10 }}
        >
          Skip →
        </button>

        <div style={{ padding:"2rem 2rem 1.75rem" }}>
          {/* WELCOME */}
          {stepName === "welcome" && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:16, background:"var(--grad-brand)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem", fontWeight:900, color:"#000", margin:"0 auto 1.5rem", boxShadow:"0 8px 32px rgba(0,212,255,.35)", animation:"float 3s ease-in-out infinite" }}>
                A
              </div>
              <div style={{ fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--cyan)", letterSpacing:"4px", marginBottom:".6rem" }}>WELCOME TO</div>
              <h2 style={{ fontSize:"2rem", fontWeight:900, letterSpacing:"-1.5px", marginBottom:".5rem", background:"var(--grad-brand)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                ARKMAESTER
              </h2>
              <p style={{ color:"var(--text2)", fontSize:".88rem", lineHeight:1.7, marginBottom:"1.75rem", maxWidth:360, margin:"0 auto 1.75rem" }}>
                Conquer the Chaos. Settle the Score.<br />
                <span style={{ color:"var(--muted)", fontSize:".82rem" }}>Your AI-powered study OS. Takes 60 seconds to set up.</span>
              </p>
              <button className="btn-p" style={{ width:"100%", padding:".85rem", fontSize:".9rem" }} onClick={next}>
                Get Started →
              </button>
            </div>
          )}

          {/* TOUR */}
          {stepName === "tour" && (
            <div>
              <div style={{ fontSize:".62rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"2px", marginBottom:"1.25rem" }}>
                HOW ARKMAESTER WORKS
              </div>

              {/* Step indicators */}
              <div style={{ display:"flex", gap:".35rem", marginBottom:"1.5rem" }}>
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setTourIdx(i)}
                    style={{ flex: i===tourIdx?3:1, height:3, borderRadius:2, background: i<=tourIdx?"var(--cyan)":"var(--border)", cursor:"pointer", transition:"all .3s var(--ease)" }}
                  />
                ))}
              </div>

              {/* Tour card */}
              <div style={{ background:tour.bg, border:`1px solid ${tour.color}22`, borderRadius:"var(--r-lg)", padding:"1.5rem", marginBottom:"1.5rem", minHeight:180, animation:"fadeUp .3s var(--ease)" }} key={tourIdx}>
                <div style={{ fontSize:".62rem", color:tour.color, fontFamily:"var(--mono)", letterSpacing:"2px", marginBottom:".65rem" }}>{tour.sub}</div>
                <div style={{ fontSize:"2.2rem", marginBottom:".75rem" }}>{tour.icon}</div>
                <h3 style={{ fontSize:"1.2rem", fontWeight:800, letterSpacing:"-.5px", marginBottom:".6rem", color:tour.color }}>{tour.title}</h3>
                <p style={{ fontSize:".82rem", color:"var(--text2)", lineHeight:1.7 }}>{tour.desc}</p>
              </div>

              {/* Workflow arrow */}
              <div style={{ display:"flex", gap:".3rem", alignItems:"center", flexWrap:"wrap", marginBottom:"1.25rem", justifyContent:"center" }}>
                {["Voice","Schedule","Session","Tracker","Analytics","Insights"].map((s, i, arr) => (
                  <span key={s} style={{ display:"flex", alignItems:"center", gap:".3rem" }}>
                    <span style={{ fontSize:".68rem", fontFamily:"var(--mono)", color:"var(--text2)", background:"var(--bg2)", padding:".2rem .5rem", borderRadius:"var(--r-sm)", border:"1px solid var(--border)" }}>{s}</span>
                    {i < arr.length - 1 && <span style={{ color:"var(--muted)", fontSize:".7rem" }}>→</span>}
                  </span>
                ))}
              </div>

              <div style={{ display:"flex", gap:".5rem" }}>
                {(step > 0 || tourIdx > 0) && (
                  <button className="btn-o" style={{ flex:1 }} onClick={prevTour}>← Back</button>
                )}
                <button className="btn-p" style={{ flex:2 }} onClick={next}>
                  {tourIdx < TOUR_STEPS.length - 1 ? "Next →" : "Let's Set Up →"}
                </button>
              </div>
            </div>
          )}

          {/* NAME */}
          {stepName === "name" && (
            <div>
              <div style={{ fontSize:".62rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"2px", marginBottom:".6rem" }}>STEP 1 / 3</div>
              <h3 style={{ fontWeight:800, fontSize:"1.25rem", letterSpacing:"-.5px", marginBottom:".4rem" }}>What's your name?</h3>
              <p style={{ color:"var(--text2)", fontSize:".8rem", marginBottom:"1.25rem" }}>Arkmaester will personalise your dashboard.</p>
              <input
                className="ti" style={{ width:"100%", fontSize:".9rem", padding:".6rem .8rem", marginBottom:"1.1rem" }}
                placeholder="e.g. Rahul, Priya…"
                value={name} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key==="Enter" && next()}
                autoFocus
              />
              <div style={{ display:"flex", gap:".5rem" }}>
                <button className="btn-p" style={{ flex:1 }} onClick={next}>Next →</button>
                <button className="btn-o" onClick={next}>Skip</button>
              </div>
            </div>
          )}

          {/* GOAL */}
          {stepName === "goal" && (
            <div>
              <div style={{ fontSize:".62rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"2px", marginBottom:".6rem" }}>STEP 2 / 3</div>
              <h3 style={{ fontWeight:800, fontSize:"1.25rem", letterSpacing:"-.5px", marginBottom:".4rem" }}>Daily study goal?</h3>
              <p style={{ color:"var(--text2)", fontSize:".8rem", marginBottom:"1.25rem" }}>Arkmaester tracks your daily progress against this target.</p>
              <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap", marginBottom:"1.1rem" }}>
                {[2,3,4,6,8].map((h) => (
                  <button
                    key={h}
                    className={`mb${goalHrs===h?" active":""}`}
                    style={{ padding:".45rem 1.1rem", fontSize:".82rem" }}
                    onClick={() => setGoalHrs(h)}
                  >
                    {h}h / day
                  </button>
                ))}
              </div>
              <button className="btn-p" style={{ width:"100%" }} onClick={next}>Next →</button>
            </div>
          )}

          {/* SUBJECTS */}
          {stepName === "subjects" && (
            <div>
              <div style={{ fontSize:".62rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"2px", marginBottom:".6rem" }}>STEP 3 / 3</div>
              <h3 style={{ fontWeight:800, fontSize:"1.25rem", letterSpacing:"-.5px", marginBottom:".4rem" }}>Your subjects</h3>
              <p style={{ color:"var(--text2)", fontSize:".8rem", marginBottom:"1rem" }}>Add, remove, or keep the defaults.</p>
              <div style={{ maxHeight:185, overflowY:"auto", marginBottom:".75rem", display:"flex", flexDirection:"column", gap:".28rem" }}>
                {subjects.map((s) => (
                  <div key={s.id} style={{ display:"flex", alignItems:"center", gap:".5rem", padding:".4rem .65rem", background:"var(--bg2)", borderRadius:"var(--r-sm)", border:"1px solid var(--border)" }}>
                    <span style={{ width:10, height:10, borderRadius:2, background:s.color, flexShrink:0 }} />
                    <span style={{ flex:1, fontSize:".8rem" }}>{s.name}</span>
                    <button style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:".9rem", transition:"color .15s" }} onClick={() => removeSubj(s.id)} onMouseEnter={(e)=>e.target.style.color="var(--red)"} onMouseLeave={(e)=>e.target.style.color="var(--muted)"}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:".4rem", marginBottom:"1.1rem" }}>
                <input className="ti" placeholder="Add subject…" value={newSubj} onChange={(e) => setNewSubj(e.target.value)} onKeyDown={(e) => e.key==="Enter" && addSubj()} />
                <button className="ba" onClick={addSubj}>+</button>
              </div>
              <button className="btn-p" style={{ width:"100%" }} onClick={next}>Next →</button>
            </div>
          )}

          {/* DONE */}
          {stepName === "done" && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem", animation:"float 3s ease-in-out infinite" }}>🏆</div>
              <h2 style={{ fontWeight:900, fontSize:"1.4rem", letterSpacing:"-.8px", marginBottom:".6rem" }}>
                {name ? `Ready, ${name}!` : "All set!"}
              </h2>
              <p style={{ color:"var(--text2)", fontSize:".82rem", lineHeight:1.7, marginBottom:"1.75rem" }}>
                Daily goal: <strong style={{ color:"var(--cyan)" }}>{goalHrs}h</strong> ·{" "}
                {subjects.length} subject{subjects.length!==1?"s":""} tracked
              </p>
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--r-md)", padding:"1rem", marginBottom:"1.5rem", textAlign:"left" }}>
                <div style={{ fontFamily:"var(--mono)", fontSize:".6rem", color:"var(--muted)", letterSpacing:"2px", marginBottom:".65rem" }}>WORKFLOW</div>
                {["Voice Planner → Tasks","Timer → Focus Sessions","Tracker → Posture & Focus","Insights → AI Analysis","Chat → Personal AI Assistant"].map((s,i) => (
                  <div key={i} style={{ fontSize:".78rem", color:"var(--text2)", padding:".28rem 0", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:".5rem" }}>
                    <span style={{ color:"var(--cyan)", fontFamily:"var(--mono)", fontSize:".7rem", minWidth:18 }}>{i+1}.</span>
                    {s}
                  </div>
                ))}
              </div>
              <button className="btn-p" style={{ width:"100%", padding:".85rem", fontSize:".9rem" }} onClick={finish}>
                Conquer the Chaos →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
