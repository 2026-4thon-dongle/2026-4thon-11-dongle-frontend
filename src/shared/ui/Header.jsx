import { useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import './Header.css'

/**
 * 화면 상단 헤더. 왼쪽 뒤로가기, 가운데 제목, 오른쪽 자리.
 * @param {string} title 가운데 제목
 * @param {() => void} [onBack] 뒤로가기 동작. 없으면 브라우저 history 한 칸 뒤로 간다.
 * @param {import('react').ReactNode} [right] 오른쪽에 둘 요소(아이콘 버튼 등). 없으면 빈 자리만 둔다.
 * @param {boolean} [showBack=true] false면 뒤로가기 버튼 자리를 비워 둔다.
 */
function Header({ title, onBack, right, showBack = true, className = '' }) {
  const navigate = useNavigate()
  return (
    <header className={`ui-header ${className}`.trim()}>
      {showBack ? (
        <button
          type="button"
          className="ui-header__side"
          aria-label="뒤로 가기"
          onClick={onBack ?? (() => navigate(-1))}
        >
          <Icon name="back" />
        </button>
      ) : (
        <span className="ui-header__side" />
      )}
      <h1 className="ui-header__title">{title}</h1>
      <div className="ui-header__side">{right}</div>
    </header>
  )
}

export default Header
