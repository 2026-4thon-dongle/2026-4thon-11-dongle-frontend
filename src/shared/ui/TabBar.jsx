import { NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'
import './TabBar.css'

// 경로는 현재 라우트 기준이다. 일기 쓰기 경로(/diary/write)는 확정되지 않은 가정이므로 바뀌면 여기만 고친다.
const DEFAULT_PATHS = {
  home: '/home',
  write: '/diary/write',
  mailbox: '/mailbox',
  my: '/mypage',
}

/**
 * 하단 탭바. 현재 경로에 맞는 탭이 자동으로 선택 상태가 된다.
 * @param {Partial<typeof DEFAULT_PATHS>} [paths] 탭별 이동 경로. 일부만 바꿀 수 있다.
 */
function TabBar({ paths, className = '' }) {
  const to = { ...DEFAULT_PATHS, ...paths }
  const tabClass = ({ isActive }) => `ui-tabbar__tab${isActive ? ' is-active' : ''}`

  return (
    <nav className={`ui-tabbar ${className}`.trim()} aria-label="주요 메뉴">
      <NavLink to={to.home} className={tabClass}>
        <Icon name="home" />
        <span className="ui-tabbar__label">홈</span>
      </NavLink>
      <NavLink to={to.write} className="ui-tabbar__tab ui-tabbar__tab--write">
        <span className="ui-tabbar__write-button">
          <Icon name="pencil" size={22} />
        </span>
        <span className="ui-tabbar__label">일기 쓰기</span>
      </NavLink>
      <NavLink to={to.mailbox} className={tabClass}>
        <Icon name="letter" />
        <span className="ui-tabbar__label">우체통</span>
      </NavLink>
      <NavLink to={to.my} className={tabClass}>
        <Icon name="cat" />
        <span className="ui-tabbar__label">마이</span>
      </NavLink>
    </nav>
  )
}

export default TabBar
