import { useEffect, useState } from 'react'

const TICK_MS = 1000

/**
 * 도착까지 남은 시간과 진행률. 1초마다 갱신한다.
 * 서버의 보낸 시각(sentAt)과 도착 시각(arrivesAt, ISO 문자열)을 주면 그것으로 계산한다.
 * 주지 않으면(mock) 전체 소요 시간과 보낸 뒤 지난 시간(분)으로 계산한다.
 * @param {{totalMinutes?: number, elapsedMinutes?: number, sentAt?: string, arrivesAt?: string}} delivery
 * @returns {{remainingMinutes: number, progress: number}} 남은 시간(분, 올림)과 진행률(0~1)
 */
export default function useArrivalCountdown({ totalMinutes: mockTotalMinutes, elapsedMinutes, sentAt, arrivesAt }) {
  // 보낸 시각. 서버 값이 없으면(mock) "지난 시간만큼 전"을 처음 한 번만 정해 둔다.
  const [startedAt] = useState(() => (sentAt ? Date.parse(sentAt) : Date.now() - elapsedMinutes * 60_000))
  const totalMinutes = sentAt && arrivesAt ? Math.max((Date.parse(arrivesAt) - startedAt) / 60_000, 1 / 60) : mockTotalMinutes
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(timer)
  }, [])

  const elapsedMs = Math.min(Math.max(now - startedAt, 0), totalMinutes * 60_000)
  const remainingMs = totalMinutes * 60_000 - elapsedMs
  return {
    remainingMinutes: Math.ceil(remainingMs / 60_000),
    progress: elapsedMs / (totalMinutes * 60_000),
  }
}

/** 남은 분을 "5시간 59분", "6시간", "42분"처럼 보여준다. */
export function formatRemaining(minutes) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}분`
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`
}
