import Button from '../../shared/ui/Button.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import { formatArrival, formatDuration } from './format.js'
import './GameResult.css'

function subtitle(result, practice) {
  if (!result.success) return '조각을 조금 더 모으면 배달에 성공해요'
  if (practice) return '연습이라 도착 시간은 그대로예요'
  if (result.reduced_seconds > 0) return `고향이 덕분에 편지가 ${formatDuration(result.reduced_seconds)} 빨리 도착해요`
  return '더 줄일 수 있는 시간이 없어 도착 시간은 그대로예요'
}

/**
 * 9-2 배달 결과. 별, 줄어든 시간, 받은 우표와 열린 수집 보상을 보여 준다.
 * @param {object} result 결과 응답(POST /api/game/runs/{id}/finish/)
 * @param {boolean} practice 연습 판이었는지
 * @param {() => void} onAgain 한 판 더 하기
 * @param {{ label: string, onClick: () => void }} primary 오른쪽 큰 버튼
 */
function GameResult({ result, practice, onAgain, primary }) {
  const rows = [
    ...result.granted_stamps.map((stamp) => ({
      key: `stamp-${stamp.code}`,
      icon: <Stamp id={stamp.code} size={30} label={false} />,
      tone: 'sage',
      label: `${stamp.name} 우표`,
      value: '×1',
    })),
    ...(practice || !result.success
      ? []
      : [{ key: 'time', icon: <Icon name="clock" size={22} />, tone: 'sky', label: '배송 시간 단축', value: formatDuration(result.reduced_seconds) }]),
    { key: 'pieces', icon: <Icon name="stamp" size={22} />, tone: 'peach', label: '주운 우표 조각', value: `${result.pieces}/${result.piece_total}` },
    { key: 'hits', icon: <Icon name="close" size={22} />, tone: 'peach', label: '물웅덩이', value: `${result.hits}번` },
    ...result.unlocked_rewards.map((reward) => ({
      key: `reward-${reward.code}`,
      icon: <Icon name="sparkle" size={22} />,
      tone: 'peach',
      label: `${reward.name} 열림`,
      value: 'NEW',
    })),
  ]

  return (
    <div className={`game-result ${result.success ? 'is-success' : 'is-fail'}`}>
      <div className="game-result__confetti" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="game-result__hero">
        <Mascot pose={result.success ? 'smile' : 'teary'} size={150} />
      </div>
      <p className="game-result__stars" aria-label={`별 ${result.stars}개`}>
        {'★'.repeat(result.stars)}
        <span>{'☆'.repeat(3 - result.stars)}</span>
      </p>
      <h2 className="game-result__title">{result.success ? (result.perfect ? '완벽한 배달!' : '배달 성공!') : '배달 실패…'}</h2>
      <p className="game-result__subtitle">{subtitle(result, practice)}</p>
      {result.letter && result.letter.remaining_seconds > 0 && (
        <p className="game-result__arrival">
          도착 예정 {formatArrival(result.letter.arrives_at)} · {formatDuration(result.letter.remaining_seconds)} 남음
        </p>
      )}

      <ul className="game-result__rows">
        {rows.map((row) => (
          <li key={row.key} className="game-result__row">
            <span className={`game-result__icon game-result__icon--${row.tone}`}>{row.icon}</span>
            <span className="game-result__label">{row.label}</span>
            <span className="game-result__value">{row.value}</span>
          </li>
        ))}
      </ul>

      <div className="game-result__actions">
        <Button variant="ghost" onClick={onAgain}>
          한 판 더 하기
        </Button>
        <Button onClick={primary.onClick}>{primary.label}</Button>
      </div>
    </div>
  )
}

export default GameResult
