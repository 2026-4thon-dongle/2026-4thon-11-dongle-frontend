import MyPage from '../../pages/mypage/MyPage.jsx'
import DraftsPage from '../../pages/mypage/DraftsPage.jsx'
import StampBookPage from '../../pages/mypage/StampBookPage.jsx'
import StampRewardsPage from '../../pages/mypage/StampRewardsPage.jsx'
import NicknamePage from '../../pages/mypage/NicknamePage.jsx'
import RegionsPage from '../../pages/mypage/RegionsPage.jsx'
import NotificationsPage from '../../pages/mypage/NotificationsPage.jsx'
import BlocksPage from '../../pages/mypage/BlocksPage.jsx'
import AccountPage from '../../pages/mypage/AccountPage.jsx'
import SettingsPage from '../../pages/mypage/SettingsPage.jsx'

// 07 마이 · 우표첩 라우트. 경로 목록은 components/mypage/mypagePaths.js와 같아야 한다.
// mailboxRoutes.jsx에 있는 `/mypage/*` 자리 표시는 그대로 둔다. React Router는 구체적인 경로(`/mypage`, `/mypage/drafts` 등)를
// `/mypage/*`보다 먼저 고르므로, 이 파일에 없는 마이 하위 경로에서만 그 자리 표시가 나온다.
export const mypageRoutes = [
  { path: '/mypage', element: <MyPage /> }, // 7-1
  { path: '/mypage/drafts', element: <DraftsPage /> }, // 7-3
  { path: '/mypage/stamps', element: <StampBookPage /> }, // 7-4, 7-5, 7-6, 그리고 같은 경로 위의 바텀시트 7-7
  { path: '/mypage/stamps/rewards', element: <StampRewardsPage /> }, // 7-8
  { path: '/mypage/settings', element: <SettingsPage /> }, // 7-1-1 (7-1의 설정 아이콘). 아래 7-9~7-13으로 들어가는 목록이다.
  // 7-9, 7-12, 7-13은 설정 화면에서 들어온다. 7-10, 7-11은 7-1의 "지역 수정 ›", "알림 · 편지 쉬기"에서도 온다.
  { path: '/mypage/nickname', element: <NicknamePage /> }, // 7-9
  { path: '/mypage/regions', element: <RegionsPage /> }, // 7-10
  { path: '/mypage/notifications', element: <NotificationsPage /> }, // 7-11
  { path: '/mypage/blocks', element: <BlocksPage /> }, // 7-12
  { path: '/mypage/account', element: <AccountPage /> }, // 7-13 (확인 다이얼로그는 ?dialog=withdraw 로 열린 채 시작할 수 있다)
]
