import Icon from './Icon.jsx'
import './RegionChip.css'

/**
 * 지역 칩. 핀 아이콘 + 지역 이름.
 * @param {string} region 지역 이름 (예: '서울')
 * @param {() => void} [onClick] 있으면 버튼으로 렌더링한다.
 */
function RegionChip({ region, onClick, className = '' }) {
  const classes = `ui-region-chip ${className}`.trim()
  const content = (
    <>
      <Icon name="pin" size={16} />
      <span>{region}</span>
    </>
  )
  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {content}
      </button>
    )
  }
  return <span className={classes}>{content}</span>
}

export default RegionChip
