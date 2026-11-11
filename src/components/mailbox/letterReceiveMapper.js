// 받은 편지 상세(5-8, 5-9) 변환 함수. 서버(지금은 mock) 응답 → 화면용 데이터.
// mock, 문서 레포 API 확정 전. 화면과 컴포넌트는 서버 필드 이름을 직접 쓰지 않고 이 파일의 결과만 쓴다.
import { formatTravelTime } from './mailboxMapper.js'

// 가정: 답장은 편지 쓰기로 들어간다. docs/letter-write.md의 제안 쿼리(letterId, nickname, region)를 따른다.
// 편지 쓰기 쪽이 letterId를 아직 읽지 않는다(채현님과 합의 전). region은 편지를 받을 지역, 곧 보낸 사람의 지역이다.
const LETTER_WRITE_PATH = '/letter-write'

/** 답장하기 경로. 예: /letter-write?letterId=101&nickname=하늘빛&region=충남 천안 (한글·공백은 인코딩된다) */
export function buildReplyPath({ letterId, nickname, region }) {
  const query = new URLSearchParams({ letterId: String(letterId), nickname, region })
  return `${LETTER_WRITE_PATH}?${query.toString()}`
}

/**
 * 새 편지 도착(5-8) 화면용 데이터.
 * titleLines  ["하늘빛님에게서", "편지가 도착했어요"]
 * routeLabel  "충남 천안 → 서울 성북 · 6시간 걸려 왔어요"
 * toLabel     "To. 다인"
 */
export function toLetterArrival(raw, myNickname) {
  const travel = formatTravelTime(raw.travel_minutes).replace(/도착$/, '왔어요')
  return {
    id: raw.id,
    isRead: Boolean(raw.is_read),
    titleLines: [`${raw.sender_nickname}님에게서`, '편지가 도착했어요'],
    routeLabel: [`${raw.sender_region} → ${raw.receiver_region}`, travel].filter(Boolean).join(' · '),
    stampId: raw.stamp?.code ?? null,
    stampName: raw.stamp?.name ?? '',
    toLabel: `To. ${myNickname}`,
  }
}

/**
 * 편지 열람(5-9) 화면용 데이터.
 * 본문은 줄바꿈 문자로 나눈 문자열 그대로 둔다(화면이 pre-wrap으로 그린다).
 */
export function toLetterView(raw) {
  return {
    id: raw.id,
    nickname: raw.sender_nickname,
    isFirstLetter: Boolean(raw.is_first_letter),
    routeLabel: `${raw.sender_region} → ${raw.receiver_region}`,
    travelLabel: formatTravelTime(raw.travel_minutes),
    stampId: raw.stamp?.code ?? null,
    stampName: raw.stamp?.name ?? '',
    body: raw.body ?? '',
    signature: raw.signature_text ?? '',
    replyPath: buildReplyPath({ letterId: raw.id, nickname: raw.sender_nickname, region: raw.sender_region }),
  }
}
