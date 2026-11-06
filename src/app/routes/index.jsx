import { useRoutes } from 'react-router-dom'
import { authRoutes } from './authRoutes.jsx'
import { letterRoutes } from './letterRoutes.jsx'
import { mailboxRoutes } from './mailboxRoutes.jsx'
import DevPreview from '../dev/DevPreview.jsx' // 개발 전용
import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'

const routes = [
  ...authRoutes,
  ...letterRoutes,
  ...mailboxRoutes,
  { path: '/preview', element: <DevPreview /> }, // 개발 전용
  {
    path: '*',
    element: <RoutePlaceholder title="페이지를 찾을 수 없어요" />,
  },
]

function AppRoutes() {
  return useRoutes(routes)
}

export default AppRoutes
