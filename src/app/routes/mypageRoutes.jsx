import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'
import MyPage from '../../pages/mypage/MyPage.jsx'
import DraftsPage from '../../pages/mypage/DraftsPage.jsx'
import StampBookPage from '../../pages/mypage/StampBookPage.jsx'

// 07 마이 · 우표첩 라우트. 경로 목록은 components/mypage/mypagePaths.js와 같아야 한다.
// mailboxRoutes.jsx에 있는 `/mypage/*` 자리 표시는 그대로 둔다. React Router는 구체적인 경로(`/mypage`, `/mypage/drafts` 등)를
// `/mypage/*`보다 먼저 고르므로, 이 파일에 없는 마이 하위 경로에서만 그 자리 표시가 나온다.
export const mypageRoutes = [
  { path: '/mypage', element: <MyPage /> }, // 7-1
  { path: '/mypage/drafts', element: <DraftsPage /> }, // 7-3
  { path: '/mypage/stamps', element: <StampBookPage /> }, // 7-4, 7-5, 7-6 (7-7 상세는 같은 경로의 바텀시트로 묶음 3에서)
  // 아래는 화면이 만들어질 때까지 임시 화면이다(경로는 가정).
  { path: '/mypage/settings', element: <RoutePlaceholder title="설정" /> }, // 7-1 설정 아이콘 (시안에 화면 없음)
  { path: '/mypage/stamps/rewards', element: <RoutePlaceholder title="수집 보상" /> }, // 7-8 (묶음 3에서 구현)
  { path: '/mypage/regions', element: <RoutePlaceholder title="지역 설정" /> }, // 7-10
  { path: '/mypage/notifications', element: <RoutePlaceholder title="알림 · 편지 설정" /> }, // 7-11
]
