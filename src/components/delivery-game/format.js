// 게임 화면의 시간·지역 표기. 서버의 시간 값은 초 단위다.

/**
 * 초를 「1시간 20분」「30분」「30초」처럼 읽기 좋게 바꾼다. 데모 모드의 짧은 시간은 초로 보인다.
 * @param {number} seconds
 */
export function formatDuration(seconds) {
  const value = Math.max(0, Math.round(seconds))
  if (value < 60) return `${value}초`
  const minutes = Math.round(value / 60)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${minutes}분`
  return rest ? `${hours}시간 ${rest}분` : `${hours}시간`
}

/**
 * 도착 시각을 「오후 3:20」처럼 바꾼다. 오늘이 아니면 「11월 18일 오전 9:05」.
 * @param {string} iso
 * @param {Date} [now]
 */
export function formatArrival(iso, now = new Date()) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const time = date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul' })
  const sameDay = date.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) === now.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })
  if (sameDay) return time
  const day = date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' })
  return `${day} ${time}`
}

/** 서버 지역({ full_name })을 화면 이름으로. */
export const regionLabel = (region) => region?.full_name ?? ''

export const REASON_TEXT = {
  LETTER_ARRIVED: '이미 도착한 편지예요',
  ARRIVING_SOON: '곧 도착해서 배달할 수 없어요',
  PLAY_LIMIT: '이 편지로는 3번까지 배달할 수 있어요',
  REDUCE_LIMIT: '이 편지는 더 빨리 보낼 수 없어요',
}
