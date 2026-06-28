import { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/navbar/Navbar";
import Onboarding from "./components/onboarding/Onboarding";
import HowItWorksModal from "./components/onboarding/HowItWorksModal";
import LandingPage from "./components/landing/LandingPage";
import TimerPage from "./components/timer/TimerPage";
import TrackerPage from "./components/tracker/TrackerPage";
import PlannerPage from "./components/planner/PlannerPage";
import InsightsPage from "./components/analytics/InsightsPage";
import HistoryPage from "./components/history/HistoryPage";
import AIChat from "./components/chatbot/AIChat";
import SessionModals from "./components/modals/SessionModals";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Hooks
import { useTimer } from "./hooks/useTimer";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSwipeNav } from "./hooks/useSwipeNav";

function InnerApp() {
  const { 
    page, setPage, pomoMins, activeSubjId, handleSessionComplete, loaded 
  } = useApp();

  // 1. Initialize global Pomodoro study/break clocks
  const timerState = useTimer({
    pomoMins,
    activeSubjId,
    onSessionComplete: handleSessionComplete
  });

  // 2. Map global power nav Map keyboards shortcuts
  useKeyboardShortcuts({
    timerState,
    setPage
  });

  // 3. Map device Swipes navigation behaviors
  useSwipeNav({
    page,
    setPage
  });

  // 4. Onboarding states
  const [onboarded, setOnboarded] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  useEffect(() => {
    const status = localStorage.getItem("ef:onboarded");
    if (status !== "1") {
      setOnboarded(false);
    }
  }, []);

  if (!loaded) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#050810",
        color: "var(--cyan)",
        fontFamily: "var(--mono)",
        fontSize: "0.85rem"
      }}>
        <span className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
        INITIALIZING OS ...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--background)",
      color: "var(--text)",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Onboarding Guide prompt */}
      {!onboarded && (
        <Onboarding onComplete={() => setOnboarded(true)} />
      )}

      {/* Blueprint process assistance */}
      {showHelp && (
        <HowItWorksModal onClose={() => setShowHelp(false)} />
      )}

      {/* Navigation header */}
      <Navbar 
        timerState={timerState} 
        onOpenHelp={() => setShowHelp(true)} 
      />

      {/* Main viewport panels */}
      <main style={{ flex: 1 }} className="px-4 md:px-0">
        {page === "home" && <LandingPage />}
        {page === "study" && <TimerPage timerState={timerState} />}
        {page === "tracker" && <TrackerPage />}
        {page === "planner" && <PlannerPage />}
        {page === "insights" && <InsightsPage />}
        {page === "history" && <HistoryPage />}
        {page === "chat" && <AIChat />}
      </main>

      {/* Persistent global feedback modal dialogs */}
      <SessionModals />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <InnerApp />
      </AppProvider>
    </ErrorBoundary>
  );
}
