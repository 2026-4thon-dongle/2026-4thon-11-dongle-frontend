// 우체통 목록 변환 함수. 서버 응답(api/mailbox.md) → 화면용 데이터.
// 화면과 컴포넌트는 서버 필드 이름을 직접 쓰지 않고 이 파일의 결과만 쓴다.
// 입력은 항상 서버 응답 모양이다. mock 모드(VITE_API_MOCK=true)도 mailboxDemo.js가 서버 모양으로 바꿔 넘긴다.
// 시각 필드(sent_at, arrives_at 등)로 남은 시간·진행률을 계산하는 함수는 now(ms)를 받는다(기본 지금).

const DATE_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
})

import { toStampArtId } from './stampArt.js'

// 서버 우표 code → 그림 id 변환은 stampArt.js 한 곳에 있다. letterReceiveMapper 등이 여기서 가져다 쓰던 이름을 그대로 내보낸다.
export { toStampArtId }

// 서버 avatar 코드 → 고향이(Mascot) 표정. 알려진 코드는 편지 스티커 5종뿐이라 모르는 값은 기본 얼굴이다.
const AVATAR_POSE = {
  'cat-basic': 'face',
  'cat-wink': 'wink',
  'cat-sparkle': 'sparkle',
  'cat-shy': 'shy',
  'cat-smile': 'smile',
}

/** 서버 avatar 코드 → Mascot pose */
export function toAvatarPose(avatar) {
  return AVATAR_POSE[avatar] ?? 'face'
}

// 서버에는 프로필 색(tone)이 없어 id로 돌려 가며 고른다.
const AVATAR_TONES = ['orange', 'sky', 'sage', 'peach']
const toTone = (id) => AVATAR_TONES[Math.abs(Number(id) || 0) % AVATAR_TONES.length]

/** 배송 소요 분 → "6시간 걸려 도착". 1시간 미만이면 분으로, 이상이면 올림한 시간으로 보여 준다. (시안 기준: 시간 단위만 표기) */
export function formatTravelTime(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return ''
  if (minutes < 60) return `${minutes}분 걸려 도착`
  return `${Math.ceil(minutes / 60)}시간 걸려 도착`
}

/** 도착 시각(ISO 8601) → "10월 31일 도착" */
export function formatArrivedAt(isoString) {
  const date = new Date(isoString)
  if (!isoString || Number.isNaN(date.getTime())) return ''
  return `${DATE_FORMAT.format(date)} 도착`
}

/** 남은 시간(분) → "11시간 남음" */
export function formatRemaining(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return ''
  if (minutes < 60) return `${minutes}분 남음`
  return `${Math.ceil(minutes / 60)}시간 남음`
}

