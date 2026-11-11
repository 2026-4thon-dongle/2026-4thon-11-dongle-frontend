// Frontend-only signup profile; replace with the authenticated user API later.
const KEY = 'dongle.signup-profile'
const listeners = new Set()
let currentProfile = null
export function getSignupProfile() {
  try {
    const profile = currentProfile || JSON.parse(localStorage.getItem(KEY))
    return profile?.nickname && profile?.residence?.province && profile?.hometowns?.length ? profile : null
  } catch { return null }
}
export function saveSignupProfile(profile) {
  const saved = { ...profile, id: profile.id || crypto.randomUUID() }
  currentProfile = saved
  try { localStorage.setItem(KEY, JSON.stringify(saved)) } catch { /* Keep the current flow usable if storage is unavailable. */ }
  listeners.forEach((listener) => listener(saved))
  return saved
}
export function subscribeSignupProfile(listener) { listeners.add(listener); return () => listeners.delete(listener) }
