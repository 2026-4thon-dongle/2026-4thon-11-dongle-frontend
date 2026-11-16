import { useEffect, useState } from 'react'
import { fetchLetterMaterials } from './letterApi.js'

// 편지 재료(편지지·글씨체·스티커·우표)는 편지 쓰기 동안 거의 바뀌지 않아 한 번 받아 두고 같이 쓴다.
// 실패하면 다음에 다시 받는다. 성공한 값은 새로고침 전까지 쓴다.
let cached = null
let pending = null

/** 편지 재료를 받는다. 이미 받았으면 받아 둔 값을, 받는 중이면 같은 요청을 기다린다. */
export function loadLetterMaterials() {
  if (cached) return Promise.resolve(cached)
  if (!pending) {
    pending = fetchLetterMaterials()
      .then((materials) => {
        cached = materials
        return materials
      })
      .finally(() => {
        pending = null
      })
  }
  return pending
}

/** 서버 항목(code, unlocked, unlock_condition …)을 code로 찾는다. 재료를 못 받았거나 없는 code면 undefined. */
export const findMaterial = (list, code) => list?.find((item) => item.code === code)

/**
 * 편지 재료를 받아 화면에 준다.
 * - materials: 서버 응답({ stationeries, fonts, stickers, stamps }). 받는 중이거나 실패하면 null이다.
 * - error: 실패했을 때의 LetterApiError. 없으면 null. 받는 중에는 materials와 error가 모두 null이다.
 * - retry(): 실패한 뒤 처음부터 다시 받는다.
 */
export default function useLetterMaterials() {
  const [state, setState] = useState({ materials: cached, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (cached) return undefined
    let cancelled = false
    loadLetterMaterials()
      .then((materials) => !cancelled && setState({ materials, error: null }))
      .catch((error) => !cancelled && setState({ materials: null, error }))
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = () => {
    setState({ materials: null, error: null })
    setAttempt((value) => value + 1)
  }

  return { ...state, retry }
}
