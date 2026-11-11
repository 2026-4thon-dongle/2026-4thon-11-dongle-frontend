// 우체통 목록 요청. mock, 문서 레포 API 확정 전, Notion 초안 참고.
// 지금은 shared/mocks/mailbox.js를 돌려주고, API가 확정되면 이 함수 안에서 서버를 호출한다.
// 반환값은 항상 mailboxMapper의 화면용 데이터({ items, nextCursor, hasNext })이다.
import { getMockMailboxResponse } from '../../shared/mocks/mailbox.js'
import { toMailboxPage, listProvinces } from './mailboxMapper.js'

/**
 * @param {'new'|'chatting'|'shipping'|'stored'} tab
 * @param {{ sort?: 'latest'|'oldest'|'unread', region?: string|null, empty?: boolean }} [options]
 *   region: 보낸 사람 시·도("전북"). 새 편지 탭에서만 쓰고, 없으면 전체이다.
 * @returns 새 편지 탭은 { items, nextCursor, hasNext, regions, hasUnread }를 돌려준다.
 *   - regions: 필터를 걸기 전 전체 목록에 있는 시·도(드롭다운 목록)
 *   - hasUnread: 필터와 상관없이 읽지 않은 편지가 있는지(탭 옆 빨간 점)
 */
export async function fetchMailboxLetters(tab, options = {}) {
  const { region = null, ...mockOptions } = options
  const page = toMailboxPage(tab, getMockMailboxResponse(tab, mockOptions))
  if (tab !== 'new') return page

  // mock 전용: 서버가 지역 필터를 받으면 이 걸러내기는 서버 파라미터로 바꾸고,
  // regions·hasUnread는 서버가 따로 주는 값을 쓴다(필터가 걸린 결과로는 계산할 수 없다).
  const all = page.items
  return {
    ...page,
    items: region ? all.filter((item) => item.province === region) : all,
    regions: listProvinces(all),
    hasUnread: all.some((item) => !item.isRead),
  }
}
