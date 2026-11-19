// 펜팔·기록의 id는 친구 id가 아니라 대화 id(conversation_id)이다. 경로도 /pen-pal/:conversationId 이다.

import { toStampArtId } from '../mailbox/stampArt.js'
import { toAvatarPose } from '../mailbox/mailboxMapper.js'
import { buildReplyPath, toPreview } from '../mailbox/letterReceiveMapper.js'

const DAY = 24 * 60 * 60 * 1000

const DATE_PARTS = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' })

// 친구 프로필 원 색: 서버에는 색이 없어 목록 순서대로 돌려 쓴다. 시안 5-14(하늘빛·갈매기·귤껍질)와 맞췄다.
const AVATAR_TONES = ['peach', 'sky', 'sage']

export function formatMonthDay(isoString) {
  const date = new Date(isoString)
  if (!isoString || Number.isNaN(date.getTime())) return ''
  const parts = DATE_PARTS.formatToParts(date)
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  return `${month}.${day}`
}

// 한국 시간(UTC+9) 기준 날짜 번호. 두 시각이 같은 날인지 달력 날짜로 비교할 때 쓴다.
const KST_OFFSET = 9 * 60 * 60 * 1000
const kstDay = (time) => Math.floor((time + KST_OFFSET) / DAY)

export function formatAgo(isoString, now = new Date()) {
  const time = new Date(isoString).getTime()
  if (!isoString || Number.isNaN(time)) return ''
  const days = Math.max(kstDay(now.getTime()) - kstDay(time), 0)
  if (days < 1) return '오늘'
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  return `${Math.floor(days / 30)}달 전`
}

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

// 시작 일기 원문 경로(일기 화면은 다른 담당). 작성자가 상대면 읽기 화면, 내 일기면 내 일기 화면이다. 일기가 없거나 작성자를 모르면 링크를 만들지 않는다.
function diaryPath(diary, partner) {
  if (diary?.id == null || diary.author?.id == null) return null
  return diary.author.id === partner.id ? `/diary/${diary.id}` : `/diary/published/${diary.id}`
}

/**
 * 상대와 주고받은 편지(5-15). 응답은 GET /api/mailbox/conversations/{id}/ 이다.
 * linkPath: "원문 보기" 경로. 도착한 편지는 /mailbox/{id}, 일기는 /diary/{id}(상대) 또는 /diary/published/{id}(내 일기). 도착 전 편지나 없는 일기는 null이다.
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
          linkPath: diaryPath(raw.diary, partner),
        },
      ]
    : []
  const letterItems = letters.map((letter) => {
    const sent = letter.direction === 'sent'
    const when = sent ? letter.sent_at : (letter.arrived_at ?? letter.sent_at)
    const letterId = Number(letter.id)
    return {
      id: `letter-${letter.id}`,
      side: sent ? 'right' : 'left',
      preview: toPreview(letter.preview) || NO_PREVIEW[sent ? 'sent' : 'received'],
      dateLabel: `${formatMonthDay(when)} ${sent ? '보냄' : '받음'}`.trim(),
      stampId: toStampArtId(letter.stamp?.code),
      linkPath: letter.arrived_at && Number.isInteger(letterId) ? `/mailbox/${letterId}` : null,
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
