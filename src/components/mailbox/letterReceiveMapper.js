// 받은 편지 상세(5-8, 5-9) 변환 함수. 서버 응답(GET /api/letters/{id}/, api/mailbox.md) → 화면용 데이터.
// 화면과 컴포넌트는 서버 필드 이름을 직접 쓰지 않고 이 파일의 결과만 쓴다.
// 입력은 항상 서버 응답 모양이다. mock 모드(VITE_API_MOCK=true)도 letterReceiveDemo.js가 서버 모양으로 바꿔 넘긴다.
import { formatTravelTime, toAvatarPose, toStampArtId } from './mailboxMapper.js'

// 가정: 답장은 편지 쓰기로 들어간다. docs/letter-write.md의 제안 쿼리(letterId, nickname, region)를 따른다.
// letterId는 서버 편지 id(= 서버 reply_to)이다. region은 표시용 문자열이다.
const LETTER_WRITE_PATH = '/letter-write'

const PREVIEW_MAX_LENGTH = 60

/** 본문의 첫 줄(빈 줄은 건너뜀). 주소가 길어지지 않게 60자까지만 쓴다. */
export function toPreview(body) {
  const line = body?.split(/\r?\n/).find((text) => text.trim())?.trim() ?? ''
  return line.slice(0, PREVIEW_MAX_LENGTH)
}

/** 답장하기 경로. 예: /letter-write?letterId=101&nickname=하늘빛&region=충남 천안 (한글·공백은 인코딩된다) */
export function buildReplyPath({ letterId, nickname, region, preview }) {
  const query = new URLSearchParams({ letterId: String(letterId), nickname: nickname ?? '', region: region ?? '' })
  // 편지 쓰기 4-1 배너("Re. 닉네임님의 편지")에 보여 줄 받은 편지 첫 줄. 없으면 붙이지 않는다.
  if (preview) query.set('preview', preview)
  return `${LETTER_WRITE_PATH}?${query.toString()}`
}

const POSTMARK_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  month: '2-digit',
  day: '2-digit',
})

/** 보낸 시각(ISO 8601) → 소인 날짜 "11.04". 값이 없거나 잘못되면 "" (소인 글자를 숨긴다) */
export function formatPostmarkDate(isoString) {
  const date = new Date(isoString)
  if (!isoString || Number.isNaN(date.getTime())) return ''
  const parts = Object.fromEntries(POSTMARK_DATE_FORMAT.formatToParts(date).map((part) => [part.type, part.value]))
  return `${parts.month}.${parts.day}`
}

/** 지역 이름 → 소인에 적을 짧은 이름. "천안시" → "천안", "성북구" → "성북", "세종특별자치시" → "세종", "중구"처럼 두 글자가 남지 않으면 그대로. 없으면 "". */
export function toShortRegion(name) {
  if (!name) return ''
  const trimmed = name.trim()
  const short = trimmed.replace(/특별자치[시도]$/, '').replace(/[시군구]$/, '')
  return short.length >= 2 ? short : trimmed
}

// 서버 편지지 코드(api/letters.md) → 편지지 종류. LetterPaper.css의 letter-paper--{종류}와 같다.
const PAPER_KIND = {
  basic: 'basic',
  lined: 'ruled',
  grid: 'check',
  'cat-border': 'mascot',
  'night-sky': 'night',
  'gold-postcard': 'gold',
}

// 서버 글씨체 코드 → shared/fonts/letterFonts.js의 id. 서버는 '맛있는체'를 delicious로 부르고 shared는 tasty로 부른다.
const FONT_ID_BY_CODE = { delicious: 'tasty' }

/**
 * 새 편지 도착(5-8) 화면용 데이터.
 * titleLines  ["하늘빛님에게서", "편지가 도착했어요"]
 * routeLabel  "충남 천안시 → 서울 성북구 · 6시간 걸려 왔어요"
 * toLabel     "To. 다인" (받는 사람 닉네임은 발송 시점 값 recipient_nickname)
 */
