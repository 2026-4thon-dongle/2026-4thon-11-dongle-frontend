import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'

export const mailboxRoutes = [
  {
    path: '/mailbox/*',
    element: <RoutePlaceholder title="우체통" />,
  },
  {
    path: '/pen-pal/*',
    element: <RoutePlaceholder title="펜팔 친구" />,
  },
  {
    path: '/mypage/*',
    element: <RoutePlaceholder title="마이페이지" />,
  },
]
