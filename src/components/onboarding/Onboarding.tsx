import { useState, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Volume2, User, Award, Layers } from "lucide-react";
import { DEF_SUBJ } from "../../utils/constants";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(0);

  // Setup states
  const [name, setName] = useState<string>("Master Focus");
  const [goal, setGoal] = useState<number>(4);
  const [selectedSubj, setSelectedSubj] = useState<string[]>(["math", "cs", "phys", "chem"]);

  const totalSteps = 10;

  const handleSkip = useCallback(() => {
    localStorage.setItem("ef:onboarded", "1");
    localStorage.setItem("ef:username", name);
    localStorage.setItem("ef:daily_goal_hrs", String(goal));
    onComplete();
  }, [name, goal, onComplete]);

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep((p) => p + 1);
    } else {
      handleSkip();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((p) => p - 1);
    }
  };

  const toggleSubject = (id: string) => {
    setSelectedSubj((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Render Explainer Steps
  const renderExplainer = () => {
    switch (step) {
      case 0:
        return (
          <div className="fade-up text-center flex flex-col items-center justify-center space-y-6">
            <h1 style={{
              fontFamily: "var(--syne)",
              fontSize: "3rem",
              fontWeight: "bold",
              letterSpacing: "-0.03em",
              lineHeight: 1.05
            }} className="text-white">
              ARK<span className="text-[#00e5ff] font-extrabold shadow-cyan-300">MAESTER</span>
            </h1>
            <p className="sl">CONQUER THE CHAOS. SETTLE THE SCORE.</p>
            <div className="max-w-md text-slate-400 text-sm">
              Welcome to the premier AI-integrated productivity OS for students. Let's calibrate your study interface and guide you through your capabilities.
            </div>
            <button
              onClick={handleNext}
              className="mt-6 px-8 py-3 bg-cyan-400 hover:bg-cyan-300 transition text-black font-semibold rounded-lg flex items-center gap-2 hover:scale-105"
            >
              Initialize OS <ChevronRight size={18} />
            </button>
          </div>
        );
      case 1:
        return (
          <div className="fade-up text-center space-y-4">
            <div className="text-5xl">📋</div>
            <h2 className="text-2xl font-bold text-white">01 / Plan Your Day</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Use Voice Planner to dictate tasks naturally. Arkmaester automatically identifies subjects and structures daily routines.
            </p>
          </div>
        );
      case 2:
        return (
          <div className="fade-up text-center space-y-4">
            <div className="text-5xl">⏱</div>
            <h2 className="text-2xl font-bold text-white">02 / Persistent Focus Timers</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Run customized study/break Pomodoros mapped directly to subjects. Countdowns persist seamlessly as you navigate different views.
            </p>
          </div>
        );
      case 3:
        return (
          <div className="fade-up text-center space-y-4">
            <div className="text-5xl">👁</div>
            <h2 className="text-2xl font-bold text-white">03 / Webcam Posture Guard</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Integrated machine learning model BlazePose assesses your seating verticality and alerts you of slouching or mobile phone grabs.
            </p>
          </div>
        );
      case 4:
        return (
          <div className="fade-up text-center space-y-4">
            <div className="text-5xl">📊</div>
            <h2 className="text-2xl font-bold text-white">04 / Performance Heatmaps</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Study metrics feed into interactive 28-day streak calendars, task completion ratios, and peak alert logging filters.
            </p>
          </div>
        );
      case 5:
        return (
          <div className="fade-up text-center space-y-4">
            <div className="text-5xl">🚀</div>
            <h2 className="text-2xl font-bold text-white">05 / Personal Study Intel</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Every logged cycle trains the localized intelligence engine, delivering helpful fatigue warnings, advice, and summaries.
            </p>
          </div>
        );
      case 6:
        return (
          <div className="fade-up text-center space-y-6 w-full max-w-md mx-auto">
            <div className="flex justify-center"><User size={48} className="text-cyan-400" /></div>
            <h2 className="text-xl font-bold text-white">What should we call you?</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-center text-lg text-white rounded-lg p-3 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              placeholder="Name..."
            />
            <p className="text-xs text-slate-500">Your profile information is strictly private and stored completely offline.</p>
          </div>
        );
      case 7:
        return (
          <div className="fade-up text-center space-y-6 w-full max-w-md mx-auto">
            <div className="flex justify-center"><Award size={48} className="text-cyan-400" /></div>
            <h2 className="text-xl font-bold text-white">Daily study hours goal?</h2>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setGoal((g) => Math.max(1, g - 1))}
                className="w-12 h-12 bg-slate-900 hover:bg-slate-850 rounded-lg text-lg text-white border border-slate-700 font-bold"
              >
                -
              </button>
              <div className="text-4xl font-mono text-cyan-400 font-bold">{goal} Hrs</div>
              <button
                onClick={() => setGoal((g) => Math.min(16, g + 1))}
                className="w-12 h-12 bg-slate-900 hover:bg-slate-850 rounded-lg text-lg text-white border border-slate-700 font-bold"
              >
                +
              </button>
            </div>
            <p className="text-xs text-slate-400">We recommend 4-5 hours for optimal mental endurance and burnout avoidance.</p>
          </div>
        );
      case 8:
        return (
          <div className="fade-up text-center space-y-6 w-full max-w-md mx-auto">
            <div className="flex justify-center"><Layers size={48} className="text-cyan-400" /></div>
            <h2 className="text-xl font-bold text-white">Select study subjects</h2>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {DEF_SUBJ.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  style={{
                    borderColor: selectedSubj.includes(sub.id) ? sub.color : "var(--border)",
                    backgroundColor: selectedSubj.includes(sub.id) ? "rgba(0, 229, 255, 0.05)" : "transparent"
                  }}
                  className="p-3 border rounded-lg text-sm font-semibold transition text-slate-300"
                >
                  <span style={{ color: sub.color }} className="mr-2">■</span> {sub.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">You can customize, add, or delete subjects inside your page options.</p>
          </div>
        );
      case 9:
        return (
          <div className="fade-up text-center space-y-6 w-full max-w-md mx-auto">
            <div className="text-5xl">⚔️</div>
            <h2 className="text-2xl font-bold text-white">Operational Matrix Ready!</h2>
            <div className="bg-slate-900 p-4 border border-slate-800 rounded-lg text-left space-y-2 text-sm text-slate-300">
              <div><strong className="text-cyan-400">Candidate:</strong> {name}</div>
              <div><strong className="text-cyan-400">Aim:</strong> {goal} Hours/day</div>
              <div><strong className="text-cyan-400">Course:</strong> {selectedSubj.length} active subject modules</div>
            </div>
            <button
              onClick={handleSkip}
              className="w-full py-3 bg-cyan-400 text-black text-center font-bold text-sm tracking-wide rounded-lg uppercase hover:bg-cyan-300 transition"
            >
              Enter Arkmaester OS
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(5, 8, 16, 0.98)",
      backdropFilter: "blur(20px)",
      zIndex: 2000,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "2rem"
    }}>
      {/* Top Bar Bar Nav */}
      <div className="flex items-center justify-between">
        {/* Step Indicator dots */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === step ? "28px" : "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: idx === step ? "var(--cyan)" : "rgba(255, 255, 255, 0.15)",
                transition: "all 0.25s ease-out"
              }}
            />
          ))}
        </div>

        {/* Skip option */}
        <button
          onClick={handleSkip}
          style={{
            fontSize: "0.85rem",
            color: "var(--muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: "semibold"
          }}
          className="hover:text-white transition"
        >
          Skip Setup
        </button>
      </div>

      {/* Main Focus Window */}
      <div className="flex-1 flex items-center justify-center py-6">
        {renderExplainer()}
      </div>

      {/* Bottom Option Nav */}
      <div className="flex justify-between items-center max-w-md mx-auto w-full">
        {step > 0 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-sm"
          >
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <div />
        )}

        {step < totalSteps - 1 && step > 0 && (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-400 hover:text-white rounded-lg text-sm transition flex items-center gap-1"
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
