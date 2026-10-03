const FLOW = [
  { num:"01", icon:"🎙", title:"Voice Planner", desc:"Speak tasks naturally." },
  { num:"02", icon:"📋", title:"Daily Schedule", desc:"Arkmaester organises priorities." },
  { num:"03", icon:"⏱", title:"Study Session", desc:"Start a focused Pomodoro." },
  { num:"04", icon:"👁", title:"Focus Tracking", desc:"Posture and phone guard stays local." },
  { num:"05", icon:"📊", title:"Analytics", desc:"Patterns surface from your data." },
  { num:"06", icon:"🤖", title:"AI Insights", desc:"Arkmaester recommends the next move." },
];

export default function HowItWorksModal({ onClose }) {
  return (
    <div className="modal-bg" style={{ zIndex:650, background:"rgba(5,8,16,.98)", backdropFilter:"blur(20px)" }}>
      <div style={{ position:"relative", width:"min(940px, 94vw)", maxHeight:"88vh", overflowY:"auto", border:"1px solid rgba(0,229,255,.18)", borderRadius:"var(--r-xl)", background:"linear-gradient(135deg, rgba(15,22,40,.96), rgba(5,8,16,.98))", boxShadow:"var(--shadow-lg), 0 0 48px rgba(0,229,255,.12)", padding:"2rem" }}>
        <button
          onClick={onClose}
          aria-label="Close How It Works"
          style={{ position:"absolute", top:"1rem", right:"1rem", width:34, height:34, borderRadius:"50%", border:"1px solid var(--border)", background:"rgba(255,255,255,.03)", color:"var(--text)", cursor:"pointer", fontSize:"1.1rem" }}
        >
          ×
        </button>

        <div style={{ textAlign:"center", marginBottom:"1.8rem" }}>
          <div className="sl" style={{ justifyContent:"center", display:"flex" }}>// HOW ARKMAESTER WORKS</div>
          <h2 style={{ fontSize:"clamp(1.45rem, 4vw, 2.25rem)", fontWeight:900, letterSpacing:"-1px", marginTop:".45rem" }}>From chaos to score-settled study.</h2>
          <p style={{ color:"var(--text2)", fontSize:".86rem", marginTop:".5rem" }}>
            Voice Planner → Daily Schedule → Study Session → Focus Tracking → Analytics → AI Insights
          </p>
        </div>

        <div className="hiw-flow">
          {FLOW.map((step, i) => (
            <div className="hiw-step fade-up" key={step.num} style={{ animationDelay:`${i * .06}s` }}>
              <div className="hiw-num">{step.num}</div>
              <div className="hiw-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {i < FLOW.length - 1 && <span className="hiw-arrow">→</span>}
            </div>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"center", marginTop:"1.75rem" }}>
          <button className="btn-p" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}
