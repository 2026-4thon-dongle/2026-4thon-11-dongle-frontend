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

/** 목록 응답 { results, next_cursor, has_next } → { letters, nextCursor, hasNext } */
export function toLetterPage(response) {
  return {
    letters: (response.results ?? []).map(toLetterCard),
    nextCursor: response.next_cursor ?? null,
    hasNext: Boolean(response.has_next),
  }
}
