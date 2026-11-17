import './SettingsInfoCard.css'

/**
 * 설정(7-1-1)의 "정보" 카드. 이용약관 · 개인정보 처리방침 줄을 보여 준다.
 * @param {Array<{id: string, label: string, to: string}>} items mypageMapper.toSettingsHome의 infoItems
 * @param {(item: {id: string, to: string}) => void} onSelect 줄을 누르면 그 항목을 넘겨 준다
 */
function SettingsInfoCard({ items, onSelect }) {
  return (
    <div className="settings-info-card">
      {items.map((item) => (
        <button key={item.id} type="button" className="settings-info-card__row" onClick={() => onSelect(item)}>
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default SettingsInfoCard
