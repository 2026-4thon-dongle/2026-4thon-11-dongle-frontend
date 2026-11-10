import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'
import OwnedDiaryRoute from '../../pages/diary/OwnedDiaryRoute.jsx'
import HomeRoute from '../../pages/home/HomeRoute.jsx'
import DiaryReadRoute from '../../pages/diary/DiaryReadRoute.jsx'
import NotificationRoute from '../../pages/notification/NotificationRoute.jsx'
import FirstDiaryRoute, { SignupCompleteEntry } from '../../pages/diary/FirstDiaryRoute.jsx'
import LoginPage from '../../pages/login/LoginPage.jsx'
import IntroPage, { SplashPage, StartPage } from '../../pages/intro/IntroPage.jsx'
import SignupPage from '../../pages/signup/SignupPage.jsx'

export const authRoutes = [
  {
    path: '/',
    element: <SplashPage />,
  },
  {
    path: '/intro/*',
    element: <IntroPage />,
  },
  {
    path: '/start',
    element: <StartPage />,
  },
  {
    path: '/signup/*',
    element: <SignupPage />,
  },
  {
    path: '/login/*',
    element: <LoginPage />,
  },
  {
    path: '/home/*',
    element: <HomeRoute />,
  },
  {
    path: '/diary/:diaryId',
    element: <DiaryReadRoute />,
  },
  {
    path: '/diary/write',
    element: <OwnedDiaryRoute />,
  },
  {
    path: '/diary/mine/*',
    element: <OwnedDiaryRoute />,
  },
  {
    path: '/diary/published/:diaryId',
    element: <OwnedDiaryRoute />,
  },
  {
    path: '/signup/complete',
    element: <SignupCompleteEntry />,
  },
  {
    path: '/diary/first/*',
    element: <FirstDiaryRoute />,
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
