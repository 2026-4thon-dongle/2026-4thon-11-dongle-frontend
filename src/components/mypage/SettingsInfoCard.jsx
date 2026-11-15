import './SettingsInfoCard.css'

/**
 * 설정(7-1-1)의 "정보" 카드. 이용약관·문의하기처럼 아직 연결된 화면이 없는 줄을 보여 준다.
 * @param {Array<{id: string, label: string}>} items mypageMapper.toSettingsHome의 infoItems
 * @param {(id: string) => void} onSelect 줄을 누르면 id를 넘겨 준다
 */
function SettingsInfoCard({ items, onSelect }) {
  return (
    <div className="settings-info-card">
      {items.map((item) => (
        <button key={item.id} type="button" className="settings-info-card__row" onClick={() => onSelect(item.id)}>
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default SettingsInfoCard
