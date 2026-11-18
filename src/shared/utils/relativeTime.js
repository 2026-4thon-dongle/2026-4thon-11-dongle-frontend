// 알림처럼 최근 일을 「방금 · N분 전 · N시간 전 · 어제 · M월 D일」로 쓴다(시안 3-4). 날짜 비교는 한국 시간 기준이다.
const dayKey = (date) => date.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })

/**
 * @param {string} iso 서버 시각(ISO 8601)
 * @param {Date} [now]
 * @returns {string} 시각을 읽지 못하면 빈 문자열
 */
export function relativeTime(iso, now = new Date()) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000)
  if (minutes < 1) return '방금'
  if (minutes < 60) return `${minutes}분 전`
  if (dayKey(date) === dayKey(now)) return `${Math.floor(minutes / 60)}시간 전`
  if (dayKey(date) === dayKey(new Date(now.getTime() - 86400000))) return '어제'
  return date.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' })
}
