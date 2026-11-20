import { useEffect, useState } from 'react'

const TICK_MS = 1000

/**
 * 도착까지 남은 시간과 진행률. 1초마다 갱신한다.
 * 서버의 보낸 시각(sentAt)과 도착 시각(arrivesAt, ISO 문자열)으로 계산한다.
 * 게임으로 도착 시각이 앞당겨지면 그만큼 진행률이 앞서도록, 진행률은 원래 배송 시간(durationMinutes)을 기준으로 한다.
 * (진행률 = 1 - 남은 시간 / 원래 배송 시간. 원래 시간을 모르면 보낸 시각~도착 시각 전체를 기준으로 한다.)
 * @param {{sentAt: string, arrivesAt: string, durationMinutes?: number|null}} delivery
 * @returns {{remainingMinutes: number, progress: number}} 남은 시간(분, 올림)과 진행률(0~1)
 */
export default function useArrivalCountdown({ sentAt, arrivesAt, durationMinutes }) {
  const [startedAt] = useState(() => Date.parse(sentAt))
  const spanMinutes = Math.max((Date.parse(arrivesAt) - startedAt) / 60_000, 1 / 60)
  // 원래 시간이 실제 배송 시간보다 짧을 수는 없다(잘못된 값이면 무시한다).
  const totalMinutes = durationMinutes >= spanMinutes ? durationMinutes : spanMinutes
  const [now, setNow] = useState(() => Date.now())

  const arrivesAtMs = startedAt + spanMinutes * 60_000
  // 도착한 뒤에는 더 셀 것이 없으므로 1초 갱신을 멈춘다(배송 지도·발송 완료 화면이 계속 다시 그려지지 않게).
  useEffect(() => {
    if (Date.now() >= arrivesAtMs) return undefined
    const timer = setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= arrivesAtMs) clearInterval(timer)
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [arrivesAtMs])

  const remainingMs = Math.max(arrivesAtMs - now, 0)
  return {
    remainingMinutes: Math.ceil(remainingMs / 60_000),
    progress: Math.min(Math.max(1 - remainingMs / (totalMinutes * 60_000), 0), 1),
  }
}

/** 남은 분을 "5시간 59분", "6시간", "42분"처럼 보여준다. */
export function formatRemaining(minutes) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}분`
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`
}
