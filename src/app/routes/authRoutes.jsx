import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'
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
