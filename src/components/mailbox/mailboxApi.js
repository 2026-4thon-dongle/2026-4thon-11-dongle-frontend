// 우체통 목록 요청(api/mailbox.md). 기본은 서버 호출이고, VITE_API_MOCK=true(개발 전용)일 때만 mailboxDemo.js의 mock을 쓴다.
// 실패하면 mock으로 채우지 않고 ApiError(shared/api/client.js)를 그대로 던진다. 화면이 에러 UI로 보여 준다.
// 반환값은 항상 mailboxMapper의 화면용 데이터({ items, count, hasNext })이다.
import { isApiDemo, request } from '../../shared/api/client.js'
import { fetchDemoMailboxLetters, fetchDemoMailboxSummary } from './mailboxDemo.js'
import { toMailboxPage } from './mailboxMapper.js'
import { isReportedLetter } from './letterReceiveApi.js'

const TAB_PATH = {
  new: '/api/mailbox/new/',
  chatting: '/api/mailbox/conversations/',
  shipping: '/api/mailbox/in-transit/',
  stored: '/api/mailbox/archive/',
}

/**
 * 탭별 목록 한 페이지. 페이지당 20개이고 다음 페이지가 있으면 hasNext가 true이다.
 * @param {'new'|'chatting'|'shipping'|'stored'} tab
 * @param {{ sort?: 'latest'|'oldest'|'unread', sido?: number|string|null, page?: number, empty?: boolean }} [options]
 *   sort: 새 편지 탭만 쓴다(서버 ordering). 배송 중은 서버가 도착 임박순으로, 대화 중·보관은 서버 정렬 그대로 준다.
 *   sido: 새 편지 탭만 쓴다. 보낸 사람 출발 지역의 시·도 id(GET /api/regions/ 최상위 id)로 서버가 거른다. 없으면 전체.
 *   empty: mock 모드에서만 쓴다(비었을 때 화면 확인용).
 * @returns {Promise<{ items: object[], count: number, hasNext: boolean }>}
 */
export async function fetchMailboxLetters(tab, { sort = 'latest', sido = null, page = 1, empty = false } = {}) {
  if (isApiDemo) {
    const result = await fetchDemoMailboxLetters(tab, { sort, sido, empty })
    const items = result.items.filter((item) => {
      if (tab === 'new') return !isReportedLetter(item.id)
      if (tab === 'stored' && item.path?.startsWith('/mailbox/')) return !isReportedLetter(item.path.split('/').at(-1))
      return true
    })
    return { ...result, items, count: items.length }
  }
  const data = await request(TAB_PATH[tab] ?? TAB_PATH.new, {
    query: { page, ordering: tab === 'new' ? sort : undefined, sido: tab === 'new' ? (sido ?? undefined) : undefined },
  })
  const results = (data.results ?? []).filter((item) => {
    if (tab === 'new') return !isReportedLetter(item.id)
    if (tab === 'stored' && item.kind === 'passed_letter') return !isReportedLetter(item.letter_id)
    return true
  })
  return toMailboxPage(tab, { ...data, results })
}

/**
 * 탭 옆 빨간 점 등 요약(GET /api/mailbox/summary/). 필터·페이지와 상관없이 전체 기준이다.
 * @returns {Promise<{ hasUnread: boolean, newCount: number, myTurnCount: number, inTransitCount: number }>}
 */
export async function fetchMailboxSummary({ empty = false } = {}) {
  if (isApiDemo) return fetchDemoMailboxSummary({ empty })
  const data = await request('/api/mailbox/summary/')
  return {
    hasUnread: data.new_unread_count > 0,
    newCount: data.new_count,
    myTurnCount: data.my_turn_count,
    inTransitCount: data.in_transit_count,
  }
}
