import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'
import MailboxPage from '../../pages/mailbox/MailboxPage.jsx'

export const mailboxRoutes = [
  { path: '/mailbox', element: <MailboxPage /> }, // 5-1 (mock, 문서 레포 API 확정 전)
  // 카드를 누르면 /mailbox/:letterId 로 이동한다(가정). 5-2 이후 화면이 만들어지면 실제 페이지로 바꾼다.
  { path: '/mailbox/:letterId', element: <RoutePlaceholder title="편지" /> },
  {
    path: '/pen-pal/*',
    element: <RoutePlaceholder title="펜팔 친구" />,
  },
  {
    path: '/mypage/*',
    element: <RoutePlaceholder title="마이페이지" />,
  },
]
