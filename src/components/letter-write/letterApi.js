// 편지 쓰기·발송 API 요청 함수. 명세: 문서 레포 api/letters.md, api/common.md
//   GET  /api/letters/materials/        편지지·글씨체·스티커·우표 목록
//   GET  /api/letters/estimate/         배송 시간 계산
//   POST /api/letters/                  편지 발송
//   GET  /api/letters/{id}/route/       배송 경로
//   GET·POST /api/letters/drafts/, GET·DELETE /api/letters/drafts/{id}/   임시저장
// 화면은 이 함수들의 반환값을 그대로 받는 쪽(서버 응답, snake_case)이다.

import { ApiError, request } from '../../shared/api/client.js'

// 서버 주소·토큰·요청·에러는 shared/api/client.js가 맡는다. 에러 이름은 기존 코드가 쓰던 LetterApiError를 그대로 둔다.
export { ApiError as LetterApiError }

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

// ── 답장하는 일기 (api/feed.md) ──

/**
 * 답장하는 일기 하나(피드 상세). 편지 쓰기 첫 화면(4-1)의 「Re. 닉네임님의 고향 일기」 배너에 쓴다.
 * 내 일기도 볼 수 있고, 차단·숨김·공개 범위 때문에 볼 수 없으면 404 NOT_FOUND이다.
 * @param {number|string} diaryId
 * @returns {Promise<{ id: number, author: { id: number, nickname: string }, region: object, body: string,
 *   can_reply: boolean, reply_block_reason: string|null, delivery: object|null, my_draft: object|null }>}
 */
export function fetchFeedDiary(diaryId) {
  return request(`/api/feed/diaries/${diaryId}/`)
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
