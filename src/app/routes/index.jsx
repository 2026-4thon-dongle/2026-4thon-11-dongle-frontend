import { useRoutes } from 'react-router-dom'
import { authRoutes } from './authRoutes.jsx'
import { letterRoutes } from './letterRoutes.jsx'
import { mailboxRoutes } from './mailboxRoutes.jsx'
import DevPreview from '../dev/DevPreview.jsx' // 개발 전용
import { DevLoading, DevError, DevBoundary } from '../dev/DevStates.jsx' // 개발 전용
import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'
import TabBarLayout from '../layouts/TabBarLayout.jsx'

// 모든 라우트를 TabBarLayout이 감싼다. 탭바는 화면이 바뀌어도 유지되고,
// 어느 경로에서 보일지는 layouts/tabBarPaths.js에서 정한다.
const routes = [
  {
    element: <TabBarLayout />,
    children: [
      ...authRoutes,
      ...letterRoutes,
      ...mailboxRoutes,
      { path: '/preview', element: <DevPreview /> }, // 개발 전용
      { path: '/preview/loading', element: <DevLoading /> }, // 개발 전용
      { path: '/preview/error', element: <DevError /> }, // 개발 전용
      { path: '/preview/boundary', element: <DevBoundary /> }, // 개발 전용
      {
        path: '*',
        element: <RoutePlaceholder title="페이지를 찾을 수 없어요" />,
      },
    ],
  },
]

function AppRoutes() {
  return useRoutes(routes)
}

export default AppRoutes
