import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'

export const authRoutes = [
  {
    path: '/',
    element: <RoutePlaceholder title="동글" />,
  },
  {
    path: '/intro',
    element: <RoutePlaceholder title="인트로" />,
  },
  {
    path: '/signup/*',
    element: <RoutePlaceholder title="가입" />,
  },
  {
    path: '/login',
    element: <RoutePlaceholder title="로그인" />,
  },
  {
    path: '/home/*',
    element: <RoutePlaceholder title="홈" />,
  },
  {
    path: '/diary/*',
    element: <RoutePlaceholder title="일기" />,
  },
  {
    path: '/notification',
    element: <RoutePlaceholder title="알림" />,
  },
]
