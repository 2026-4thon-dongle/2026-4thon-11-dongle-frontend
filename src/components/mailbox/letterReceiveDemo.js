// 받은 편지 상세 mock 모드(VITE_API_MOCK=true, 개발 전용). 서버 호출은 letterReceiveApi.js가 한다.
// shared/mocks/letterDetail.js의 옛 mock 모양을 서버 응답 모양(GET /api/letters/{id}/)으로 바꿔 mapper에 넘긴다.
// 읽음·답장·넘김 상태는 mailboxMockStore.js(메모리)에 두고 우체통 목록 mock(mailboxDemo.js)이 같이 쓴다.
// mock에는 서명 이미지·편지지·글씨체·스티커가 없어 서명은 안 나오고 편지지는 기본, 글씨체는 나눔손글씨 펜이다.
import { MOCK_LETTER_DETAILS, MOCK_MY_NICKNAME } from '../../shared/mocks/letterDetail.js'
import { getMockMailboxResponse } from '../../shared/mocks/mailbox.js'
import { toLetterDetail } from './letterReceiveMapper.js'
import { regionOf } from './mailboxDemo.js'
import { readIds, repliedIds, passedAt } from './mailboxMockStore.js'

// 편지 상세 mock에는 보낸 날짜가 없어(shared는 고치지 않는다) 우체통 목록 mock의 도착 시각에서
// 배송 시간(travel_minutes)을 빼 보낸 시각(sent_at)을 만든다. 5-9 소인 날짜에 쓴다.
function sentAtOf(raw) {
  const arrived = getMockMailboxResponse('new').results.find((letter) => letter.id === raw.id)?.arrived_at
  const time = new Date(arrived).getTime()
  if (!arrived || Number.isNaN(time) || !Number.isFinite(raw.travel_minutes)) return undefined
  return new Date(time - raw.travel_minutes * 60000).toISOString()
}

function toServerShape(raw) {
  return {
    id: raw.id,
    conversation_id: null,
    is_first: raw.is_first_letter,
    direction: 'received',
    sender_nickname: raw.sender_nickname,
    recipient_nickname: MOCK_MY_NICKNAME,
    from_region: regionOf(raw.sender_region),
    to_region: regionOf(raw.receiver_region),
    body: raw.body,
    stationery: 'basic',
    font: 'nanum-pen',
    signature: null,
    stickers: [],
    stamp: raw.stamp,
    sent_at: raw.sent_at ?? sentAtOf(raw),
    arrived_at: null,
    duration_minutes: raw.travel_minutes,
    is_read: raw.is_read || readIds.has(raw.id),
    can_reply: true,
    can_pass: Boolean(raw.is_first_letter),
  }
}

/** 편지 상세. 없는 편지(넘긴 편지 포함)면 null. */
export async function fetchDemoLetterDetail(letterId) {
  const raw = MOCK_LETTER_DETAILS[letterId]
  if (!raw || passedAt.has(raw.id)) return null
  return toLetterDetail(toServerShape(raw))
}

/** 읽음 처리(5-8 "봉투 열기"). 읽은 편지는 새 편지 탭에 남되 빨간 점만 사라진다. */
export async function openDemoLetter(letterId) {
  readIds.add(Number(letterId))
  return fetchDemoLetterDetail(letterId)
}

/** 답장하기를 누르는 순간 대화 중 탭으로 옮긴다(mock은 실제 발송 시점을 알 수 없다). 실제 서버는 답장 발송이 끝나면 옮긴다. */
export async function markDemoLetterReplied(letterId) {
  repliedIds.add(Number(letterId))
}

/** 넘기기: 새 편지 탭에서 빠지고 보관 탭으로 옮긴다. */
export async function passDemoLetter(letterId) {
  passedAt.set(Number(letterId), new Date().toISOString())
}
