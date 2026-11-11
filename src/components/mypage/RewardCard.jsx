import Icon from '../../shared/ui/Icon.jsx'
import RewardThumb from './RewardThumb.jsx'
import './RewardCard.css'

/**
 * 수집 보상 카드 하나(7-8). 왼쪽 미리보기, 오른쪽에 필요한 우표 개수·보상 이름·상태 배지.
 * 받은 보상은 "✓ 받음", 아직이면 자물쇠와 "n / m 모음"을 보여 준다.
 * @param {{id: string, kind: string, name: string, thresholdLabel: string, received: boolean, progressLabel: string}} reward
 */
function RewardCard({ reward }) {
  const { kind, name, thresholdLabel, received, progressLabel } = reward

  return (
    <article className={`reward-card${received ? ' is-received' : ' is-locked'}`}>
      <RewardThumb kind={kind} locked={!received} />
      <div className="reward-card__text">
        <p className="reward-card__threshold">{thresholdLabel}</p>
        <h3 className="reward-card__name">{name}</h3>
        {received ? (
          <span className="reward-card__badge reward-card__badge--received">✓ 받음</span>
        ) : (
          <span className="reward-card__badge reward-card__badge--progress">{progressLabel}</span>
        )}
      </div>
      {!received && (
        <span className="reward-card__lock" role="img" aria-label="아직 받지 못했어요">
          <Icon name="lock" size={18} />
        </span>
      )}
    </article>
  )
}

export default RewardCard
