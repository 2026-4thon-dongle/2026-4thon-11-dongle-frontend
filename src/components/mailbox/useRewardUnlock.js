import { useEffect, useState } from 'react'
import { fetchRewardUnlock } from './stampRewardApi.js'

/**
 * 5-13에 보여 줄 보상을 서버에서 받는다. { loading, reward, error, reload }를 돌려준다.
 * reward는 stampRewardMapper.toRewardUnlock의 결과이고, 고를 보상이 없으면 null이다.
 * 결과는 어떤 요청(code, threshold, 시도)의 것인지 같이 두고, 지금 요청과 다르면 아직 불러오는 중이다.
 * @param {{ code?: string|null, threshold?: number|null }} selector
 */
export default function useRewardUnlock({ code = null, threshold = null }) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const requestKey = `${code ?? ''}|${threshold ?? ''}|${attempt}`

  useEffect(() => {
    let cancelled = false
    fetchRewardUnlock({ code, threshold })
      .then((reward) => {
        if (!cancelled) setResult({ key: requestKey, reward, error: null })
      })
      .catch((error) => {
        if (!cancelled) setResult({ key: requestKey, reward: null, error })
      })
    return () => {
      cancelled = true
    }
  }, [code, threshold, requestKey])

  const loaded = result?.key === requestKey ? result : null
  return {
    loading: !loaded,
    reward: loaded?.reward ?? null,
    error: loaded?.error ?? null,
    reload: () => setAttempt((n) => n + 1),
  }
}
