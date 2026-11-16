// 펜팔 친구(5-14)·주고받은 편지(5-15) 변환 함수. 서버 응답(api/mailbox.md) → 화면용 데이터.
// 화면과 컴포넌트는 서버 필드 이름을 직접 쓰지 않고 이 파일의 결과만 쓴다.
// 입력은 항상 서버 응답 모양이다. mock 모드(VITE_API_MOCK=true)도 penPalDemo.js가 서버 모양으로 바꿔 넘긴다.
// 펜팔·기록의 id는 친구 id가 아니라 대화 id(conversation_id)이다. 경로도 /pen-pal/:conversationId 이다.

import { toStampArtId } from '../mailbox/stampArt.js' // 서버 우표 code → 그림 id 표는 한 곳(mailbox/stampArt.js)에 있다.

// 아래 세 가지(고향이 표정, 첫 줄 미리보기, 답장 경로)는 components/mailbox와 같은 규칙이다. 이전처럼 여기에도 따로 둔다.

// 서버 avatar 코드 → 고향이(Mascot) 표정. 모르는 값은 기본 얼굴이다.
const AVATAR_POSE = { 'cat-basic': 'face', 'cat-wink': 'wink', 'cat-sparkle': 'sparkle', 'cat-shy': 'shy', 'cat-smile': 'smile' }
const toAvatarPose = (avatar) => AVATAR_POSE[avatar] ?? 'face'

const PREVIEW_MAX_LENGTH = 60

/** 본문의 첫 줄(빈 줄은 건너뜀). 주소가 길어지지 않게 60자까지만 쓴다. */
export function toPreview(body) {
  const line = body?.split(/\r?\n/).find((text) => text.trim())?.trim() ?? ''
  return line.slice(0, PREVIEW_MAX_LENGTH)
}

// 가정: 답장은 편지 쓰기로 들어간다. docs/letter-write.md의 제안 쿼리(letterId, nickname, region)를 따른다.
const LETTER_WRITE_PATH = '/letter-write'

/** 답장하기 경로. 예: /letter-write?letterId=101&nickname=하늘빛&region=충남 천안시 (한글·공백은 인코딩된다) */
export function buildReplyPath({ letterId, nickname, region, preview }) {
  const query = new URLSearchParams({ letterId: String(letterId), nickname: nickname ?? '', region: region ?? '' })
  if (preview) query.set('preview', preview)
  return `${LETTER_WRITE_PATH}?${query.toString()}`
}

const DAY = 24 * 60 * 60 * 1000

const DATE_PARTS = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' })

// 친구 프로필 원 색: 서버에는 색이 없어 목록 순서대로 돌려 쓴다. 시안 5-14(하늘빛·갈매기·귤껍질)와 맞췄다.
const AVATAR_TONES = ['peach', 'sky', 'sage']

/** "2026-10-30T..." → "10.30" */
export function formatMonthDay(isoString) {
  const date = new Date(isoString)
  if (!isoString || Number.isNaN(date.getTime())) return ''
  const parts = DATE_PARTS.formatToParts(date)
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  return `${month}.${day}`
}

/** 지금과의 차이를 "오늘", "3일 전", "1주 전", "2달 전"으로 줄여 쓴다. */
export function formatAgo(isoString, now = new Date()) {
  const time = new Date(isoString).getTime()
  if (!isoString || Number.isNaN(time)) return ''
  const days = Math.max(Math.floor((now.getTime() - time) / DAY), 0)
  if (days < 1) return '오늘'
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  return `${Math.floor(days / 30)}달 전`
}

/**
 * 펜팔 친구 목록 한 페이지(5-14). 카드마다 { id(대화 id), nickname, infoLabel("충남 천안시 · 편지 6통"), agoLabel, avatarPose, avatarTone, to }.
 * @returns {{ items: object[], hasNext: boolean }}
 */
export function toPenPalList(response, now = new Date()) {
  const items = (response.results ?? []).map((item, index) => ({
    id: item.conversation_id,
    nickname: item.partner?.nickname ?? '',
    infoLabel: [item.partner?.region?.full_name, `편지 ${item.letter_count}통`].filter(Boolean).join(' · '),
    agoLabel: formatAgo(item.last_letter_at, now),
    avatarPose: toAvatarPose(item.partner?.avatar),
    avatarTone: AVATAR_TONES[index % AVATAR_TONES.length],
    to: `/pen-pal/${item.conversation_id}`,
  }))
  return { items, hasNext: Boolean(response.next) }
}

// 서버는 도착한 편지만 미리보기(preview)를 준다. 내가 보낸 편지나 아직 오는 편지는 null일 수 있어 카드에 쓰는 대신 문구.
const NO_PREVIEW = {
  sent: '내가 보낸 편지예요',
  received: '아직 오고 있는 편지예요',
}

/**
 * 상대와 주고받은 편지(5-15). 응답은 GET /api/mailbox/conversations/{id}/ 이다.
 * 반환: { title("하늘빛 · 충남 천안시"), countLabel("주고받은 편지 6통"), replyPath, canReply, items: [{ id, side, preview, dateLabel, stampId }] }
 * side: 내가 보낸 것은 'right', 일기와 받은 것은 'left' (시안 5-15의 좌우 배치)
 * canReply: 서버가 준 reply_to가 있을 때만 true. 마무리된 대화(closed)는 reply_to가 없어 "답장 쓰기"를 숨긴다.
 * 시작 일기(diary)가 있으면 맨 앞 카드로 둔다(내 일기가 지워졌으면 diary가 null이다).
 */
export function toPenPalLetters(raw) {
  const partner = raw.partner ?? {}
  const letters = raw.letters ?? []
  const lastReceived = [...letters].reverse().find((letter) => letter.direction === 'received' && letter.preview)
  const diaryItems = raw.diary
    ? [
        {
          id: `diary-${raw.diary.id}`,
          side: 'left',
          preview: toPreview(raw.diary.body_preview),
          dateLabel: `${formatMonthDay(raw.diary.created_at)} 고향 일기`.trim(),
          stampId: null,
        },
      ]
    : []
  const letterItems = letters.map((letter) => {
    const sent = letter.direction === 'sent'
    const when = sent ? letter.sent_at : (letter.arrived_at ?? letter.sent_at)
    return {
      id: `letter-${letter.id}`,
      side: sent ? 'right' : 'left',
      preview: toPreview(letter.preview) || NO_PREVIEW[sent ? 'sent' : 'received'],
      dateLabel: `${formatMonthDay(when)} ${sent ? '보냄' : '받음'}`.trim(),
      stampId: toStampArtId(letter.stamp?.code),
    }
  })
  const region = partner.region?.full_name
  return {
    title: [partner.nickname, region].filter(Boolean).join(' · '),
    countLabel: `주고받은 편지 ${raw.letter_count ?? letters.length}통`,
    replyPath:
      raw.reply_to != null
        ? buildReplyPath({
            letterId: raw.reply_to,
            nickname: partner.nickname,
            region,
            preview: toPreview(lastReceived?.preview),
          })
        : null,
    canReply: raw.reply_to != null,
    items: [...diaryItems, ...letterItems],
  }
}
