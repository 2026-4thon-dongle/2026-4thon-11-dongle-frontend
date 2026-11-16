import { isApiDemo, request, subscribeSession } from './client.js'
import { mapProfile } from './mappers.js'
const KEY = 'dongle.signup-profile'
const listeners = new Set()
let currentProfile = null, generation = 0
export function getSignupProfile() {
  if (!isApiDemo) return currentProfile
  try { return currentProfile || JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}
export function saveSignupProfile(profile) {
  currentProfile = profile ? { ...profile, id: String(profile.id || crypto.randomUUID()) } : null
  if (isApiDemo) { try { localStorage.setItem(KEY, JSON.stringify(currentProfile)) } catch { /* Use memory. */ } }
  listeners.forEach((listener) => listener(currentProfile))
  return currentProfile
}
export async function loadProfile() {
  const current = generation
  const profile = mapProfile(await request('/api/users/me/'))
  if (current !== generation) return null
  return saveSignupProfile(profile)
}
export function subscribeSignupProfile(listener) { listeners.add(listener); return () => listeners.delete(listener) }
subscribeSession(() => { generation++; saveSignupProfile(null) })
