import { lazy } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const FirstDiaryPage = lazy(() => import('./FirstDiaryPage.jsx'))

// 공용 TabBarLayout의 Suspense·ErrorBoundary를 그대로 사용한다.
export default function FirstDiaryRoute() {
  return <FirstDiaryPage />
}

export function SignupCompleteEntry() {
  const { state } = useLocation()
  return <Navigate to="/diary/first" replace state={state} />
}
