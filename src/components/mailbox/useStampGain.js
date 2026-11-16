import { useEffect, useState } from 'react'
import { fetchStampGain } from './stampRewardApi.js'

/**
 * 5-12에 보여 줄 데이터를 받는다. { loading, gain, error, reload }를 돌려준다.
 * input은 라우터 state({ grantedStamps, unlockedRewards })이다. 받은 우표가 없으면 gain이 null이다.
 * 결과에는 어떤 요청(입력, 시도)의 것인지 같이 두고, 지금 요청과 다르면 아직 불러오는 중으로 본다.
 * @param {{ grantedStamps?: object[], unlockedRewards?: object[] }|null} input 같은 입력이면 같은 객체를 넘긴다(location.state)
 */
export default function useStampGain(input) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchStampGain(input)
      .then((gain) => {
        if (!cancelled) setResult({ input, attempt, gain, error: null })
      })
      .catch((error) => {
        if (!cancelled) setResult({ input, attempt, gain: null, error })
      })
    return () => {
      cancelled = true
    }
  }, [input, attempt])

  const loaded = result?.input === input && result?.attempt === attempt ? result : null
  return {
    loading: !loaded,
    gain: loaded?.gain ?? null,
    error: loaded?.error ?? null,
    reload: () => setAttempt((n) => n + 1),
  }
}
