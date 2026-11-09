import Icon from './Icon.jsx'
import './Dropdown.css'

/**
 * 드롭다운 트리거(닫힌 모습). 목록은 쓰는 화면에서 따로 보여준다.
 * @param {string} label 왼쪽 라벨 (예: '글씨체')
 * @param {string} value 선택된 값
 * @param {import('react').CSSProperties} [valueStyle] 값 글자 스타일 (예: 글씨체 미리보기용 fontFamily)
 * @param {boolean} [expanded=false] 목록이 열려 있으면 true
 * @param {() => void} [onClick]
 */
function Dropdown({ label, value, valueStyle, expanded = false, onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`ui-dropdown ${className}`.trim()}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <span className="ui-dropdown__label">{label}</span>
      <span className="ui-dropdown__value" style={valueStyle}>
        {value}
      </span>
      <Icon name="chevron" size={20} className="ui-dropdown__chevron" />
    </button>
  )
}

export default Dropdown
