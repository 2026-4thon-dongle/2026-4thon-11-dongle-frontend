// 펜팔 친구(5-14)·주고받은 편지(5-15) 변환 함수. 서버(지금은 mock) 응답 → 화면용 데이터.
// mock, 문서 레포 API 확정 전. 화면과 컴포넌트는 서버 필드 이름을 직접 쓰지 않고 이 파일의 결과만 쓴다.

const DAY = 24 * 60 * 60 * 1000

const DATE_PARTS = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' })

// 가정: 답장은 편지 쓰기로 들어간다. docs/letter-write.md의 제안 쿼리(letterId, nickname, region)를 따른다.
// 편지 쓰기 쪽이 letterId를 아직 읽지 않는다(채현님과 합의 전).
const LETTER_WRITE_PATH = '/letter-write'

// 친구 프로필 원: 닉네임마다 정해진 그림이 없어서 목록 순서대로 돌려 쓴다. 시안 5-14(하늘빛·갈매기·귤껍질)와 맞췄다. mock 전용.
const AVATARS = [
  { pose: 'face', tone: 'peach' },
  { pose: 'wink', tone: 'sky' },
  { pose: 'heart', tone: 'sage' },
]

/** "2026-10-30T..." → "10.30" */
export function formatMonthDay(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  const parts = DATE_PARTS.formatToParts(date)
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  return `${month}.${day}`
}

/** 지금과의 차이를 "오늘", "3일 전", "1주 전", "2달 전"으로 줄여 쓴다. */
export function formatAgo(isoString, now = new Date()) {
  const time = new Date(isoString).getTime()
  if (Number.isNaN(time)) return ''
  const days = Math.max(Math.floor((now.getTime() - time) / DAY), 0)
  if (days < 1) return '오늘'
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  return `${Math.floor(days / 30)}달 전`
}

/** 답장하기 경로. 예: /letter-write?letterId=101&nickname=하늘빛&region=충남 천안 (한글·공백은 인코딩된다) */
export function buildReplyPath({ letterId, nickname, region }) {
  const query = new URLSearchParams({ letterId: String(letterId), nickname, region })
  return `${LETTER_WRITE_PATH}?${query.toString()}`
}

/**
 * 펜팔 친구 목록(5-14). 카드마다 { id, nickname, infoLabel("충남 천안 · 편지 6통"), agoLabel, avatarPose, avatarTone, to }.
 * 이동 경로 /pen-pal/:id 는 가정이다.
 */
export function toPenPalList(response, now = new Date()) {
  return (response.results ?? []).map((item, index) => {
    const avatar = AVATARS[index % AVATARS.length]
    return {
      id: item.id,
      nickname: item.nickname,
      infoLabel: `${item.region} · 편지 ${item.letter_count}통`,
      agoLabel: formatAgo(item.last_letter_at, now),
      avatarPose: avatar.pose,
      avatarTone: avatar.tone,
      to: `/pen-pal/${item.id}`,
    }
  })
}

const KIND_LABEL = { diary: '고향 일기', sent: '보냄', received: '받음' }

/**
 * 상대별 주고받은 편지(5-15).
 * @param {object} friend 친구 한 명 (MOCK_PEN_PALS.results 항목)
 * @param {Array} entries 시간순 기록 (MOCK_PEN_PAL_LETTERS[id])
 * 반환: { title("하늘빛 · 충남 천안"), countLabel("주고받은 편지 6통"), replyPath, canReply(끝난 대화면 false), items: [{ id, side, preview, dateLabel, stampId }] }
 * side: 내가 보낸 것은 'right', 일기와 받은 것은 'left' (시안 5-15의 좌우 배치)
 */
export function toPenPalLetters(friend, entries) {
  return {
    title: `${friend.nickname} · ${friend.region}`,
    countLabel: `주고받은 편지 ${friend.letter_count}통`,
    replyPath: buildReplyPath({ letterId: friend.reply_letter_id, nickname: friend.nickname, region: friend.region }),
    // 끝난 대화(7일 동안 답장 없음)는 답장 쓰기를 숨긴다. is_ended는 mock 전용 필드이다.
    canReply: !friend.is_ended,
    items: entries.map((entry) => ({
      id: entry.id,
      side: entry.kind === 'sent' ? 'right' : 'left',
      preview: entry.preview,
      dateLabel: `${formatMonthDay(entry.at)} ${KIND_LABEL[entry.kind] ?? ''}`.trim(),
      stampId: entry.stamp_code ?? null,
    })),
  }
}
