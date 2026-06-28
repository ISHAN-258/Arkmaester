// ── Auth Service — stub for future JWT / Firebase auth ───────────────────
// Replace body of each function when auth is implemented.

let _currentUser = null;

/**
 * Returns current user object or null.
 */
export function getCurrentUser() {
  return _currentUser;
}

/**
 * Stub sign-in. Replace with real API call.
 */
export async function signIn(email, password) {
  // TODO: POST to /api/auth/login, store JWT
  console.warn("authService.signIn — not implemented yet");
  return { user: null, error: "Auth not implemented" };
}

/**
 * Stub sign-up. Replace with real API call.
 */
export async function signUp(email, password) {
  // TODO: POST to /api/auth/register
  console.warn("authService.signUp — not implemented yet");
  return { user: null, error: "Auth not implemented" };
}

/**
 * Stub sign-out.
 */
export async function signOut() {
  _currentUser = null;
}

/**
 * Get stored JWT token (for API calls).
 */
export function getToken() {
  return localStorage.getItem("ark:token") ?? null;
}
