// 우체통 목록 요청. mock, 문서 레포 API 확정 전, Notion 초안 참고.
// 지금은 shared/mocks/mailbox.js를 돌려주고, API가 확정되면 이 함수 안에서 서버를 호출한다.
// 반환값은 항상 mailboxMapper의 화면용 데이터({ items, nextCursor, hasNext })이다.
import { getMockMailboxResponse } from '../../shared/mocks/mailbox.js'
import { toMailboxPage } from './mailboxMapper.js'

/**
 * @param {'new'|'chatting'|'shipping'|'stored'} tab
 * @param {{ sort?: 'latest'|'oldest'|'unread', empty?: boolean }} [options]
 */
export async function fetchMailboxLetters(tab, options) {
  const response = getMockMailboxResponse(tab, options)
  return toMailboxPage(tab, response)
}
