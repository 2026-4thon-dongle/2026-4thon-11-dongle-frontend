// 펜팔 요청(5-14, 5-15, api/mailbox.md). 기본은 서버 호출이고, VITE_API_MOCK=true(개발 전용)일 때만 penPalDemo.js의 mock을 쓴다.
// 실패하면 mock으로 채우지 않고 ApiError(shared/api/client.js)를 그대로 던진다. 화면이 에러 UI로 보여 준다.
//   GET /api/penpals/                       펜팔 친구 목록(5-14). 페이지당 20개
//   GET /api/mailbox/conversations/{id}/    대화의 주고받은 편지(5-15). id는 대화 id(conversation_id)
// 반환값은 항상 penPalMapper의 화면용 데이터이다.
import { ApiError, isApiDemo, request } from '../../shared/api/client.js'
import { fetchDemoPenPalLetters, fetchDemoPenPals } from './penPalDemo.js'
import { toPenPalList, toPenPalLetters } from './penPalMapper.js'

/**
 * 펜팔 친구 목록 한 페이지.
 * @param {{ page?: number, empty?: boolean }} [options] empty: mock 모드에서만 쓴다(펜팔 친구가 없는 상태 확인용)
 * @returns {Promise<{ items: object[], hasNext: boolean }>}
 */
export async function fetchPenPals({ page = 1, empty = false } = {}) {
  if (isApiDemo) return fetchDemoPenPals({ empty })
  return toPenPalList(await request('/api/penpals/', { query: { page } }))
}

/** 대화의 주고받은 편지. 내 대화가 아니거나 없으면(404) null. */
export async function fetchPenPalLetters(conversationId) {
  if (isApiDemo) return fetchDemoPenPalLetters(conversationId)
  try {
    return toPenPalLetters(await request(`/api/mailbox/conversations/${encodeURIComponent(conversationId)}/`))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}