export function toLetterArrival(raw) {
  const travel = formatTravelTime(raw.duration_minutes).replace(/도착$/, '왔어요')
  const route = raw.from_region && raw.to_region ? `${raw.from_region.full_name} → ${raw.to_region.full_name}` : ''
  return {
    id: raw.id,
    titleLines: [`${raw.sender_nickname}님에게서`, '편지가 도착했어요'],
    routeLabel: [route, travel].filter(Boolean).join(' · '),
    stampId: toStampArtId(raw.stamp?.code),
    stampName: raw.stamp?.name ?? '',
    toLabel: `To. ${raw.recipient_nickname ?? ''}`,
  }
}

/** 스티커 기본 크기: 편지지 너비 대비 비율(시안 64px ÷ 360px). 서버가 scale을 주지 않을 때 쓴다. */
export const DEFAULT_STICKER_SCALE = 0.18

function toStickerScale(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.min(value, 1) : DEFAULT_STICKER_SCALE
}

/**
 * 편지 열람(5-9) 화면용 데이터.
 * 본문은 줄바꿈 문자로 나눈 문자열 그대로 둔다(화면이 pre-wrap으로 그린다).
 * signatureUrl: 서명 이미지 URL(없으면 null). stickers: 서명 영역 기준 0~1 위치(x, y)와 기울기(도), 크기 scale(편지지 너비 대비 비율).
 * scale은 서버가 주면 쓰고(요청 1115_fe2be_sticker-scale, 아직 응답 없음) 없거나 0 이하·숫자가 아니면 기본값 0.18(64÷360)을 쓴다.
 * paperKind·fontId: 편지지와 글씨체. canReply·canPass: 서버가 정한 버튼 표시 여부.
 */
export function toLetterView(raw) {
  const route = raw.from_region && raw.to_region ? `${raw.from_region.full_name} → ${raw.to_region.full_name}` : ''
  return {
    id: raw.id,
    nickname: raw.sender_nickname,
    isFirstLetter: Boolean(raw.is_first),
    routeLabel: route,
    travelLabel: formatTravelTime(raw.duration_minutes),
    postmarkDate: formatPostmarkDate(raw.sent_at),
    postmarkPlace: toShortRegion(raw.from_region?.name),
    stampId: toStampArtId(raw.stamp?.code),
    stampName: raw.stamp?.name ?? '',
    body: raw.body ?? '',
    signatureUrl: raw.signature || null,
    stickers: (raw.stickers ?? []).map((sticker, index) => ({
      key: `${sticker.code}-${index}`,
      pose: toAvatarPose(sticker.code),
      x: sticker.x,
      y: sticker.y,
      rotation: sticker.rotation ?? 0,
      scale: toStickerScale(sticker.scale),
    })),
    paperKind: PAPER_KIND[raw.stationery] ?? 'basic',
    fontId: FONT_ID_BY_CODE[raw.font] ?? raw.font ?? 'nanum-pen',
    canReply: Boolean(raw.can_reply),
    canPass: Boolean(raw.can_pass),
    replyPath: buildReplyPath({
      letterId: raw.id,
      nickname: raw.sender_nickname,
      region: raw.from_region?.full_name,
      preview: toPreview(raw.body),
    }),
  }
}

/**
 * 서버 편지 상세 → { arrival(5-8), view(5-9), needsOpen }.
 * needsOpen: 내가 받은 편지인데 아직 열지 않았으면 true(5-8 "새 편지 도착"부터 보여 준다). 보낸 편지는 항상 false이다.
 * roundTripProbe: 봉투를 열 때 「첫 왕복」 우표(5-12)를 보여 줄지 판단하는 값. 안 읽은 받은 답장(is_first가 false)일 때만 { senderId, sentAt, arrivedAt }, 아니면 null.
 * isReceived, sender: 5-9 신고·차단에 쓴다. 신고는 내가 받은 편지만 할 수 있고, 차단 대상은 보낸 사람(sender.id)이다(api/safety.md).
 */
export function toLetterDetail(raw) {
  const needsOpen = raw.direction === 'received' && !raw.is_read
  return {
    arrival: toLetterArrival(raw),
    view: toLetterView(raw),
    needsOpen,
    isReceived: raw.direction === 'received',
    sender: { id: raw.sender?.id ?? null, nickname: raw.sender_nickname ?? raw.sender?.nickname ?? '' },
    roundTripProbe:
      needsOpen && !raw.is_first && raw.sender?.id != null
        ? { senderId: raw.sender.id, sentAt: raw.sent_at, arrivedAt: raw.arrived_at }
        : null,
  }
}
