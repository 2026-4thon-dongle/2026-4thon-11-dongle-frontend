import { createElement, lazy } from 'react'

// 개발·QA용 확인 화면(/preview/*). 우표 1장, 소인 연출, 로딩·에러 등 드문 상태를 눈으로 본다.
// 개발 서버(npm run dev)에서는 항상 열린다. 빌드에서는 VITE_ENABLE_PREVIEW=true로 빌드했을 때만 등록하고,
// 꺼진 빌드에는 라우트도 화면 코드도 들어가지 않는다(주소를 직접 열면 "페이지를 찾을 수 없어요").
const enabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_PREVIEW === 'true'

// 화면은 필요할 때만 받도록 lazy로 나눈다. TabBarLayout의 Suspense가 받는 동안 로딩을 보여 준다.
const dev = (name) => lazy(() => import('../dev/DevStates.jsx').then((module) => ({ default: module[name] })))

function buildRoutes() {
  const screens = [
    ['/preview', lazy(() => import('../dev/DevPreview.jsx'))],
    ['/preview/loading', dev('DevLoading')],
    ['/preview/error', dev('DevError')],
    ['/preview/boundary', dev('DevBoundary')],
    ['/preview/stamping', dev('DevStamping')],
    ['/preview/delivery-map', lazy(() => import('../dev/DevDeliveryMap.jsx'))],
    ['/preview/stamp-sheet', dev('DevStampSheet')],
    ['/preview/diary-reply', dev('DevDiaryReply')],
    ['/preview/gold-paper', dev('DevGoldPaper')],
  ]
  return screens.map(([path, screen]) => ({ path, element: createElement(screen) }))
}

export const previewRoutes = enabled ? buildRoutes() : []
