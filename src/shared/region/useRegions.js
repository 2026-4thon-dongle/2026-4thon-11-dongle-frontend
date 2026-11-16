import { useEffect, useState } from 'react'
import { fetchRegions } from '../api/regions.js'
import { buildRegionTree } from './regionTree.js'

// 같은 화면 안에서 지역 선택기를 여러 번 열어도 트리를 다시 만들지 않도록 만들어 둔 값을 기억한다.
let tree = null

/**
 * 서버 지역 트리를 받아 지역 선택기가 쓰는 모양(regionTree.js)으로 준다.
 * 받는 중에는 tree와 error가 모두 null이다. 받지 못하면 error에 서버 에러(ApiError)가 담기고 retry()로 다시 받는다.
 * 서버 없이 목 지역으로 채우지 않는다(지역 id가 서버와 달라 가입·지역 수정이 틀어진다).
 */
export default function useRegions() {
  const [state, setState] = useState({ tree, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (tree) return undefined
    let cancelled = false
    fetchRegions()
      .then((regions) => {
        tree = buildRegionTree(regions)
        if (!cancelled) setState({ tree, error: null })
      })
      .catch((error) => !cancelled && setState({ tree: null, error }))
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = () => {
    setState({ tree: null, error: null })
    setAttempt((value) => value + 1)
  }

  return { ...state, retry }
}
