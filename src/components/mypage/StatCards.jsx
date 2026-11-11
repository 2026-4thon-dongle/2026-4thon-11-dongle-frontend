import './StatCards.css'

/**
 * 숫자 카드 3개(7-1): 고향 일기, 편지, 우표.
 * @param {Array<{id: string, value: number, label: string}>} stats mypageMapper.toMyPage의 stats
 */
function StatCards({ stats }) {
  return (
    <ul className="stat-cards" aria-label="내 활동">
      {stats.map((stat) => (
        <li key={stat.id} className="stat-cards__card">
          <span className="stat-cards__value">{stat.value}</span>
          <span className="stat-cards__label">{stat.label}</span>
        </li>
      ))}
    </ul>
  )
}

export default StatCards
