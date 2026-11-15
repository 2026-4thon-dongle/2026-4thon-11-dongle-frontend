import { Link } from 'react-router-dom'
import Icon from '../../shared/ui/Icon.jsx'
import './MenuList.css'

/**
 * 마이의 메뉴 카드(7-1). 줄마다 아이콘, 이름, 오른쪽 값, 화살표가 있고 누르면 해당 화면으로 간다.
 * @param {Array<{id: string, icon: string, label: string, value: string, to: string}>} items mypageMapper.toMyPage의 menu (설정 7-1-1도 같은 모양을 쓴다)
 * @param {string} [ariaLabel] 스크린 리더용 이름
 */
function MenuList({ items, ariaLabel = '마이 메뉴' }) {
  return (
    <nav className="menu-list" aria-label={ariaLabel}>
      {items.map((item) => (
        <Link key={item.id} to={item.to} className="menu-list__row">
          <span className="menu-list__icon">
            <Icon name={item.icon} size={22} />
          </span>
          <span className="menu-list__label">{item.label}</span>
          {item.value && <span className="menu-list__value">{item.value}</span>}
          <Icon name="chevron" size={18} className="menu-list__chevron" />
        </Link>
      ))}
    </nav>
  )
}

export default MenuList
