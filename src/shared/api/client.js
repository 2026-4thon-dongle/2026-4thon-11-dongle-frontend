// 서버 호출 공통 기반. 명세: 문서 레포 api/common.md, api/auth.md
// 화면별 API 모듈(letterApi 등)은 이 request()와 토큰 저장 함수만 쓴다.
//   - 서버 주소: VITE_API_BASE_URL (없으면 배포 서버)
//   - 인증: access를 Authorization: Bearer로 보낸다. 401 TOKEN_NOT_VALID가 나면 refresh로 갱신하고 한 번만 다시 보낸다.
//   - 에러: 서버 에러 형식 {code, message, ...}을 ApiError로 던진다.

const DEFAULT_API_BASE_URL = 'https://dongle-api.zanviq.dev'
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '')

const ACCESS_KEY = 'dongle.access-token'
const REFRESH_KEY = 'dongle.refresh-token'

// 브라우저 저장소를 못 쓰는 환경(사생활 보호 모드 등)에서도 이번 접속 동안은 동작하도록 메모리에도 둔다.
let memoryTokens = { access: null, refresh: null }

function readStorage(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key, value) {
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
    // 저장소를 못 쓰면 메모리 값만 쓴다.
  }
}

/** 로그인·가입·갱신으로 받은 토큰을 저장한다. refresh를 안 주면 기존 값을 둔다. */
export function setTokens({ access, refresh }) {
  memoryTokens = { access: access ?? null, refresh: refresh ?? memoryTokens.refresh }
  writeStorage(ACCESS_KEY, memoryTokens.access)
  if (refresh) writeStorage(REFRESH_KEY, refresh)
}

/** 로그아웃·탈퇴·갱신 실패 때 토큰을 지운다. */
export function clearTokens() {
  memoryTokens = { access: null, refresh: null }
  writeStorage(ACCESS_KEY, null)
  writeStorage(REFRESH_KEY, null)
}

export const getAccessToken = () =>
  memoryTokens.access ?? readStorage(ACCESS_KEY) ?? import.meta.env.VITE_DEV_ACCESS_TOKEN ?? null

const getRefreshToken = () => memoryTokens.refresh ?? readStorage(REFRESH_KEY)

/** 로그인 상태(토큰이 있는지). 유효한지는 서버가 판단한다. */
export const hasSession = () => Boolean(getAccessToken())

/**
 * 서버가 준 에러. 에러 형식 {code, message, ...추가 필드}를 그대로 담는다.
 * code로 분기하고(예: 'ITEM_LOCKED'), message는 그대로 보여 줘도 된다.
 * 입력값 오류(VALIDATION_ERROR)는 errors에 필드별 메시지가 있다.
 */
export class ApiError extends Error {
  /**
   * @param {number} status HTTP 상태 코드. 서버에 닿지 못하면 0
   * @param {object} [body] 응답 본문 {code, message, errors, ...}
   */
  constructor(status, body = {}) {
    super(body.message ?? '요청을 처리하지 못했어요.')
    this.name = 'ApiError'
    this.status = status
    this.code = body.code ?? (status === 0 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR')
    this.errors = body.errors ?? null
    this.body = body
  }
}

// 명세 경로는 모두 /로 끝난다. 값이 없는 query는 보내지 않는다.
function buildUrl(path, query) {
  const params = new URLSearchParams()
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.append(key, String(value))
  })
  const queryString = params.toString()
  return `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`
}

// 갱신 요청은 동시에 여러 번 보내지 않고 하나를 같이 기다린다(refresh 토큰은 한 번 쓰면 새로 나온다).
let refreshing = null

async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) return false
  if (!refreshing) {
    refreshing = fetch(buildUrl('/api/auth/token/refresh/'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async (response) => {
        const data = response.ok ? await response.json().catch(() => null) : null
        if (!data?.access) {
          clearTokens()
          return false
        }
        setTokens({ access: data.access, refresh: data.refresh })
        return true
      })
      .catch(() => false) // 네트워크 문제는 토큰을 지우지 않고 원래 요청이 실패하게 둔다.
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

async function send(path, { method, query, json, formData, auth }) {
  const headers = { Accept: 'application/json' }
  const token = auth ? getAccessToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let body
  if (formData) {
    body = formData // Content-Type은 브라우저가 경계값과 함께 정한다.
  } else if (json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  }

  try {
    return await fetch(buildUrl(path, query), { method, headers, body })
  } catch {
    throw new ApiError(0, { message: '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.' })
  }
}

/**
 * @param {string} path '/api/letters/materials/'처럼 /로 끝나는 경로
 * @param {{ method?: string, query?: object, json?: object, formData?: FormData, auth?: boolean }} [options]
 *   auth: false면 토큰을 붙이지 않는다(로그인·가입처럼 인증이 필요 없는 요청). 기본은 true.
 * @returns {Promise<any>} 응답 JSON. 204면 null
 * @throws {ApiError}
 */
export async function request(path, { method = 'GET', query, json, formData, auth = true } = {}) {
  let response = await send(path, { method, query, json, formData, auth })

  // 토큰이 만료됐으면 한 번만 갱신해서 다시 보낸다. formData는 한 번 보내도 다시 읽을 수 있다.
  if (auth && response.status === 401) {
    const data = await response.clone().json().catch(() => null)
    if (data?.code === 'TOKEN_NOT_VALID' && (await refreshAccessToken())) {
      response = await send(path, { method, query, json, formData, auth })
    }
  }

  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, data ?? {})
  return data
}
