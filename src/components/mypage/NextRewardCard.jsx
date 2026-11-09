import './NextRewardCard.css'

/**
 * 다음 보상 카드(7-4, 7-6). 어떤 보상까지 우표가 몇 개 남았는지 진행 바로 보여 준다.
 * @param {{text: string, current: number, target: number, ratio: number}} reward mypageMapper.toStampCollection의 nextReward
 */
function NextRewardCard({ reward }) {
  const { text, current, target, ratio } = reward

  return (
    <section className="next-reward" aria-label="다음 보상">
      <div className="next-reward__row">
        <p className="next-reward__text">{text}</p>
        <span className="next-reward__count">
          {current} / {target}
        </span>
      </div>
      <div
        className="next-reward__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={current}
      >
        <span className="next-reward__fill" style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
    </section>
  )
}

export default NextRewardCard
