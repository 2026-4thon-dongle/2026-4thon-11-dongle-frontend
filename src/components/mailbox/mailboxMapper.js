// 우체통 목록 변환 함수. 서버(지금은 mock) 응답 → 화면용 데이터.
// mock, 문서 레포 API 확정 전, Notion 초안 참고.
// 화면과 컴포넌트는 서버 필드 이름을 직접 쓰지 않고 이 파일의 결과만 쓴다.
// 문서 레포에 편지 API가 확정돼 필드나 페이지네이션이 바뀌면 이 파일만 고친다.

import { PROVINCES, CITIES } from '../../shared/region/regions.js'

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
 * 보낸 사람 지역 표기 → 시·도("전북"). 지역 필터(5-1)에 쓴다.
 * mock의 표기가 탭마다 달라서("전주시", "부산시", "충남 천안") shared/region의 이름으로 맞춘다.
 * 첫 단어가 시·도면 그대로, 아니면 끝의 "시/군"을 떼고 시·도 또는 소속 시·군을 찾는다. 못 찾으면 null이다.
 */
export function toProvince(regionText) {
  if (!regionText) return null
  const first = regionText.trim().split(/\s+/)[0]
  if (PROVINCES.includes(first)) return first
  const name = first.replace(/(시|군)$/, '')
  if (PROVINCES.includes(name)) return name
  return PROVINCES.find((province) => CITIES[province]?.includes(name)) ?? null
}

/** 카드 목록에 있는 시·도를 shared/region 순서로 모은다. 지역 드롭다운 목록용. */
export function listProvinces(cards) {
  const found = new Set(cards.map((card) => card.province))
  return PROVINCES.filter((province) => found.has(province))
}

/**
 * 카드 하나. 화면용 필드:
 * id, nickname, region, province, stampId, stampName, stampImageUrl, subtitle, travelLabel, arrivedLabel, isRead
 * subtitle은 Notion 초안에 없는 필드라 값이 없으면 null이다. 카드는 null이면 그 줄을 그리지 않는다.
 */
export function toLetterCard(raw) {
  return {
    id: raw.id,
    nickname: raw.sender_nickname,
    region: raw.sender_region ?? null,
    province: toProvince(raw.sender_region),
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

/** 분 → "5시간 41분" / "11시간" / "40분" */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return ''
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  if (hours === 0) return `${rest}분`
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`
}

/**
 * 배송 중 카드 하나(5-5). 화면용 필드:
 * id, name("To. 하늘빛" / "From. 갈매기"), route("서울 → 충남" 등), stampId, stampName,
 * progress(0~1), remainingLabel, mapPath(지도 화면 경로)
 * 지도 경로 /delivery/:letterId/map 은 letterRoutes에 있는 임시 경로(4-12)이다.
 */
export function toShippingCard(raw) {
  const isSent = raw.direction === 'sent'
  const total = raw.travel_minutes
  const remaining = raw.remaining_minutes
  const progress = total > 0 ? Math.min(Math.max(1 - remaining / total, 0), 1) : 0
  const route = `${raw.from_region} → ${raw.to_region}${isSent ? '' : ' · 나에게 오는 중'}`
  const duration = formatDuration(remaining)
  return {
    id: raw.id,
    name: `${isSent ? 'To.' : 'From.'} ${raw.counterpart_nickname}`,
    route,
    stampId: raw.stamp?.code ?? null,
    stampName: raw.stamp?.name ?? '',
    stampImageUrl: raw.stamp?.image_url ?? null,
    progress,
    remainingLabel: isSent ? `도착까지 ${duration}` : `${duration} 남음`,
    mapPath: `/delivery/${raw.id}/map`,
  }
}

// 보관 카드: 넘긴 편지는 "From. 닉네임", 마무리된 대화는 닉네임만 쓴다. (시안 5-7)
const STORED_KIND = {
  passed_letter: { badge: '넘긴 편지', withFrom: true },
  ended_chat: { badge: '마무리된 대화', withFrom: false },
}

/**
 * 보관 카드 하나(5-7). 화면용 필드:
 * id, name, info("경북 경주 · 11월 1일"), hint, badge, stampId, stampName, stampImageUrl, path
 */
export function toStoredCard(raw) {
  const kind = STORED_KIND[raw.kind] ?? STORED_KIND.passed_letter
  const date = formatArrivedAt(raw.stored_at).replace(/ 도착$/, '')
  return {
    id: raw.id,
    name: kind.withFrom ? `From. ${raw.sender_nickname}` : raw.sender_nickname,
    info: [raw.sender_region, date].filter(Boolean).join(' · '),
    hint: '읽기만 할 수 있어요',
    badge: kind.badge,
    stampId: raw.stamp?.code ?? null,
    stampName: raw.stamp?.name ?? '',
    stampImageUrl: raw.stamp?.image_url ?? null,
    // 가정: 마무리된 대화는 대화 화면, 넘긴 편지는 편지 화면으로 간다. 둘 다 아직 임시 화면이다.
    path: raw.kind === 'ended_chat' ? `/mailbox/chats/${raw.id}` : `/mailbox/${raw.id}`,
  }
}

const CARD_MAPPERS = {
  new: toLetterCard,
  chatting: toChatCard,
  shipping: toShippingCard,
  stored: toStoredCard,
}

/** 목록 응답 { results, next_cursor, has_next } → { items, nextCursor, hasNext }. 탭에 맞는 카드 모양으로 바꾼다. */
export function toMailboxPage(tab, response) {
  const toCard = CARD_MAPPERS[tab] ?? toLetterCard
  return {
    items: (response.results ?? []).map(toCard),
    nextCursor: response.next_cursor ?? null,
    hasNext: Boolean(response.has_next),
  }
}
