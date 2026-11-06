import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'

export const letterRoutes = [
  {
    path: '/letter-write/*',
    element: <RoutePlaceholder title="편지 쓰기" />,
  },
  {
    path: '/delivery/*',
    element: <RoutePlaceholder title="배송" />,
  },
  {
    path: '/delivery-game',
    element: <RoutePlaceholder title="직접 배달하기" />,
  },
  {
    path: '/stamp-make',
    element: <RoutePlaceholder title="우표 만들기" />,
  },
]
