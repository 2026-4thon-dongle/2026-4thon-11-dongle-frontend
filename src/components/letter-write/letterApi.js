// 편지 쓰기·발송 API 요청 함수. 명세: 문서 레포 api/letters.md, api/common.md
//   GET  /api/letters/materials/        편지지·글씨체·스티커·우표 목록
//   GET  /api/letters/estimate/         배송 시간 계산
//   POST /api/letters/                  편지 발송
//   GET  /api/letters/{id}/route/       배송 경로
//   GET·POST /api/letters/drafts/, GET·DELETE /api/letters/drafts/{id}/   임시저장
// 아직 화면에 연결하지 않았다. 화면은 이 함수들의 반환값을 그대로 받는 쪽(서버 응답, snake_case)이다.
// 공통 호출 기반(shared/api)이 정해지면 request()와 토큰 읽기만 그쪽으로 옮긴다.

// 서버 주소. 없으면 로컬 백엔드(runserver 기본 포트)를 쓴다.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')

/**
 * 요청에 붙일 access 토큰. 로그인이 실제 API로 붙기 전까지는 개발용 환경변수(.env, 커밋 금지)에서 읽는다.
 * 로그인 연동이 생기면 이 함수 안만 바꾼다.
 */
function getAccessToken() {
  return import.meta.env.VITE_DEV_ACCESS_TOKEN ?? null
}

/**
 * 서버가 준 에러. 명세의 에러 형식 {code, message, ...추가 필드}를 그대로 담는다.
 * code로 분기하고(예: 'ITEM_LOCKED'), message는 그대로 보여 줘도 된다.
 * 입력값 오류(VALIDATION_ERROR)는 errors에 필드별 메시지가 있다.
 */
