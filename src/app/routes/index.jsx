import { useRoutes } from 'react-router-dom'
import { authRoutes } from './authRoutes.jsx'
import { letterRoutes } from './letterRoutes.jsx'
import { mailboxRoutes } from './mailboxRoutes.jsx'
import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'

const routes = [
  ...authRoutes,
  ...letterRoutes,
  ...mailboxRoutes,
  {
    path: '*',
    element: <RoutePlaceholder title="페이지를 찾을 수 없어요" />,
  },
]

function AppRoutes() {
  return useRoutes(routes)
}

export default AppRoutes
