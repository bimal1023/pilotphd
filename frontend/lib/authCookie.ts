const COOKIE_NAME = "pilotphd_logged_in"
const COOKIE_TTL = 60 * 60 * 24 * 7 // 7 days — matches JWT expiry

/** Call after a successful login / verify-email / reset-password */
export function setAuthCookie() {
  document.cookie = `${COOKIE_NAME}=1; max-age=${COOKIE_TTL}; path=/; SameSite=Lax`
}

/** Call on logout or when a 401 is received */
export function clearAuthCookie() {
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`
}

/** Returns true if the session cookie is present (client-side only) */
export function hasAuthCookie(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_NAME}=1`))
}
