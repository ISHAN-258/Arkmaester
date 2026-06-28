// ── Arkmaester — App-wide constants ───────────────────────────────────────

export const APP_NAME    = "Arkmaester";
export const APP_TAGLINE = "Conquer the Chaos. Settle the Score.";

export const SUBJ_COLORS = [
  "#00d4ff","#00e896","#ffb700","#ff6b9d",
  "#8b5cf6","#fb923c","#34d399","#60a5fa",
];

export const DEF_SUBJ = [
  { id:1, name:"Data Structures",      color:"#00d4ff", target:20, manualHours:2 },
  { id:2, name:"Operating Systems",    color:"#00e896", target:15, manualHours:1 },
  { id:3, name:"DBMS",                 color:"#ffb700", target:12, manualHours:1 },
  { id:4, name:"Computer Networks",    color:"#ff6b9d", target:10, manualHours:0 },
  { id:5, name:"Software Engineering", color:"#8b5cf6", target:8,  manualHours:0 },
];

export const DEF_TASKS = [
  { id:1, text:"Read Chapter 5 — OS Scheduling",  done:false, priority:"high",   subject:null },
  { id:2, text:"Solve 10 DSA problems",            done:false, priority:"high",   subject:null },
  { id:3, text:"Review DBMS normalization notes",  done:true,  priority:"medium", subject:null },
];

export const DEF_POMO_MINS = { focus:25, short:5, long:15 };
export const POMO_PRESETS  = [15, 25, 45, 60];

export const SOUND_OPTIONS = [
  { id:"piano", label:"Piano",  sub:"Warm ascending chords"     },
  { id:"bell",  label:"Bell",   sub:"Crystalline triangle wave" },
  { id:"beep",  label:"Beep",   sub:"Classic square pulse"      },
];

export const TASK_PRIORITIES = ["high","medium","low"];

export const REVS = [
  { name:"Priya S.",  role:"MCA, VIT",          init:"PS", stars:5, text:"Arkmaester changed how I study. Posture guard stopped my back pain and I stay focused way longer."         },
  { name:"Rahul M.",  role:"B.Tech, IIT",        init:"RM", stars:5, text:"Pomodoro timer with AI task tracking is my daily driver. Clean, fast, no distractions."                   },
  { name:"Ananya K.", role:"BSc CS, Christ",     init:"AK", stars:5, text:"Analytics showed I was studying Maths at my worst hour. Swapped to morning — scores jumped."              },
  { name:"Dev P.",    role:"MCA, Jaunpur",       init:"DP", stars:4, text:"Anti-distraction camera alert is brutal in a good way. Caught myself grabbing phone 12 times on day 1."  },
  { name:"Sneha R.",  role:"MSc, Pune",          init:"SR", stars:5, text:"Clean UI, no clutter. Weekly AI report is genuinely useful — shows where time actually goes."             },
  { name:"Arjun T.",  role:"B.Tech, NIT",        init:"AT", stars:4, text:"Planner + timer + AI chat in one place. Stopped switching between 5 apps."                               },
];

export const NAV_ITEMS = [
  { id:"home",     label:"Home"     },
  { id:"study",    label:"Timer"    },
  { id:"tracker",  label:"Tracker"  },
  { id:"planner",  label:"Planner"  },
  { id:"insights", label:"Insights" },
  { id:"history",  label:"History"  },
  { id:"chat",     label:"AI Chat"  },
];

export const HEALTH_WEIGHTS  = { posture:.35, focus:.30, consistency:.20, distraction:.15 };
export const BREAK_THRESHOLDS = { postureWarn:65, focusWarn:60, sessionCount:4 };

// Legacy mode labels (used in useTimer)
export const ML = { focus:"Focus", short:"Short Break", long:"Long Break" };
