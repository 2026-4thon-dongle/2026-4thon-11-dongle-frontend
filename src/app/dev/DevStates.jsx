// 개발 전용 확인 화면 — 공통 상태(로딩·에러)를 눈으로 확인하는 용도
import { useState } from 'react'
import Loading from '../../shared/feedback/Loading.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'

// /preview/loading : 8-1 로딩 화면
export function DevLoading() {
  return <Loading />
}

// /preview/error : 8-2 에러 화면 (다시 시도를 누르면 알림만 띄운다)
export function DevError() {
  const [count, setCount] = useState(0)
  return (
    <ErrorScreen
      hint={count ? `다시 시도를 ${count}번 눌렀어요` : undefined}
      onRetry={() => setCount((value) => value + 1)}
    />
  )
}

// /preview/boundary : 렌더링 중 에러가 나면 ErrorBoundary가 에러 화면을 보여주는지 확인
// 다시 시도를 누르면 에러 상태가 풀리지만, 아래 컴포넌트가 다시 에러를 내므로 에러 화면이 다시 나온다.
export function DevBoundary() {
  throw new Error('ErrorBoundary 확인용 에러')
}
