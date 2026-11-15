// 받은 편지 상세 요청(5-8, 5-9). mock, 문서 레포 API 확정 전.
// 지금은 shared/mocks/letterDetail.js를 돌려준다. 문서 레포 `api/`에 편지 API가 없어 요청 주소를 정하지 않았다.
// 명세 초안(spec/mail.md)의 동작만 흉내 낸다.
//   MAIL-05 읽음: 봉투를 열면(상세를 처음 조회하면) 읽음 처리. 읽음은 상대에게 보이지 않는다.
//   MAIL-04 넘기기: 첫 편지를 보관으로 옮긴다. 상대에게 알리지 않는다.
// 읽음·답장·넘김 상태는 mailboxMockStore.js(mock 전용)에 두고 우체통 목록(mailboxApi.js)이 같이 쓴다.
// 반환값은 항상 letterReceiveMapper의 화면용 데이터이다.
import { MOCK_LETTER_DETAILS, MOCK_MY_NICKNAME } from '../../shared/mocks/letterDetail.js'
import { toLetterArrival, toLetterView } from './letterReceiveMapper.js'
import { readIds, repliedIds, passedAt } from './mailboxMockStore.js'

/** 편지 상세. 없는 편지면 null. */
export async function fetchLetterDetail(letterId) {
  const raw = MOCK_LETTER_DETAILS[letterId]
  if (!raw || passedAt.has(raw.id)) return null
  const current = { ...raw, is_read: raw.is_read || readIds.has(raw.id) }
  return {
    arrival: toLetterArrival(current, MOCK_MY_NICKNAME),
    view: toLetterView(current),
  }
}

/**
 * 읽음 처리(5-8 "봉투 열기"). 실제 서버는 호출하지 않는다.
 * 실제 API: 편지 상세 조회나 읽음 요청을 여기서 보낸다. 읽은 편지는 새 편지 탭에 남되 빨간 점(is_read)만 사라진다.
 */
export async function markLetterRead(letterId) {
  readIds.add(Number(letterId))
}

/**
 * 답장 처리(5-9 "답장하기"). 새 편지 탭에서 빠지고 대화 중 탭으로 옮긴다. 실제 서버는 호출하지 않는다.
 * mock 전용 단순화: 답장 편지를 실제로 보내는 시점(편지 쓰기 흐름의 끝)을 알 수 없어 "답장하기"를 누르는 순간 옮긴다.
 * 실제 API: 이 함수는 필요 없다. 서버가 답장 발송이 끝나면 그 편지를 대화 중으로 옮기고 우체통 목록에 반영한다.
 */
export async function markLetterReplied(letterId) {
  repliedIds.add(Number(letterId))
}

/**
 * 넘기기(5-9). 새 편지 탭에서 빠지고 보관 탭으로 옮긴다. 실제 서버는 호출하지 않는다.
 * 실제 API: 넘기기 요청을 여기서 보낸다. 보관 목록은 서버가 준다.
 */
export async function passLetter(letterId) {
  passedAt.set(Number(letterId), new Date().toISOString())
}
