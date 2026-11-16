// 직접 배달 게임 API (9-1, 9-2). 명세: 문서 레포 api/game.md
//   GET  /api/game/                    규칙, 오늘 남은 판수, 내 기록, 우표 목표, 게임할 수 있는 편지
//   GET  /api/game/letters/{id}/       편지 하나의 게임 상태
//   POST /api/game/runs/               판 시작(코스를 받는다). letter_id가 없으면 연습
//   POST /api/game/runs/{id}/finish/   결과 보내기 → 별, 단축 시간, 받은 우표
// 시간 값은 모두 초 단위다. 화면은 이 함수들의 반환값(서버 응답, snake_case)을 그대로 쓴다.
// VITE_API_MOCK=true(개발 전용)일 때만 gameDemo.js의 가짜 서버를 쓴다.

import { isApiDemo, request } from '../../shared/api/client.js'
import * as demo from './gameDemo.js'

/** 게임 홈. letters[].game.playable로 배달할 수 있는 편지를 고른다. */
export function fetchGameHome() {
  if (isApiDemo) return demo.fetchGameHome()
  return request('/api/game/')
}

/**
 * 편지 하나의 게임 상태. 배송 중 목록에 없는 편지(이미 도착 등)의 이유를 볼 때 쓴다.
 * @param {number|string} letterId
 */
export function fetchLetterGame(letterId) {
  if (isApiDemo) return demo.fetchLetterGame(letterId)
  return request(`/api/game/letters/${letterId}/`)
}

/**
 * 판을 시작한다. 끝내지 않은 이전 판은 서버에서 무효가 된다.
 * 에러 code: LETTER_ARRIVED, ARRIVING_SOON, PLAY_LIMIT, REDUCE_LIMIT(409), DAILY_LIMIT(429), NOT_FOUND(404)
 * @param {number|string|null} letterId 없으면 연습
 * @returns {Promise<{ id: number, letter_id: number|null, practice: boolean, run_seconds: number, lanes: number,
 *   course: Array<{ kind: 'piece'|'puddle', lane: number, t: number }>, piece_total: number, puddle_total: number,
 *   expires_at: string, reducible_seconds: number, today_remaining: number }>}
 */
export function startRun(letterId) {
  const json = letterId ? { letter_id: Number(letterId) } : {}
  if (isApiDemo) return demo.startRun(json)
  return request('/api/game/runs/', { method: 'POST', json })
}

/**
 * 결과를 보낸다. 시작 25초 뒤부터 3분 안에 보내야 한다.
 * 에러 code: RUN_TOO_FAST, VALIDATION_ERROR(400), RUN_FINISHED, RUN_EXPIRED(409)
 * @param {number} runId
 * @param {{ pieces: number, hits: number }} result
 */
export function finishRun(runId, { pieces, hits }) {
  if (isApiDemo) return demo.finishRun(runId, { pieces, hits })
  return request(`/api/game/runs/${runId}/finish/`, { method: 'POST', json: { pieces, hits } })
}
