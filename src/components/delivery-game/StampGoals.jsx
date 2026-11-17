import Stamp from '../../shared/ui/Stamp.jsx'
import './StampGoals.css'

/**
 * 배달 게임으로 받을 수 있는 꾸미기 우표 8종과 진행 상황(GET /api/game/의 goals).
 * @param {Array<{ stamp: { code: string, name: string }, condition: string, target: number, progress: number, owned: boolean }>} goals
 */
function StampGoals({ goals }) {
  return (
    <ul className="stamp-goals">
      {goals.map((goal) => (
        <li key={goal.stamp.code} className={`stamp-goals__item ${goal.owned ? 'is-owned' : ''}`.trim()}>
          <Stamp id={goal.stamp.code} size={40} label={false} alt={goal.stamp.name} />
          <div className="stamp-goals__text">
            <p className="stamp-goals__name">
              {goal.stamp.name}
              {goal.owned && <span className="stamp-goals__badge">받음</span>}
            </p>
            <p className="stamp-goals__condition">{goal.condition}</p>
            {!goal.owned && goal.target > 1 && (
              <div className="stamp-goals__bar" aria-label={`${goal.progress}/${goal.target}`}>
                <span style={{ width: `${(goal.progress / goal.target) * 100}%` }} />
              </div>
            )}
          </div>
          {!goal.owned && goal.target > 1 && <span className="stamp-goals__count">{goal.progress}/{goal.target}</span>}
        </li>
      ))}
    </ul>
  )
}

export default StampGoals
