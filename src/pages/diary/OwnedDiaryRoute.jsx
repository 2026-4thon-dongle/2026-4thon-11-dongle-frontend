import { lazy } from 'react'
const OwnedDiaryWorkspace = lazy(() => import('./OwnedDiaryWorkspace.jsx'))
// 기존 TabBarLayout의 Suspense·Loading·ErrorBoundary를 재사용한다.
export default function OwnedDiaryRoute() { return <OwnedDiaryWorkspace /> }
