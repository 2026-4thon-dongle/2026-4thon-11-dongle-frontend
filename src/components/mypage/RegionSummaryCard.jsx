import Icon from '../../shared/ui/Icon.jsx'
import RegionChip from '../../shared/ui/RegionChip.jsx'
import './RegionSummaryCard.css'

/**
 * 지역 설정(7-10)의 지역 카드. 왼쪽에 지역 칩(예: "3곳", "서울"), 가운데에 지역 이름, 오른쪽에 화살표. 누르면 지역을 고르는 시트가 열린다.
 * @param {string} chipLabel 칩에 쓰는 글씨
 * @param {string} label 지역 이름 (예: "천안 · 아산 · 대전")
 * @param {string} ariaLabel 스크린 리더용 이름 (예: "본가 지역 고르기")
 * @param {() => void} onClick
 */
function RegionSummaryCard({ chipLabel, label, ariaLabel, onClick }) {
  return (
    <button type="button" className="region-card" aria-label={`${ariaLabel}: ${label}`} onClick={onClick}>
      <RegionChip region={chipLabel} />
      <span className="region-card__label">{label}</span>
      <Icon name="chevron" size={20} className="region-card__chevron" />
    </button>
  )
}

export default RegionSummaryCard
