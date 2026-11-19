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
    // mock에는 보낸 사람 id가 없어 편지 id로 만든다(신고·차단 mock에만 쓴다)
    sender: { id: 9000 + raw.id, nickname: raw.sender_nickname },
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

const DEMO_SENT_LETTER_ID = 901
const DEMO_SENT_LETTER = {
  id: DEMO_SENT_LETTER_ID,
  conversation_id: 1,
  is_first: true,
  direction: 'sent',
  sender: { id: 1, nickname: MOCK_MY_NICKNAME },
  sender_nickname: MOCK_MY_NICKNAME,
  recipient: { id: 9101, nickname: '하늘빛' },
  recipient_nickname: '하늘빛',
  from_region: regionOf('서울 성북'),
  to_region: regionOf('충남 천안'),
  body: '그 호수, 제가 고등학생 때 매일 지나던 곳이에요.\n붕어빵 트럭이 돌아왔다니 반가워요!',
  stationery: 'basic',
  font: 'nanum-pen',
  signature: null,
  stickers: [],
  stamp: { code: 'first-diary', name: '첫 일기' },
  sent_at: '2026-10-30T21:30:00+09:00',
  arrived_at: '2026-10-31T03:30:00+09:00',
  duration_minutes: 360,
  is_read: false,
  can_reply: false,
  can_pass: false,
}

export async function fetchDemoLetterDetail(letterId) {
  if (Number(letterId) === DEMO_SENT_LETTER_ID) return toLetterDetail(DEMO_SENT_LETTER)
  const raw = MOCK_LETTER_DETAILS[letterId]
  if (!raw || passedAt.has(raw.id)) return null
  return toLetterDetail(toServerShape(raw))
}

export async function openDemoLetter(letterId) {
  readIds.add(Number(letterId))
  return fetchDemoLetterDetail(letterId)
}

/** 답장하기를 누르는 순간 대화 중 탭으로 옮긴다(mock은 실제 발송 시점을 알 수 없다). 실제 서버는 답장 발송이 끝나면 옮긴다. */
export async function markDemoLetterReplied(letterId) {
  repliedIds.add(Number(letterId))
}

export async function passDemoLetter(letterId) {
  passedAt.set(Number(letterId), new Date().toISOString())
}

export async function reportDemoLetter({ block }) {
  return { id: Date.now(), blocked: Boolean(block) }
}

export async function blockDemoSender() {}
