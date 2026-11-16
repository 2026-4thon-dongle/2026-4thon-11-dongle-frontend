import { useCallback, useEffect, useState } from 'react'

/**
 * 마이 화면의 서버 읽기. { data, error, reload, setData }를 돌려준다.
 * data === null && error === null 이면 불러오는 중이다. 실패하면 error(ApiError)에 담기고 reload()로 다시 시도한다.
 * 삭제·해제처럼 화면 값을 바로 바꿀 때는 setData를 쓴다.
 * @param {() => Promise<any>} load 서버 호출 함수
 * @param {Array} [deps] 이 값이 바뀌면 다시 불러온다
 */
export default function useLoad(load, deps = []) {
  const [state, setState] = useState({ data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ data: null, error: null })
    load()
      .then((data) => {
        if (!cancelled) setState({ data, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, error })
      })
    return () => {
      cancelled = true
    }
    // load는 매 렌더 새로 만들어지므로 deps로만 다시 불러온다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  const setData = useCallback((update) => {
    setState((current) => ({ ...current, data: typeof update === 'function' ? update(current.data) : update }))
  }, [])

  return { ...state, reload, setData }
}
