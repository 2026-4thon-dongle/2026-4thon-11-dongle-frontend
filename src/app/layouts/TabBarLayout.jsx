import { Outlet, matchPath, useLocation } from 'react-router-dom'
import TabBar from '../../shared/ui/TabBar.jsx'
import { TAB_BAR_PATHS } from './tabBarPaths.js'
import './TabBarLayout.css'

/**
 * 모든 화면을 감싸는 레이아웃. 탭바를 화면 이동과 상관없이 하나만 유지한다.
 * - 탭바는 tabBarPaths.js에 적힌 경로에서만 보이고, 보일 때만 하단에 탭바 높이만큼 여백을 둔다.
 * - 화면이 바뀌어도 탭바는 다시 만들어지지 않고, 현재 경로에 맞는 탭의 색만 바뀐다.
 */
function TabBarLayout() {
  const { pathname } = useLocation()
  const showTabBar = TAB_BAR_PATHS.some((path) =>
    matchPath({ path, end: !path.endsWith('/*') }, pathname),
  )

  return (
    <>
      <div className={showTabBar ? 'tabbar-layout__content has-tabbar' : undefined}>
        <Outlet />
      </div>
      {showTabBar && <TabBar />}
    </>
  )
}

export default TabBarLayout
