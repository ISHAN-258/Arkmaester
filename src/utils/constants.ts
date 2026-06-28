export const DEF_POMO_MINS = 25;

export const DEF_SUBJ = [
  { id: "math", name: "Mathematics", color: "#00e5ff" },
  { id: "cs", name: "Computer Science", color: "#00ff88" },
  { id: "phys", name: "Physics", color: "#ffb300" },
  { id: "chem", name: "Chemistry", color: "#a78bfa" },
];

export const DEF_TASKS = [
  { id: 1, text: "Revise Mathematics calculus formulas", done: false, priority: "high", date: new Date().toISOString().split("T")[0] },
  { id: 2, text: "Implement Computer Science database API", done: true, priority: "medium", date: new Date().toISOString().split("T")[0] },
  { id: 3, text: "Read Physics wave optics lesson", done: false, priority: "low", date: new Date().toISOString().split("T")[0] },
];

export const FEATURES = [
  { icon: "🎙", title: "Voice Planner", desc: "Speak your tasks naturally. Arkmaester parses your voice into prioritised to-dos instantly." },
  { icon: "⏱", title: "Focus Timer", desc: "Pomodoro system with global timer that persists across all pages. Audio alerts and browser notifications." },
  { icon: "👁", title: "Posture Detection", desc: "MediaPipe BlazePose tracks your posture and phone usage in real time, alerting you before bad habits set in." },
  { icon: "📋", title: "Smart Scheduling", desc: "AI-powered daily planner auto-organises tasks by priority, detects subjects, and builds your optimal routine." },
  { icon: "📊", title: "Analytics Dashboard", desc: "28-day heatmap, weekly charts, peak hour analysis, and subject breakdowns all powered by your real data." },
  { icon: "🤖", title: "AI Insights", desc: "Arkmaester analyses your patterns and delivers personalised productivity intelligence and burnout warnings." },
  { icon: "📋", title: "Session Reports", desc: "Every study session is logged with duration, subject, notes, and exportable as CSV or TXT." },
  { icon: "🔥", title: "Productivity Streaks", desc: "Visual streak calendar and milestone celebrations with confetti to keep you consistently motivated." },
];

export const REVS = [
  { name: "Priya S.", role: "MCA, VIT", init: "PS", stars: 5, text: "Arkmaester changed how I study. The posture guard stopped my back pain and I stay focused way longer." },
  { name: "Rahul M.", role: "B.Tech, IIT", init: "RM", stars: 5, text: "The Pomodoro timer with task tracking is my daily driver now. Simple, fast, no distractions." },
  { name: "Ananya K.", role: "BSc CS, Christ", init: "AK", stars: 5, text: "Analytics showed I was studying Maths at my worst hour. Swapped to mornings — scores jumped." },
  { name: "Dev P.", role: "MCA, Jaunpur", init: "DP", stars: 4, text: "The anti-distraction camera alert is brutal in a good way. Caught myself grabbing my phone 12 times on day 1." },
  { name: "Sneha R.", role: "MSc, Pune", init: "SR", stars: 5, text: "Clean UI, no clutter. The weekly report is genuinely useful — shows where time actually goes." },
  { name: "Arjun T.", role: "B.Tech, NIT", init: "AT", stars: 4, text: "Planner and timer in one place. Finally stopped switching between 5 apps." },
];
