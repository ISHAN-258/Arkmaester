import { useState, useCallback, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { REVS } from "../../utils/constants.js";

const FEATURES = [
  { icon:"🎙", title:"AI Voice Planner",      desc:"Speak your tasks naturally. Arkmaester parses, prioritises, and schedules them instantly.", color:"var(--cyan)"  },
  { icon:"⏱", title:"Pomodoro Timer",         desc:"Interval-based focus sessions with ambient sounds, live nav countdown, and break suggestions.", color:"var(--green)" },
  { icon:"🤸", title:"BlazePose Detection",    desc:"33-landmark skeleton via MediaPipe. Real-time posture scoring and phone-use detection.", color:"var(--amber)" },
  { icon:"📊", title:"Analytics Dashboard",   desc:"Weekly charts, 28-day heatmap, peak hours, subject breakdowns — all from your real data.", color:"var(--purple)"},
  { icon:"🧠", title:"AI Insights Engine",     desc:"Arkmaester identifies patterns: best study hours, burnout risk, optimal session length.", color:"var(--pink)"  },
  { icon:"📅", title:"Smart Scheduling",       desc:"Routine generator arranges tasks by priority, duration, and your peak productivity window.", color:"var(--cyan)"  },
  { icon:"📝", title:"Session Reports",        desc:"Per-session export with subject, duration, time, and reflection notes.", color:"var(--green)" },
  { icon:"🔥", title:"Productivity Streaks",   desc:"Daily streak calendar with milestone celebrations and consistency scoring.", color:"var(--amber)" },
];

const WORKFLOW = [
  { icon:"🎙", step:"01", label:"Voice Planner", desc:"Speak your plan" },
  { icon:"📅", step:"02", label:"Daily Schedule","desc":"Auto-organised tasks" },
  { icon:"⏱", step:"03", label:"Study Session",  desc:"Focused sprints" },
  { icon:"🎯", step:"04", label:"Focus Tracking", desc:"Posture & distraction" },
  { icon:"📊", step:"05", label:"Analytics",      desc:"Patterns surface" },
  { icon:"🧠", step:"06", label:"AI Insights",    desc:"Arkmaester advises" },
];

// Animated counter
function Counter({ target, suffix = "", duration = 1600 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = Date.now();
      const tick = () => {
        const p = Math.min(1, (Date.now() - start) / duration);
        setVal(Math.round(p * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export default function LandingPage() {
  const { setPage, sessionLog, streak, todayStudiedHrs } = useApp();
  const totalHrs = +(sessionLog.reduce((a, e) => a + e.secs, 0) / 3600).toFixed(1);

  return (
    <>
      {/* Hero */}
      <section className="hero" style={{ position:"relative", zIndex:1, minHeight:"100vh", padding:"7rem 1.75rem 4rem", maxWidth:1280, margin:"0 auto" }}>
        {/* Glow blobs */}
        <div style={{ position:"absolute", top:"10%", left:"20%", width:600, height:300, background:"radial-gradient(ellipse, rgba(0,212,255,.09) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }} />
        <div style={{ position:"absolute", top:"30%", right:"10%", width:400, height:300, background:"radial-gradient(ellipse, rgba(139,92,246,.08) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }} />

        <div className="hero-grid" style={{ position:"relative", zIndex:1, display:"grid", gridTemplateColumns:"1.1fr .9fr", gap:"3rem", alignItems:"center" }}>

          {/* Left column */}
          <div>
            <div className="tag fade-up" style={{ marginBottom:"1.5rem" }}>
              ● AI-POWERED STUDY OS — V3.0
            </div>

            <h1 className="fade-up" style={{ fontSize:"clamp(2.6rem, 6.5vw, 4.8rem)", fontWeight:900, lineHeight:1.0, letterSpacing:"-3px", marginBottom:".6rem", animationDelay:".05s" }}>
              <span style={{ background:"var(--grad-brand)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Arkmaester
              </span>
            </h1>

            <p className="fade-up" style={{ fontSize:"clamp(1.4rem, 3vw, 1.9rem)", color:"var(--text)", fontWeight:800, letterSpacing:"-1px", lineHeight:1.2, marginBottom:"1.1rem", animationDelay:".1s" }}>
              Conquer the Chaos.<br />Settle the Score.
            </p>

            <p className="fade-up" style={{ fontSize:".92rem", color:"var(--text2)", maxWidth:460, lineHeight:1.75, marginBottom:"2rem", animationDelay:".15s" }}>
              Arkmaester is an AI-powered productivity platform that helps students plan smarter, focus deeper, and achieve more — session by session.
            </p>

            <div className="fade-up" style={{ display:"flex", gap:".75rem", flexWrap:"wrap", alignItems:"center", marginBottom:"2.25rem", animationDelay:".2s" }}>
              <button className="btn-p" style={{ padding:".85rem 2rem", fontSize:".88rem" }} onClick={() => setPage("study")}>
                ▶ Start Session
              </button>
              <button className="btn-o" style={{ padding:".85rem 2rem", fontSize:".88rem" }} onClick={() => setPage("tracker")}>
                🎯 Focus Tracker
              </button>
              <button className="btn-ghost" style={{ padding:".85rem 1.25rem", fontSize:".82rem" }} onClick={() => setPage("insights")}>
                Explore Features →
              </button>
            </div>

            {/* Mini feature cards */}
            <div className="mini-cards fade-up" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:".65rem", marginBottom:"2.25rem", animationDelay:".25s" }}>
              {[
                { icon:"⚡", t:"Stay Focused",  s:"Beat distractions" },
                { icon:"📊", t:"Track Progress",s:"See real growth"   },
                { icon:"📅", t:"Plan Smarter",  s:"Achieve more"      },
                { icon:"🧠", t:"AI Powered",    s:"Your study co-pilot" },
              ].map((c) => (
                <div key={c.t} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r-md)", padding:".8rem .7rem", display:"flex", flexDirection:"column", gap:".45rem" }}>
                  <div style={{ width:26, height:26, borderRadius:7, background:"rgba(0,212,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".85rem" }}>{c.icon}</div>
                  <div style={{ fontSize:".76rem", fontWeight:700 }}>{c.t}</div>
                  <div style={{ fontSize:".66rem", color:"var(--muted)" }}>{c.s}</div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="stats-row fade-up" style={{ display:"flex", gap:"2.5rem", flexWrap:"wrap", animationDelay:".3s" }}>
              {[
                { num: sessionLog.length, suffix:"",  label:"Sessions" },
                { num: Math.round(totalHrs * 10) / 10, suffix:"h", label:"Hours Studied" },
                { num: streak,            suffix:"🔥", label:"Day Streak" },
              ].map(({ num, suffix, label }) => (
                <div key={label}>
                  <div style={{ fontFamily:"var(--mono)", fontSize:"1.75rem", fontWeight:800, background:"var(--grad-brand)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                    <Counter target={num} suffix={suffix} />
                  </div>
                  <div style={{ fontSize:".65rem", color:"var(--muted)", letterSpacing:"2px", textTransform:"uppercase", marginTop:".2rem" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="hero-grid-right fade-up" style={{ animationDelay:".2s" }}>
            <div style={{ background:"var(--grad-card)", border:"1px solid var(--border2)", borderRadius:"var(--r-xl)", padding:"1.6rem", boxShadow:"var(--shadow-glow)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.4rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:".4rem", fontFamily:"var(--mono)", fontSize:".62rem", color:"var(--green)", letterSpacing:"1px" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)", display:"inline-block" }} /> CURRENT FOCUS
                </div>
                <div style={{ fontFamily:"var(--mono)", fontSize:".6rem", color:"var(--cyan)", border:"1px solid var(--cyan)", borderRadius:999, padding:".25rem .7rem" }}>STUDY MODE</div>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"1rem" }}>
                <div>
                  <div style={{ fontSize:"1.5rem", fontWeight:800, lineHeight:1.25 }}>
                    Small Steps<br />
                    <span style={{ background:"var(--grad-brand)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Big Progress</span>
                  </div>
                  <p style={{ fontSize:".78rem", color:"var(--text2)", lineHeight:1.6, marginTop:".7rem", fontStyle:"italic" }}>
                    "Consistency today builds a better tomorrow."
                  </p>
                </div>
                <div style={{ position:"relative", width:100, height:100, flexShrink:0, borderRadius:"50%", background:"conic-gradient(var(--cyan) 0deg, var(--purple) 0deg, var(--border) 0deg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ width:78, height:78, borderRadius:"50%", background:"var(--bg2)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontSize:"1.1rem", fontWeight:800 }}>0%</div>
                    <div style={{ fontSize:".55rem", color:"var(--muted)", letterSpacing:"1px" }}>FOCUS</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPage("planner")}
                style={{ width:"100%", marginTop:"1.4rem", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:"var(--r-md)", padding:".85rem 1rem", display:"flex", alignItems:"center", gap:".75rem", cursor:"pointer", textAlign:"left" }}
              >
                <div style={{ width:32, height:32, borderRadius:9, background:"var(--grad-brand)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".85rem" }}>🎯</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:".8rem", fontWeight:700, color:"var(--text)" }}>Set your goal for today</div>
                  <div style={{ fontSize:".68rem", color:"var(--muted)" }}>Turn intentions into progress.</div>
                </div>
                <span style={{ color:"var(--muted)" }}>›</span>
              </button>
            </div>

            {/* Quote card */}
            <div style={{ borderLeft:"3px solid var(--cyan)", background:"var(--card)", borderRadius:"0 var(--r-md) var(--r-md) 0", padding:"1.1rem 1.4rem", marginTop:"1.1rem" }}>
              <p style={{ fontSize:".92rem", color:"var(--text)", lineHeight:1.6 }}>“Discipline is the bridge between goals and results.”</p>
              <div style={{ fontSize:".72rem", color:"var(--muted)", marginTop:".5rem" }}>— Arkmaester</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:".4rem", marginTop:"3rem", color:"var(--muted)" }}>
          <div style={{ width:22, height:34, border:"1px solid var(--border2)", borderRadius:12, display:"flex", justifyContent:"center", paddingTop:6 }}>
            <div style={{ width:3, height:7, borderRadius:2, background:"var(--muted)" }} />
          </div>
          <div style={{ fontFamily:"var(--mono)", fontSize:".6rem", letterSpacing:"2px" }}>SCROLL TO EXPLORE</div>
        </div>
      </section>

      {/* Floating "ready to study" pill */}
      <button
        onClick={() => setPage("study")}
        style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:40, display:"flex", alignItems:"center", gap:".5rem", background:"var(--card2)", border:"1px solid var(--border2)", borderRadius:999, padding:".6rem 1.1rem", fontSize:".78rem", color:"var(--text)", cursor:"pointer", boxShadow:"var(--shadow-md)" }}
      >
        <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--green)", display:"inline-block" }} />
        Ready to study?
      </button>

      {/* Workflow section */}
      <section style={{ position:"relative", zIndex:1, padding:"4rem 1.75rem", maxWidth:1060, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div className="sl" style={{ justifyContent:"center", display:"flex" }}>// HOW IT WORKS</div>
          <h2 style={{ fontSize:"clamp(1.5rem, 4vw, 2.2rem)", fontWeight:800, letterSpacing:"-1px", marginTop:".4rem" }}>
            The Arkmaester Workflow
          </h2>
          <p style={{ color:"var(--text2)", marginTop:".6rem", fontSize:".88rem" }}>Six steps. Compounding progress. Every day.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:".75rem", position:"relative" }}>
          {WORKFLOW.map((w, i) => (
            <div
              key={w.step}
              className="fade-up"
              style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r-md)", padding:"1.25rem 1rem", textAlign:"center", position:"relative", animationDelay:`${i*.07}s`, cursor:"pointer", transition:"all .25s var(--ease)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor="rgba(0,212,255,.35)"; e.currentTarget.style.transform="translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateY(0)"; }}
            >
              <div style={{ fontFamily:"var(--mono)", fontSize:".58rem", color:"var(--cyan)", letterSpacing:"2px", marginBottom:".6rem" }}>{w.step}</div>
              <div style={{ fontSize:"1.6rem", marginBottom:".55rem" }}>{w.icon}</div>
              <div style={{ fontSize:".82rem", fontWeight:700, marginBottom:".25rem" }}>{w.label}</div>
              <div style={{ fontSize:".7rem", color:"var(--muted)" }}>{w.desc}</div>
              {i < WORKFLOW.length - 1 && (
                <div style={{ position:"absolute", top:"50%", right:"-14px", transform:"translateY(-50%)", color:"var(--border)", fontSize:".8rem", zIndex:2, display:"none" }}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ position:"relative", zIndex:1, padding:"4rem 1.75rem", maxWidth:1060, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div className="sl" style={{ justifyContent:"center", display:"flex" }}>// CAPABILITIES</div>
          <h2 style={{ fontSize:"clamp(1.5rem, 4vw, 2.2rem)", fontWeight:800, letterSpacing:"-1px", marginTop:".4rem" }}>
            Everything in one platform.
          </h2>
        </div>
        <div className="feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"1px", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", overflow:"hidden" }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="fade-up"
              style={{ background:"var(--card)", padding:"1.5rem 1.35rem", cursor:"pointer", transition:"all .25s var(--ease)", position:"relative", overflow:"hidden", animationDelay:`${i*.05}s`, borderRight:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background="var(--bg3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background="var(--card)"; }}
            >
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${f.color}, transparent)`, opacity:0, transition:"opacity .25s" }}
                onMouseEnter={(e)=>e.currentTarget.style.opacity="1"}
              />
              <div style={{ fontSize:"1.5rem", marginBottom:".65rem" }}>{f.icon}</div>
              <h3 style={{ fontSize:".88rem", fontWeight:700, marginBottom:".35rem", color:f.color }}>{f.title}</h3>
              <p style={{ fontSize:".76rem", color:"var(--text2)", lineHeight:1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSection />

      {/* Footer CTA */}
      <section style={{ position:"relative", zIndex:1, padding:"5rem 1.75rem 6rem", textAlign:"center" }}>
        <div style={{ maxWidth:520, margin:"0 auto" }}>
          <div style={{ width:52, height:52, borderRadius:13, background:"var(--grad-brand)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", fontWeight:900, color:"#000", margin:"0 auto 1.5rem", boxShadow:"0 6px 24px rgba(0,212,255,.3)" }}>A</div>
          <h2 style={{ fontSize:"clamp(1.6rem, 4vw, 2.4rem)", fontWeight:800, letterSpacing:"-1.5px", marginBottom:".65rem" }}>Ready to conquer?</h2>
          <p style={{ color:"var(--text2)", fontSize:".88rem", lineHeight:1.7, marginBottom:"1.75rem" }}>Join students using Arkmaester to transform their study habits.</p>
          <button className="btn-p" style={{ padding:".9rem 2.5rem", fontSize:".9rem" }} onClick={() => setPage("study")}>
            Start Your First Session →
          </button>
          <p style={{ color:"var(--muted)", fontSize:".72rem", marginTop:"1rem", fontFamily:"var(--mono)" }}>
            Arkmaester — Conquer the Chaos. Settle the Score.
          </p>
        </div>
      </section>
    </>
  );
}

function ReviewsSection() {
  const [reviews, setReviews] = useState(REVS);
  const [form,    setForm]    = useState({ name:"", role:"", text:"", stars:5 });
  const [hover,   setHover]   = useState(0);

  const submit = useCallback((e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) return;
    const init = form.name.split(" ").slice(0,2).map((s) => s[0]).join("").toUpperCase();
    setReviews((r) => [{ ...form, init, id:Date.now() }, ...r]);
    setForm({ name:"", role:"", text:"", stars:5 });
  }, [form]);

  return (
    <section style={{ position:"relative", zIndex:1, padding:"4rem 1.75rem", maxWidth:1060, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:"3rem" }}>
        <div className="sl" style={{ justifyContent:"center", display:"flex" }}>// COMMUNITY</div>
        <h2 style={{ fontSize:"clamp(1.5rem, 4vw, 2.2rem)", fontWeight:800, letterSpacing:"-1px", marginTop:".4rem" }}>What students say.</h2>
      </div>
      <div className="rev-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))", gap:".75rem" }}>
        {reviews.slice(0,6).map((r, i) => (
          <div
            key={r.id ?? i}
            className="fade-up"
            style={{ background:"var(--card)", border:"1px solid var(--border)", padding:"1.15rem", borderRadius:"var(--r-md)", transition:"all .25s var(--ease)", animationDelay:`${i*.06}s` }}
            onMouseEnter={(e)=>{ e.currentTarget.style.borderColor="rgba(0,212,255,.25)"; e.currentTarget.style.transform="translateY(-2px)"; }}
            onMouseLeave={(e)=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateY(0)"; }}
          >
            <div style={{ color:"var(--amber)", fontSize:".85rem", marginBottom:".5rem" }}>{"★".repeat(r.stars)}{"☆".repeat(5-r.stars)}</div>
            <p style={{ fontSize:".8rem", color:"var(--text2)", lineHeight:1.7, marginBottom:".7rem", fontStyle:"italic" }}>"{r.text}"</p>
            <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--grad-brand)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:".72rem", color:"#000", flexShrink:0 }}>{r.init}</div>
              <div>
                <div style={{ fontSize:".78rem", fontWeight:700 }}>{r.name}</div>
                <div style={{ fontSize:".68rem", color:"var(--muted)" }}>{r.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review form */}
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", padding:"1.5rem", marginTop:"1.5rem", maxWidth:480 }}>
        <h4 style={{ fontWeight:800, fontSize:".95rem", marginBottom:".85rem" }}>Share your experience</h4>
        <form onSubmit={submit}>
          <div style={{ display:"flex", gap:".25rem", marginBottom:".7rem" }}>
            {[1,2,3,4,5].map((s) => (
              <button key={s} type="button" style={{ background:"none", border:"none", fontSize:"1.25rem", cursor:"pointer", transition:"transform .15s", color: s<=(hover||form.stars)?"var(--amber)":"var(--border)" }}
                onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                onClick={() => setForm((f) => ({ ...f, stars:s }))}
              >{s<=(hover||form.stars)?"★":"☆"}</button>
            ))}
          </div>
          <input className="ti" style={{ width:"100%", marginBottom:".5rem" }} placeholder="Your name" value={form.name} onChange={(e)=>setForm((f)=>({...f,name:e.target.value}))} maxLength={40} />
          <input className="ti" style={{ width:"100%", marginBottom:".5rem" }} placeholder="College / Program (optional)" value={form.role} onChange={(e)=>setForm((f)=>({...f,role:e.target.value}))} maxLength={50} />
          <textarea className="ti" style={{ width:"100%", minHeight:70, resize:"vertical", marginBottom:".75rem" }} placeholder="Write your review…" value={form.text} onChange={(e)=>setForm((f)=>({...f,text:e.target.value}))} maxLength={200} />
          <button className="btn-p" type="submit" style={{ width:"100%" }}>Submit Review</button>
        </form>
      </div>
    </section>
  );
}
