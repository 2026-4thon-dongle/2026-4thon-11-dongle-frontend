import { Suspense } from 'react'
import { Outlet, matchPath, useLocation } from 'react-router-dom'
import TabBar from '../../shared/ui/TabBar.jsx'
import Loading from '../../shared/feedback/Loading.jsx'
import ErrorBoundary from '../../shared/feedback/ErrorBoundary.jsx'
import { TAB_BAR_PATHS } from './tabBarPaths.js'
import './TabBarLayout.css'

/**
 * 모든 화면을 감싸는 레이아웃. 탭바를 화면 이동과 상관없이 하나만 유지한다.
 * - 탭바는 tabBarPaths.js에 적힌 경로에서만 보이고, 보일 때만 하단에 탭바 높이만큼 여백을 둔다.
 * - 화면이 바뀌어도 탭바는 다시 만들어지지 않고, 현재 경로에 맞는 탭의 색만 바뀐다.
 * - 화면 영역에는 로딩(Suspense → Loading)과 에러(ErrorBoundary → ErrorScreen)를 건다.
 *   ErrorBoundary는 경로가 바뀌면 새로 시작해서, 에러 화면에서 다른 화면으로 이동하면 풀린다.
 */
function TabBarLayout() {
  const { pathname } = useLocation()
  const showTabBar = TAB_BAR_PATHS.some((path) =>
    matchPath({ path, end: !path.endsWith('/*') }, pathname),
  )

  return (
    <>
      <div className={showTabBar ? 'tabbar-layout__content has-tabbar' : undefined}>
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>
      {showTabBar && <TabBar />}
    </>
  )
}

export default TabBarLayout
