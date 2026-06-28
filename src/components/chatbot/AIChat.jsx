import { useState, useRef, useEffect, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";

const SUGGESTIONS = [
  "How was my study week?",
  "Which subject needs more time?",
  "Am I at risk of burnout?",
  "What's my strongest study hour?",
  "Help me plan tomorrow's sessions.",
  "Give me a personalised study tip.",
];

export default function AIChatPage() {
  const {
    sessionLog, subjects, subjectsWithHours,
    streak, distractionLog, tasks,
    todayStudiedHrs, dailyGoalHrs, weeklyGoalHrs,
  } = useApp();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Arkmaester has observed your study patterns and is ready to advise. Ask me anything about your progress, planning, or productivity strategy. 📊",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const contextSummary = useMemo(() => {
    const totalHrs = +(sessionLog.reduce((a, e) => a + e.secs, 0) / 3600).toFixed(1);
    const weekSecs = sessionLog.filter((e) => Date.now() - e.ts < 7 * 86400000).reduce((a, e) => a + e.secs, 0);
    const weekHrs  = +(weekSecs / 3600).toFixed(1);
    const topSubj  = subjectsWithHours.length > 0 ? subjectsWithHours.reduce((a, b) => a.hours >= b.hours ? a : b) : null;
    const pending  = tasks.filter((t) => !t.done).length;
    return `
USER STUDY DATA:
- Today studied: ${todayStudiedHrs.toFixed(1)}h (daily goal: ${dailyGoalHrs}h)
- This week: ${weekHrs}h (weekly goal: ${weeklyGoalHrs}h)
- Total all-time: ${totalHrs}h across ${sessionLog.length} sessions
- Current streak: ${streak} days
- Top subject: ${topSubj?.name ?? "None"} (${topSubj?.hours?.toFixed(1) ?? 0}h)
- Pending tasks: ${pending}
- Distractions this week: ${distractionLog.filter((d) => Date.now() - d.ts < 7 * 86400000).length}
- Subjects: ${subjectsWithHours.map((s) => `${s.name}(${s.hours.toFixed(1)}h/${s.target}h target)`).join(", ")}
    `.trim();
  }, [sessionLog, subjectsWithHours, streak, distractionLog, tasks, todayStudiedHrs, dailyGoalHrs, weeklyGoalHrs]);

  const send = async (userMsg) => {
    const text = (userMsg ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const userMessage  = { role: "user", content: text };
    const newMessages  = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are Arkmaester, an intelligent AI study assistant embedded in a productivity platform called Arkmaester.
Speak in first person as Arkmaester. Use language like:
- "Arkmaester has observed..."
- "Arkmaester recommends..."
- "Based on your patterns, Arkmaester suggests..."
Be concise, encouraging, and data-driven. Reference actual numbers from the user data.
Format: short paragraphs or bullet points. No markdown headers.

${contextSummary}`,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data  = await res.json();
      const reply = data.content?.find((b) => b.type === "text")?.text ?? "Arkmaester encountered an issue processing that request.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠ Arkmaester lost connection. Check your network and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="sl">// AI ASSISTANT</div>
        <h2 className="page-title">Arkmaester AI</h2>
        <p className="page-sub">Your personal productivity intelligence. Powered by real session data.</p>
      </div>

      {/* Identity banner */}
      <div style={{ background:"linear-gradient(135deg, rgba(0,212,255,.07), rgba(139,92,246,.07))", border:"1px solid rgba(0,212,255,.18)", borderRadius:"var(--r-md)", padding:".85rem 1.15rem", marginBottom:"1.1rem", display:"flex", alignItems:"center", gap:".75rem" }}>
        <div style={{ width:38, height:38, borderRadius:10, background:"var(--grad-brand)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#000", flexShrink:0 }}>A</div>
        <div>
          <div style={{ fontSize:".75rem", fontWeight:700, marginBottom:".1rem" }}>Arkmaester Intelligence</div>
          <div style={{ fontSize:".7rem", color:"var(--text2)" }}>Analysing {sessionLog.length} sessions · {tasks.filter(t=>!t.done).length} pending tasks · {streak}-day streak</div>
        </div>
      </div>

      {/* Chat window */}
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", display:"flex", flexDirection:"column", height:"52vh", minHeight:300, boxShadow:"var(--shadow-md)" }}>
        <div style={{ flex:1, overflowY:"auto", padding:"1.1rem", display:"flex", flexDirection:"column", gap:".8rem" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && (
                <div style={{ width:28, height:28, borderRadius:8, background:"var(--grad-brand)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#000", fontSize:".7rem", flexShrink:0, marginRight:".5rem", alignSelf:"flex-end" }}>A</div>
              )}
              <div style={{
                maxWidth:"76%",
                background: m.role==="user" ? "rgba(0,212,255,.1)" : "var(--bg2)",
                border: `1px solid ${m.role==="user" ? "rgba(0,212,255,.22)" : "var(--border)"}`,
                borderRadius: m.role==="user" ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                padding:".7rem .95rem",
                fontSize:".82rem",
                lineHeight:1.65,
                color:"var(--text)",
                whiteSpace:"pre-wrap",
                animation:"fadeUp .25s var(--ease)",
              }}>
                {m.role === "assistant" && (
                  <div className="ark-badge">Arkmaester Insight</div>
                )}
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display:"flex", justifyContent:"flex-start", alignItems:"center", gap:".5rem" }}>
              <div style={{ width:28, height:28, borderRadius:8, background:"var(--grad-brand)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#000", fontSize:".7rem", flexShrink:0 }}>A</div>
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"4px 14px 14px 14px", padding:".65rem .95rem", display:"flex", gap:".32rem", alignItems:"center" }}>
                {[0,1,2].map((i) => (
                  <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"var(--cyan)", animation:`pulse 1s ${i*.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop:"1px solid var(--border)", padding:".8rem 1.1rem", display:"flex", gap:".5rem" }}>
          <input
            className="ti" style={{ flex:1, fontSize:".85rem", padding:".52rem .8rem" }}
            placeholder="Ask Arkmaester…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            disabled={loading}
          />
          <button className="ba" style={{ width:44, height:44 }} onClick={() => send()} disabled={loading}>
            {loading ? "…" : "↑"}
          </button>
        </div>
      </div>

      {/* Quick prompts */}
      <div style={{ marginTop:".9rem" }}>
        <div style={{ fontSize:".62rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"2px", marginBottom:".52rem" }}>QUICK QUESTIONS</div>
        <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap" }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} className="mb" style={{ fontSize:".72rem", padding:".3rem .7rem" }} onClick={() => send(s)} disabled={loading}>{s}</button>
          ))}
        </div>
      </div>

      {/* Context preview */}
      <div style={{ marginTop:"1.1rem", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r-md)", padding:".85rem 1.1rem" }}>
        <div style={{ fontSize:".6rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"2px", marginBottom:".45rem" }}>CONTEXT SENT TO ARKMAESTER</div>
        <pre style={{ fontSize:".68rem", color:"var(--muted)", whiteSpace:"pre-wrap", lineHeight:1.65, margin:0 }}>{contextSummary}</pre>
      </div>
    </div>
  );
}
