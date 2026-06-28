import { useState, useRef, useEffect, FormEvent } from "react";
import { useApp } from "../../context/AppContext";
import { Sparkles, Send, Brain, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const { subjects, sessionLog } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Greetings, Scholar. I am Arkmaester AI, your cognitive advisor modules. Ask me anything to structure your revision schedules, study techniques (e.g., Active Recall, Feynman method), or decode difficult topics." }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage: Message = { role: "user", content: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    const userName = localStorage.getItem("ef:username") || "Scholar";
    const userGoal = localStorage.getItem("ef:daily_goal_hrs") || "4";

    // Enrich intelligence with contextual variables
    const systemInstruction = `You are Arkmaester AI, an elite scholastic intelligence engine.
The student in touch is named ${userName}.
Their target daily study depth goal is ${userGoal} hours.
Their active subject modules are: ${subjects.map((s) => s.name).join(", ")}.
Completed study sessions logs count: ${sessionLog.length}.

Respond with inspiring, elegant, authoritative clarity. Provide concrete tips on Feynman methods, spaced repetitions, active recall, or optimal mental resting blocks. Keep responses succinct and actionable.`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemInstruction
        })
      });

      const data = await response.json();
      if (response.ok && data.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      } else {
        setMessages((prev) => [
          ...prev, 
          { role: "assistant", content: `Error: ${data.error || "The AI server is experiencing latency. Please check your API configuration."}` }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "Cognitive connection disrupted. Ensure your server environment is online and try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="constrain-layout py-8 space-y-6 fade-in flex flex-col h-[calc(100vh-120px)]">
      
      {/* Title */}
      <div className="page-header-container flex-shrink-0">
        <div className="sl">// AI Scholastic & Cognitive Companion</div>
        <h2 className="page-title">Arkmaester Advisor</h2>
        <p className="page-sub">
          Consult the localized AI master regarding active recall tactics, revision blocks, or routine adjustments.
        </p>
      </div>

      {/* Main chat window panels */}
      <div className="flex-1 min-h-0 sc flex flex-col justify-between" style={{ display: "flex", flexDirection: "column" }}>
        
        {/* Messages scrolling container */}
        <div 
          ref={scrollRef}
          style={{ overflowY: "auto" }}
          className="flex-1 space-y-4 pr-1 scrollbar-custom"
        >
          {messages.map((m, idx) => {
            const isAI = m.role === "assistant";
            return (
              <div 
                key={idx}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexDirection: isAI ? "row" : "row-reverse",
                  alignItems: "start"
                }}
                className="fade-up"
              >
                {/* Avatar icons */}
                <div style={{
                  width: "28px", height: "28px",
                  borderRadius: "50%",
                  backgroundColor: isAI ? "rgba(0, 229, 255, 0.08)" : "rgba(167, 139, 250, 0.08)",
                  border: "1px solid",
                  borderColor: isAI ? "var(--cyan)" : "var(--purple)",
                  color: isAI ? "var(--cyan)" : "var(--purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {isAI ? <Bot size={13} /> : <User size={13} />}
                </div>

                {/* Speech bubbles */}
                <div style={{
                  maxWidth: "75%",
                  backgroundColor: isAI ? "rgba(10, 15, 30, 0.4)" : "rgba(31, 15, 50, 0.2)",
                  border: "1px solid",
                  borderColor: isAI ? "var(--border)" : "rgba(167, 139, 250, 0.15)",
                  borderRadius: isAI ? "0 12px 12px 12px" : "12px 0 12px 12px",
                  padding: "1rem",
                  fontSize: "0.80rem",
                  color: "var(--text)",
                  lineHeight: 1.5,
                  whiteSpace: "pre-line"
                }}>
                  {m.content}
                </div>

              </div>
            );
          })}

          {/* AI generating loader */}
          {loading && (
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "start" }} className="fade-in">
              <div style={{
                width: "28px", height: "28px",
                borderRadius: "50%",
                backgroundColor: "rgba(0, 229, 255, 0.08)",
                border: "1px solid var(--cyan)",
                color: "var(--cyan)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <Bot size={13} />
              </div>
              
              <div 
                style={{
                  backgroundColor: "rgba(10, 15, 30, 0.4)",
                  border: "1px solid var(--border)",
                  borderRadius: "0 12px 12px 12px",
                  padding: "1rem"
                }}
                className="flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          )}

        </div>

        {/* Input panels */}
        <form onSubmit={handleSend} className="flex gap-2.5 mt-4 pt-3 border-t border-slate-900 flex-shrink-0">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            placeholder="Query Arkmaester advisor... E.g., How do I structure Feynman study blocks?"
            style={{
              flex: 1, padding: "0.65rem 1rem",
              backgroundColor: "rgba(5, 8, 16, 0.4)",
              border: "1px solid var(--border)",
              color: "white", fontSize: "0.8rem", borderRadius: "10px",
              outline: "none"
            }}
            className="focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
          <button 
            type="submit"
            disabled={loading || !inputText.trim()}
            style={{
              padding: "0.65rem 1.25rem",
              backgroundColor: "var(--cyan)",
              color: "black",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "0.8rem"
            }}
            className="hover:scale-[1.02] active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send size={12} /> Consult
          </button>
        </form>

      </div>

    </div>
  );
}
export type AIChatState = ReturnType<typeof AIChat>;
