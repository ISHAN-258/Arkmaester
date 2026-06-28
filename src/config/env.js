// ── Arkmaester — Environment Configuration ────────────────────────────────
// All env vars flow through here. Swap values when moving to production.

const env = {
  // App
  APP_NAME:    "Arkmaester",
  APP_VERSION: "1.0.0",
  APP_ENV:     import.meta.env.MODE ?? "development",

  // API (Express + MongoDB Atlas)
  API_BASE_URL: import.meta.env.VITE_API_URL ?? "/api",
  USE_API: import.meta.env.VITE_USE_API !== "false",

  // Auth (future JWT / Firebase)
  AUTH_ENABLED: import.meta.env.VITE_AUTH_ENABLED === "true",

  // AI Chat (Claude API — proxied in production)
  AI_PROXY_URL: import.meta.env.VITE_AI_PROXY ?? "https://api.anthropic.com/v1/messages",

  // Feature flags
  FEATURES: {
    MEDIAPIPE:     true,
    VOICE_PLANNER: true,
    AI_CHAT:       true,
    NOTIFICATIONS: true,
    PWA:           true,
  },
};

export default env;
