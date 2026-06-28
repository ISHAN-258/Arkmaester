import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import { useTimer } from "./hooks/useTimer.js";
import { useNotifications } from "./hooks/useNotifications.js";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts.js";
import { useSwipeNav } from "./hooks/useSwipeNav.js";
import { storageGet, storageSet, KEYS } from "./utils/storage.js";

import ErrorBoundary  from "./components/common/ErrorBoundary.jsx";
import Onboarding     from "./components/onboarding/Onboarding.jsx";
import Navbar         from "./components/navbar/Navbar.jsx";
import LandingPage    from "./components/landing/LandingPage.jsx";
import TimerPage      from "./components/timer/TimerPage.jsx";
import TrackerPage    from "./components/tracker/TrackerPage.jsx";
import PlannerPage    from "./components/planner/PlannerPage.jsx";
import InsightsPage   from "./components/analytics/InsightsPage.jsx";
import HistoryPage    from "./components/history/HistoryPage.jsx";
import AIChatPage     from "./components/chatbot/AIChat.jsx";
import { SessionToast, ReportModal, NotesModal } from "./components/modals/SessionModals.jsx";

function LoadingScreen() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:"1.25rem", background:"var(--bg)" }}>
      <div style={{ width:52, height:52, borderRadius:13, background:"var(--grad-brand)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:"1.3rem", color:"#000", boxShadow:"0 6px 28px rgba(0,212,255,.35)", animation:"float 3s ease-in-out infinite" }}>A</div>
      <div style={{ fontFamily:"var(--mono)", color:"var(--cyan)", fontSize:".65rem", letterSpacing:"4px" }}>ARKMAESTER</div>
      <div style={{ display:"flex", gap:".3rem" }}>
        {[0,1,2].map((i) => (
          <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"var(--cyan)", animation:`pulse 1.2s ${i*.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

function InnerApp() {
  const { page, setPage, pomoMins, activeSubjId, handleSessionComplete, tasks, loaded } = useApp();
  const { askPermission, startSchedulers } = useNotifications();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const timerState = useTimer({ pomoMins, activeSubjId, onSessionComplete: handleSessionComplete });

  useKeyboardShortcuts({ timerState, setPage });
  useSwipeNav({ page, setPage });

  // Check onboarding
  useEffect(() => {
    if (!loaded) return;
    storageGet(KEYS.ONBOARDED, null).then((seen) => {
      if (!seen) setShowOnboarding(true);
    });
  }, [loaded]);

  // Request notification permission
  useEffect(() => {
    if (!loaded) return;
    askPermission().then(() => startSchedulers(tasks));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  if (!loaded) return <LoadingScreen />;

  return (
    <>
      <div className="grid-bg" />
      <canvas id="confetti-canvas" style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:999 }} />

      {showOnboarding && (
        <Onboarding onComplete={() => {
          void storageSet(KEYS.ONBOARDED, "1");
          setShowOnboarding(false);
        }} />
      )}

      <Navbar timerState={timerState} />

      <main>
        {page === "home"     && <LandingPage />}
        {page === "study"    && <TimerPage timerState={timerState} />}
        {page === "tracker"  && <TrackerPage />}
        {page === "planner"  && <PlannerPage />}
        {page === "insights" && <InsightsPage />}
        {page === "history"  && <HistoryPage />}
        {page === "chat"     && <AIChatPage />}
      </main>

      <SessionToast />
      <ReportModal />
      <NotesModal />
    </>
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
