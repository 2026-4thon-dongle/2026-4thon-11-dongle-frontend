// Shared API transport: api/common.md, api/auth.md.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://dongle-api.zanviq.dev').replace(/\/$/, '')
export const isApiDemo = import.meta.env.DEV && import.meta.env.VITE_API_MOCK === 'true'
const ACCESS_KEY = 'dongle.access-token', REFRESH_KEY = 'dongle.refresh-token'
let memoryTokens = null
let revision = 0
const sessionListeners = new Set()
export function subscribeSession(listener) { sessionListeners.add(listener); return () => sessionListeners.delete(listener) }
function stored(key) { try { return localStorage.getItem(key) || undefined } catch { return undefined } }
export function getTokens() { return memoryTokens ?? { access: stored(ACCESS_KEY), refresh: stored(REFRESH_KEY) } }
export const getAccessToken = () => getTokens().access
export const hasSession = () => Boolean(getTokens().access || getTokens().refresh)
export function setTokens(tokens) {
  revision++
  memoryTokens = { access: tokens.access, refresh: tokens.refresh }
  try {
    for (const [key, value] of [[ACCESS_KEY, tokens.access], [REFRESH_KEY, tokens.refresh]]) {
      if (value) localStorage.setItem(key, value)
      else localStorage.removeItem(key)
    }
  } catch { /* Use memory tokens. */ }
}
export const saveTokens = setTokens
export function clearTokens() {
  const hadSession = hasSession()
  setTokens({})
  sessionListeners.forEach((listener) => listener())
  if (hadSession && typeof window !== 'undefined') window.dispatchEvent(new Event('dongle:session-expired'))
}
export class ApiError extends Error {
  constructor(status, body = {}) {
    super(body.message ?? '요청을 처리하지 못했어요.')
    this.name = 'ApiError'
    this.status = status
    this.code = body.code ?? (status === 0 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR')
    this.errors = body.errors ?? null
    this.body = body
    for (const [key, value] of Object.entries(body)) if (!(key in this)) this[key] = value
  }
}
export function query(path, values = {}) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') params.set(key, String(value)) })
  return `${path}${params.size ? `?${params}` : ''}`
}
let refreshing = null
async function refreshAccessToken() {
  if (refreshing) return refreshing
  const tokens = getTokens(), started = revision
  if (!tokens.refresh) { clearTokens(); return false }
  refreshing = (async () => {
    let response
    try {
      response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh: tokens.refresh }) })
    } catch { throw new ApiError(0, { message: '서버에 연결하지 못했어요. 다시 시도해주세요.' }) }
    if (revision !== started) return false
    if (!response.ok) {
      if (response.status === 401) { clearTokens(); return false }
      throw new ApiError(response.status, await response.json().catch(() => ({})))
    }
    const data = await response.json()
    if (revision !== started) return false
    if (!data.access || !data.refresh) throw new ApiError(502, { message: '로그인 갱신 응답을 확인할 수 없어요.' })
    setTokens(data)
    return true
  })().finally(() => { refreshing = null })
  return refreshing
}
export async function request(path, { method = 'GET', query: params, json, formData, body, auth = true } = {}) {
  const payload = formData ?? body ?? json
  const url = `${API_BASE_URL}${params ? query(path, params) : path}`
  async function send() {
    const headers = new Headers({ Accept: 'application/json' })
    const token = auth ? getAccessToken() : null
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const multipart = payload instanceof FormData
    if (payload !== undefined && !multipart) headers.set('Content-Type', 'application/json')
    try { return await fetch(url, { method, headers, body: payload === undefined ? undefined : multipart ? payload : JSON.stringify(payload) }) }
    catch { throw new ApiError(0, { message: '서버에 연결하지 못했어요. 다시 시도해주세요.' }) }
  }
  const sentAccess = getAccessToken()
  let response = await send()
  if (auth && response.status === 401) {
    const data = await response.clone().json().catch(() => null)
    if (data?.code === 'TOKEN_NOT_VALID' && ((getAccessToken() && getAccessToken() !== sentAccess) || await refreshAccessToken())) response = await send()
    if (response.status === 401 && hasSession()) clearTokens()
  }
  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, data ?? {})
  if (data === null) throw new ApiError(502, { message: '서버 응답을 확인할 수 없어요. 다시 시도해주세요.' })
  return data
}
