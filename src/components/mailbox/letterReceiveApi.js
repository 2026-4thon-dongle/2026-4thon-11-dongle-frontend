// 받은 편지 상세 요청(5-8, 5-9). mock, 문서 레포 API 확정 전.
// 지금은 shared/mocks/letterDetail.js를 돌려준다. 문서 레포 `api/`에 편지 API가 없어 요청 주소를 정하지 않았다.
// 명세 초안(spec/mail.md)의 동작만 흉내 낸다.
//   MAIL-05 읽음: 봉투를 열면(상세를 처음 조회하면) 읽음 처리. 읽음은 상대에게 보이지 않는다.
//   MAIL-04 넘기기: 첫 편지를 보관으로 옮긴다. 상대에게 알리지 않는다.
// 반환값은 항상 letterReceiveMapper의 화면용 데이터이다.
import { MOCK_LETTER_DETAILS, MOCK_MY_NICKNAME } from '../../shared/mocks/letterDetail.js'
import { toLetterArrival, toLetterView } from './letterReceiveMapper.js'

// 이번 접속에서 읽음·넘김 처리한 편지 id. 우체통 목록 mock(shared/mocks/mailbox.js)에는 반영되지 않는다. mock 전용.
const readIds = new Set()
const passedIds = new Set()

/** 편지 상세. 없는 편지면 null. */
export async function fetchLetterDetail(letterId) {
  const raw = MOCK_LETTER_DETAILS[letterId]
  if (!raw || passedIds.has(raw.id)) return null
  const current = { ...raw, is_read: raw.is_read || readIds.has(raw.id) }
  return {
    arrival: toLetterArrival(current, MOCK_MY_NICKNAME),
    view: toLetterView(current),
  }
}

/** 읽음 처리(5-8 "봉투 열기"). 실제 서버는 호출하지 않는다. */
export async function markLetterRead(letterId) {
  readIds.add(Number(letterId))
}

/** 넘기기(5-9). 보관으로 옮긴다. 실제 서버는 호출하지 않는다. */
export async function passLetter(letterId) {
  passedIds.add(Number(letterId))
}
