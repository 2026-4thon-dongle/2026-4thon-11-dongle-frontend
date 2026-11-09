import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'
import HomeRoute from '../../pages/home/HomeRoute.jsx'
import DiaryReadRoute from '../../pages/diary/DiaryReadRoute.jsx'
import NotificationRoute from '../../pages/notification/NotificationRoute.jsx'

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
    element: <HomeRoute />,
  },
  {
    path: '/diary/write',
    element: <RoutePlaceholder title="일기 쓰기" />,
  },
  {
    path: '/diary/:diaryId',
    element: <DiaryReadRoute />,
  },
  {
    path: '/diary/*',
    element: <RoutePlaceholder title="일기" />,
  },
  {
    path: '/notification',
    element: <NotificationRoute />,
  },
]