/** 분 → "5시간 41분" / "11시간" / "40분" */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return ''
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  if (hours === 0) return `${rest}분`
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`
}

/** 도착 시각(ISO)까지 남은 분(올림). 이미 지났거나 값이 이상하면 0 */
export function minutesUntil(isoString, now = Date.now()) {
  const time = new Date(isoString).getTime()
  if (!isoString || Number.isNaN(time)) return 0
  return Math.max(Math.ceil((time - now) / 60000), 0)
}

// 새 편지 탭은 모두 "내 일기에 온 첫 편지"이다(api/mailbox.md). 서버에 부제 필드가 없어 고정 문구를 쓴다.
const NEW_LETTER_SUBTITLE = '첫 편지 · 일기 답장'

/**
 * 새 편지 카드 하나(5-1). 화면용 필드:
 * id, nickname, region, stampId, stampName, stampImageUrl, subtitle, travelLabel, arrivedLabel, isRead
 */
export function toLetterCard(raw) {
  return {
    id: raw.id,
    nickname: raw.sender?.nickname ?? '',
    region: raw.from_region?.full_name ?? null,
    stampId: toStampArtId(raw.stamp?.code),
    stampName: raw.stamp?.name ?? '',
    stampImageUrl: null,
    subtitle: NEW_LETTER_SUBTITLE,
    travelLabel: formatTravelTime(raw.duration_minutes),
    arrivedLabel: formatArrivedAt(raw.arrived_at),
    isRead: Boolean(raw.is_read),
  }
}

const IN_TRANSIT_PREVIEW = {
  sent: '내가 보낸 편지가 가는 중이에요',
  received: '상대 편지가 오는 중이에요',
  unknown: '편지가 가는 중이에요',
}

// 상태별 배지 색(tone)과 글자, 아래 한 줄 설명. 시안 5-3 기준. 상태값은 서버 status(my_turn/waiting/in_transit/closed).
const CHAT_STATUS = {
  my_turn: (raw) => ({
    badge: '내 차례예요',
    badgeTone: 'orange',
    preview: raw.last_letter?.preview ? `"${raw.last_letter.preview}"` : '',
  }),
  waiting: (raw) => ({
    badge: '답장 기다리는 중',
    badgeTone: 'sky',
    preview: `내가 보낸 편지 · ${formatArrivedAt(raw.last_letter?.arrived_at)}`.replace(/ · $/, ''),
  }),
  // 마지막 편지가 내가 보낸 것(sent)이면 "내가 보낸 편지가 가는 중", 상대가 보낸 것(received)이면 "상대 편지가 오는 중"이다. direction이 없으면 방향 없는 문구를 쓴다.
  // 상대 편지가 오는 중일 때와 방향을 모를 때의 문구는 시안에 없어서 정했다.
  in_transit: (raw, now) => ({
    badge: `배송 중 · ${formatRemaining(minutesUntil(raw.last_letter?.arrives_at, now))}`.replace(/ · $/, ''),
    badgeTone: 'butter',
    preview: IN_TRANSIT_PREVIEW[raw.last_letter?.direction] ?? IN_TRANSIT_PREVIEW.unknown,
  }),
  closed: () => ({
    badge: '여기까지예요',
    badgeTone: 'soft',
    preview: '7일 동안 답장이 없어 조용히 마무리됐어요',
  }),
}

export const CHAT_ROUND_TRIP_MAX = 3

/**
 * 대화 카드 하나(5-3). 화면용 필드:
 * id(대화 id), nickname, region, avatarPose, avatarTone, badge, badgeTone, preview, roundTrips(0~3, 끝난 대화는 null), isEnded, path(5-15)
 * 알 수 없는 status면 배지 없이 빈 문구로 둔다.
 */
export function toChatCard(raw, now = Date.now()) {
  const isEnded = raw.status === 'closed'
  const status = (CHAT_STATUS[raw.status] ?? (() => ({ badge: '', badgeTone: 'soft', preview: '' })))(raw, now)
  return {
    id: raw.id,
    nickname: raw.partner?.nickname ?? '',
    region: raw.partner?.region?.full_name ?? null,
    avatarPose: isEnded ? 'sleepy' : toAvatarPose(raw.partner?.avatar),
    avatarTone: toTone(raw.partner?.id ?? raw.id),
    ...status,
    roundTrips: isEnded ? null : Math.min(raw.round_trips ?? 0, CHAT_ROUND_TRIP_MAX),
    isEnded,
    // 대화 카드를 누르면 그 대화의 주고받은 편지(5-15 /pen-pal/:conversationId)로 간다.
    path: `/pen-pal/${raw.id}`,
  }
}

/**
 * 배송 중 카드 하나(5-5). 화면용 필드:
 * id(편지 id), name("To. 하늘빛" / "From. 갈매기"), route("서울 → 충남" 등), stampId, stampName,
 * progress(0~1), remainingLabel, mapPath(지도 화면 경로)
 * 진행률과 남은 시간은 sent_at·arrives_at과 지금 시각으로 계산한다(기기 시계 기준).
 * 지도 경로 /delivery/:letterId/map 은 letterRoutes에 있는 임시 경로(4-12)이다.
 */
export function toShippingCard(raw, now = Date.now()) {
  const isSent = raw.direction === 'sent'
  const sent = new Date(raw.sent_at).getTime()
  const arrives = new Date(raw.arrives_at).getTime()
  const total = arrives - sent
  const progress = total > 0 ? Math.min(Math.max((now - sent) / total, 0), 1) : 0
  const duration = formatDuration(minutesUntil(raw.arrives_at, now))
  const route = `${raw.from_region?.sido ?? ''} → ${raw.to_region?.sido ?? ''}${isSent ? '' : ' · 나에게 오는 중'}`
  return {
    id: raw.id,
    name: `${isSent ? 'To.' : 'From.'} ${raw.partner?.nickname ?? ''}`,
    route,
    stampId: toStampArtId(raw.stamp?.code),
    stampName: raw.stamp?.name ?? '',
    stampImageUrl: null,
    progress,
    remainingLabel: duration ? (isSent ? `도착까지 ${duration}` : `${duration} 남음`) : '곧 도착해요',
    mapPath: `/delivery/${raw.id}/map`,
  }
}

// 보관 카드: 넘긴 편지는 "From. 닉네임", 마무리된 대화는 닉네임만 쓴다. (시안 5-7)
const STORED_KIND = {
  passed_letter: { badge: '넘긴 편지', withFrom: true },
  closed_conversation: { badge: '마무리된 대화', withFrom: false },
}

/**
 * 보관 카드 하나(5-7). 화면용 필드:
 * id(목록 key, 종류+id), name, info("경북 경주 · 11월 1일"), hint, badge, stampId, stampName, stampImageUrl, path
 * 넘긴 편지(passed_letter)는 읽기 전용 편지 상세(/mailbox/:letterId), 마무리된 대화(closed_conversation)는 5-15(/pen-pal/:conversationId)로 간다.
 */
export function toStoredCard(raw) {
  const kind = STORED_KIND[raw.kind] ?? STORED_KIND.passed_letter
  const isConversation = raw.kind === 'closed_conversation'
  const targetId = isConversation ? raw.conversation_id : raw.letter_id
  const nickname = raw.partner?.nickname ?? ''
  const date = formatArrivedAt(raw.archived_at).replace(/ 도착$/, '')
  return {
    id: `${raw.kind}-${targetId}`,
    name: kind.withFrom ? `From. ${nickname}` : nickname,
    info: [raw.partner?.region?.full_name, date].filter(Boolean).join(' · '),
    hint: '읽기만 할 수 있어요',
    badge: kind.badge,
    stampId: toStampArtId(raw.stamp?.code),
    stampName: raw.stamp?.name ?? '',
    stampImageUrl: null,
    path: isConversation ? `/pen-pal/${targetId}` : `/mailbox/${targetId}`,
  }
}

const CARD_MAPPERS = {
  new: toLetterCard,
  chatting: toChatCard,
  shipping: toShippingCard,
  stored: toStoredCard,
}

/**
 * 목록 응답 { count, next, previous, results } → { items, count, hasNext }. 탭에 맞는 카드 모양으로 바꾼다.
 * next는 URL 문자열이라 값이 있는지만 본다(다음 페이지 번호는 호출한 쪽이 page + 1로 센다).
 */
export function toMailboxPage(tab, response, now = Date.now()) {
  const toCard = CARD_MAPPERS[tab] ?? toLetterCard
  return {
    items: (response.results ?? []).map((raw) => toCard(raw, now)),
    count: response.count ?? 0,
    hasNext: Boolean(response.next),
  }
}
