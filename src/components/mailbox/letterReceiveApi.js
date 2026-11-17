// 받은 편지 상세 요청(5-8, 5-9, api/mailbox.md). 기본은 서버 호출이고, VITE_API_MOCK=true(개발 전용)일 때만 letterReceiveDemo.js의 mock을 쓴다.
// 실패하면 mock으로 채우지 않고 ApiError(shared/api/client.js)를 그대로 던진다. 화면이 에러 UI로 보여 준다.
//   GET  /api/letters/{id}/        상세(읽음 처리 안 함). 403 NOT_ARRIVED(아직 도착 전), 404 NOT_FOUND
//   POST /api/letters/{id}/open/   봉투 열기. 읽음 처리하고 같은 상세를 돌려준다
//   POST /api/letters/{id}/pass/   넘기기(204). 409 NOT_PASSABLE(첫 편지가 아니거나 이미 답장함)
//   POST /api/reports/             편지 신고(target_type letter, api/safety.md). 받아서 도착한 편지만. block_user면 보낸 사람도 차단
//   POST /api/blocks/              보낸 사람 차단(api/safety.md)
// 읽음은 상대에게 보이지 않고, 넘기기는 상대에게 알리지 않는다.
// 상세 요청의 반환값은 letterReceiveMapper의 화면용 데이터이다.
import { ApiError, isApiDemo, request } from '../../shared/api/client.js'
import { toLetterDetail } from './letterReceiveMapper.js'
import {
  blockDemoSender,
  fetchDemoLetterDetail,
  markDemoLetterReplied,
  openDemoLetter,
  passDemoLetter,
  reportDemoLetter,
} from './letterReceiveDemo.js'

const letterPath = (letterId) => `/api/letters/${encodeURIComponent(letterId)}/`

/**
 * 편지 상세. 없는 편지(404)면 null.
 * 아직 도착하지 않은 편지(403 NOT_ARRIVED)와 그 밖의 실패는 ApiError를 던진다.
 * @returns {Promise<{ arrival: object, view: object, needsOpen: boolean } | null>}
 */
export async function fetchLetterDetail(letterId) {
  if (isApiDemo) return fetchDemoLetterDetail(letterId)
  try {
    return toLetterDetail(await request(letterPath(letterId)))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** 봉투 열기(5-8). 읽음 처리하고 편지 상세를 돌려준다. */
export async function openLetter(letterId) {
  if (isApiDemo) return openDemoLetter(letterId)
  return toLetterDetail(await request(`${letterPath(letterId)}open/`, { method: 'POST' }))
}

/** 넘기기(5-9). 새 편지 탭에서 빠지고 보관으로 옮겨진다. */
export async function passLetter(letterId) {
  if (isApiDemo) return passDemoLetter(letterId)
  await request(`${letterPath(letterId)}pass/`, { method: 'POST' })
}

/**
 * 답장하기(5-9)를 누른 때. 서버는 답장 편지를 보낼 때 그 편지를 대화 중으로 옮기므로 실제로는 아무것도 하지 않는다.
 * mock 모드에서만 대화 중 탭으로 옮긴다.
 */
export async function markLetterReplied(letterId) {
  if (isApiDemo) await markDemoLetterReplied(letterId)
}

/**
 * 편지 신고(5-9 → 3-7 시트). reason은 서버 코드(shared/ui/reportReasons.js), 기타(etc)면 details가 필요하다(200자 이하).
 * @returns {Promise<{ id: number, blocked: boolean }>} blocked: 보낸 사람도 함께 차단했는지
 */
export async function reportLetter({ letterId, reason, details, block }) {
  if (isApiDemo) return reportDemoLetter({ letterId, reason, details, block })
  return request('/api/reports/', {
    method: 'POST',
    json: { target_type: 'letter', target_id: Number(letterId), reason, detail: details.trim(), block_user: block },
  })
}

/** 보낸 사람 차단(5-9 → 3-8 팝업). 차단하면 서로의 일기와 편지가 보이지 않는다. */
export async function blockLetterSender(userId) {
  if (isApiDemo) return blockDemoSender(userId)
  await request('/api/blocks/', { method: 'POST', json: { user_id: Number(userId) } })
}