export class LetterApiError extends Error {
  /**
   * @param {number} status HTTP 상태 코드. 서버에 닿지 못하면 0
   * @param {object} [body] 응답 본문 {code, message, errors, ...}
   */
  constructor(status, body = {}) {
    super(body.message ?? '요청을 처리하지 못했어요.')
    this.name = 'LetterApiError'
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

/**
 * @param {string} path '/api/letters/materials/'처럼 /로 끝나는 경로
 * @param {{ method?: string, query?: object, json?: object, formData?: FormData }} [options]
 *   formData를 주면 multipart로 보낸다(Content-Type은 브라우저가 경계값과 함께 정한다).
 * @returns {Promise<any>} 응답 JSON. 204면 null
 */
async function request(path, { method = 'GET', query, json, formData } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let body
  if (formData) {
    body = formData
  } else if (json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  }

  let response
  try {
    response = await fetch(buildUrl(path, query), { method, headers, body })
  } catch {
    throw new LetterApiError(0, { message: '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.' })
  }

  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new LetterApiError(response.status, data ?? {})
  return data
}

// ── 편지 쓰기 재료 · 배송 시간 ──

/**
 * 고를 수 있는 편지지·글씨체·스티커와 내가 가진 우표 (LETTER-01, 03, 05, 06).
 * @returns {Promise<{ stationeries: object[], fonts: object[], stickers: object[], stamps: object[] }>}
 *   stationeries·fonts·stickers 각 항목: { code, name, unlocked, unlock_condition } (편지지는 is_new도 있다)
 *   stamps 각 항목: { code, number, name, kind }
 */
export function fetchLetterMaterials() {
  return request('/api/letters/materials/')
}

/**
 * 지금 보내면 걸리는 시간 (LETTER-07). diaryId와 replyTo 중 하나만 준다.
 * @param {{ diaryId?: number, replyTo?: number }} target
 * @returns {Promise<{ from_region: object, to_region: object, band: string, duration_minutes: number, arrives_at: string }>}
 */
export function fetchLetterEstimate({ diaryId, replyTo }) {
  return request('/api/letters/estimate/', { query: { diary_id: diaryId, reply_to: replyTo } })
}

// ── 발송 ──

/**
 * 편지를 보낸다 (LETTER-06). 보낸 뒤에는 취소·수정할 수 없다.
 * 서명 이미지가 선택 항목이라 항상 multipart로 보낸다(명세: 서명이 없을 때는 JSON도 가능).
 * 에러는 LetterApiError로 던진다. 자주 쓰는 code: ITEM_LOCKED, OWN_DIARY, LETTERS_OFF,
 * RECIPIENT_PAUSED, BLOCKED, ALREADY_SENT, ALREADY_REPLIED, NOT_ARRIVED, CONVERSATION_CLOSED, VALIDATION_ERROR.
 *
 * @param {object} letter
 * @param {number} [letter.diaryId] 첫 편지를 보낼 일기 (replyTo와 둘 중 하나)
 * @param {number} [letter.replyTo] 답장할 받은 편지 id (diaryId와 둘 중 하나)
 * @param {string} letter.body 공백을 뺀 1~1000자
 * @param {string} letter.stationery 편지지 code
 * @param {string} [letter.font] 글씨체 code. 없으면 서버 기본값
 * @param {string} letter.stamp 우표 code
 * @param {File|null} [letter.signature] 서명 PNG (letterPayload.js의 buildSignatureParts)
 * @param {string|null} [letter.stickers] 스티커 JSON 문자열 (letterPayload.js의 buildSignatureParts)
 * @param {number} [letter.draftId] 이어 쓴 임시저장 id. 보내면 서버가 지운다
 * @returns {Promise<{ id: number, conversation_id: number, is_first: boolean, recipient: object, from_region: object,
 *   to_region: object, band: string, duration_minutes: number, sent_at: string, arrives_at: string, stamp: object,
 *   granted_stamps: object[], unlocked_rewards: object[] }>}
 */
export function sendLetter({ diaryId, replyTo, body, stationery, font, stamp, signature, stickers, draftId }) {
  const formData = new FormData()
  const append = (name, value) => {
    if (value !== undefined && value !== null && value !== '') formData.append(name, value)
  }
  append('diary_id', diaryId)
  append('reply_to', replyTo)
  append('body', body)
  append('stationery', stationery)
  append('font', font)
  append('stamp', stamp)
  append('stickers', stickers)
  append('draft_id', draftId)
  if (signature) formData.append('signature', signature, signature.name)
  return request('/api/letters/', { method: 'POST', formData })
}

// ── 배송 경로 ──

/**
 * 실시간 배송 지도용 경로 (LETTER-10). 보낸 사람과 받는 사람 모두 볼 수 있다.
 * 현재 위치와 남은 시간은 sent_at, arrives_at으로 화면이 계산한다.
 * @param {number} letterId
 * @returns {Promise<{ direction: 'sent'|'incoming', partner: object, from_region: object, to_region: object,
 *   sent_at: string, arrives_at: string, map_theme: string, waypoints: object[] }>}
 */
export function fetchLetterRoute(letterId) {
  return request(`/api/letters/${letterId}/route/`)
}

// ── 우표 목록 (api/stamps.md). 우표 선택(4-6)의 잠금 우표 칸에 쓴다. ──

/**
 * 우표 목록과 보유 여부 (STAMP-02). 전체 우표에 owned(보유 여부)가 붙어 온다.
 * @param {'achievement'|'decoration'} [kind] 없으면 전부
 * @returns {Promise<{ owned_count: number, total_count: number, stamps: Array<{ code: string, number: number, name: string,
 *   kind: string, owned: boolean }> }>}
 */
export function fetchStampList(kind) {
  return request('/api/stamps/', { query: { kind } })
}

// ── 임시저장 (LETTER-11). 서명·스티커·우표는 저장하지 않는다(명세, 가정). ──

/**
 * 내 임시저장 목록, 최신순 (7-3). 페이지당 20개.
 * @param {number} [page]
 * @returns {Promise<{ count: number, next: string|null, previous: string|null, results: object[] }>}
 *   results 각 항목: { id, kind('first'|'reply'), diary_id, reply_to, recipient, body_preview, body_length, saved_at }
 */
export function fetchLetterDrafts(page) {
  return request('/api/letters/drafts/', { query: { page } })
}

/**
 * 임시저장. 같은 대상(일기 또는 받은 편지)에 다시 저장하면 덮어쓴다(응답 200, 새로 만들면 201).
 * @param {{ diaryId?: number, replyTo?: number, body?: string, stationery?: string, font?: string }} draft
 * @returns {Promise<{ id: number, kind: string, diary_id: number|null, reply_to: number|null, body: string,
 *   stationery: string, font: string, saved_at: string }>}
 */
export function saveLetterDraft({ diaryId, replyTo, body, stationery, font }) {
  const json = {}
  if (diaryId !== undefined && diaryId !== null) json.diary_id = diaryId
  if (replyTo !== undefined && replyTo !== null) json.reply_to = replyTo
  if (body !== undefined) json.body = body
  if (stationery !== undefined) json.stationery = stationery
  if (font !== undefined) json.font = font
  return request('/api/letters/drafts/', { method: 'POST', json })
}

/**
 * 임시저장 하나를 전부 받는다(이어 쓰기 4-9, 7-3).
 * @param {number} draftId
 */
export function fetchLetterDraft(draftId) {
  return request(`/api/letters/drafts/${draftId}/`)
}

/**
 * 임시저장을 지운다(7-3 휴지통, 4-8 「저장 안 함」, 4-9 「새로 쓰기」). 성공하면 null.
 * @param {number} draftId
 */
export function deleteLetterDraft(draftId) {
  return request(`/api/letters/drafts/${draftId}/`, { method: 'DELETE' })
}
