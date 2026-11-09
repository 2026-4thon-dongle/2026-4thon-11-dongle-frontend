// 우체통 목록 변환 함수. 서버(지금은 mock) 응답 → 화면용 데이터.
// mock, 문서 레포 API 확정 전, Notion 초안 참고.
// 화면과 컴포넌트는 서버 필드 이름을 직접 쓰지 않고 이 파일의 결과만 쓴다.
// 문서 레포에 편지 API가 확정돼 필드나 페이지네이션이 바뀌면 이 파일만 고친다.

const DATE_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
})

/** 배송 소요 분 → "6시간 걸려 도착". 1시간 미만이면 분으로, 이상이면 올림한 시간으로 보여 준다. (시안 기준: 시간 단위만 표기) */
export function formatTravelTime(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return ''
  if (minutes < 60) return `${minutes}분 걸려 도착`
  return `${Math.ceil(minutes / 60)}시간 걸려 도착`
}

/** 도착 시각(ISO 8601) → "10월 31일 도착" */
export function formatArrivedAt(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  return `${DATE_FORMAT.format(date)} 도착`
}

/**
 * 카드 하나. 화면용 필드:
 * id, nickname, region, stampId, stampName, stampImageUrl, subtitle, travelLabel, arrivedLabel, isRead
 * subtitle은 Notion 초안에 없는 필드라 값이 없으면 null이다. 카드는 null이면 그 줄을 그리지 않는다.
 */
export function toLetterCard(raw) {
  return {
    id: raw.id,
    nickname: raw.sender_nickname,
    region: raw.sender_region ?? null,
    stampId: raw.stamp?.code ?? null,
    stampName: raw.stamp?.name ?? '',
    stampImageUrl: raw.stamp?.image_url ?? null,
    subtitle: raw.subtitle ?? null,
    travelLabel: formatTravelTime(raw.travel_minutes),
    arrivedLabel: formatArrivedAt(raw.arrived_at),
    isRead: Boolean(raw.is_read),
  }
}

/** 남은 시간(분) → "11시간 남음" */
export function formatRemaining(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return ''
  if (minutes < 60) return `${minutes}분 남음`
  return `${Math.ceil(minutes / 60)}시간 남음`
}

// 대화 상대 프로필 원: 닉네임마다 정해진 그림이 없어서 id로 표정과 색을 돌려 가며 고른다. (mock, 서버가 주면 그 값으로 바꾼다)
const AVATARS = [
  { pose: 'face', tone: 'orange' },
  { pose: 'wink', tone: 'sky' },
  { pose: 'smile', tone: 'sage' },
  { pose: 'sleepy', tone: 'peach' },
]

// 상태별 배지 색(tone)과 글자, 아래 한 줄 설명. 시안 5-3 기준.
const CHAT_STATUS = {
  my_turn: (raw) => ({
    badge: '내 차례예요',
    badgeTone: 'orange',
    preview: raw.last_message_preview ? `"${raw.last_message_preview}"` : '',
  }),
  waiting_reply: (raw) => ({
    badge: '답장 기다리는 중',
    badgeTone: 'sky',
    preview: `내가 보낸 편지 · ${formatArrivedAt(raw.arrived_at)}`,
  }),
  in_transit: (raw) => ({
    badge: `배송 중 · ${formatRemaining(raw.remaining_minutes)}`,
    badgeTone: 'butter',
    preview: '내가 보낸 편지가 가는 중이에요',
  }),
  ended: () => ({
    badge: '여기까지예요',
    badgeTone: 'soft',
    preview: '7일 동안 답장이 없어 조용히 마무리됐어요',
  }),
}

export const CHAT_ROUND_TRIP_MAX = 3

/**
 * 대화 카드 하나(5-3). 화면용 필드:
 * id, nickname, region, avatarPose, avatarTone, badge, badgeTone, preview, roundTrips(0~3, 끝난 대화는 null), isEnded
 * 알 수 없는 status면 배지 없이 빈 문구로 둔다.
 */
export function toChatCard(raw) {
  const isEnded = raw.status === 'ended'
  const avatar = AVATARS[raw.id % AVATARS.length]
  const status = (CHAT_STATUS[raw.status] ?? (() => ({ badge: '', badgeTone: 'soft', preview: '' })))(raw)
  return {
    id: raw.id,
    nickname: raw.sender_nickname,
    region: raw.sender_region ?? null,
    avatarPose: isEnded ? 'sleepy' : avatar.pose,
    avatarTone: avatar.tone,
    ...status,
    roundTrips: isEnded ? null : Math.min(raw.round_trip_count ?? 0, CHAT_ROUND_TRIP_MAX),
    isEnded,
  }
}

/** 목록 응답 { results, next_cursor, has_next } → { items, nextCursor, hasNext }. 탭에 맞는 카드 모양으로 바꾼다. */
export function toMailboxPage(tab, response) {
  const toCard = tab === 'chatting' ? toChatCard : toLetterCard
  return {
    items: (response.results ?? []).map(toCard),
    nextCursor: response.next_cursor ?? null,
    hasNext: Boolean(response.has_next),
  }
}
