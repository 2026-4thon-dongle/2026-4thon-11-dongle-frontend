import icons from '../assets/icons'
import './Icon.css'

/**
 * 아이콘. 색은 부모의 CSS color를 따른다.
 * @param {string} name 아이콘 이름 (예: 'home', 'letter', 'close')
 * @param {number} [size=24] 가로·세로 px
 * @param {string} [label] 의미가 있는 아이콘이면 접근성 이름. 없으면 장식으로 숨긴다.
 */
function Icon({ name, size = 24, label, className = '' }) {
  const svg = icons[name]
  if (!svg) return null
  return (
    <span
      className={`ui-icon ${className}`.trim()}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default Icon
