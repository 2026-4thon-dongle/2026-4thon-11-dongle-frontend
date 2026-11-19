import useOverlay from '../../shared/hooks/useOverlay.js'
import Button from '../../shared/ui/Button.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import StampGoals from './StampGoals.jsx'
import { REASON_TEXT, formatDuration, regionLabel } from './format.js'
import './GameIntro.css'

/**
 * 편지 한 통 카드. 누르면 그 편지를 고른다(onSelect가 있을 때).
 * maxPerPlay는 한 판으로 줄일 수 있는 최대 시간(별 3개 보상, 초)이다.
 */
function LetterCard({ letter, selected, onSelect, maxPerPlay }) {
  const { game } = letter
  const content = (
    <>
      <span className="game-intro__letter-head">
        <span className="game-intro__letter-to">{letter.direction === 'sent' ? `To. ${letter.partner.nickname}` : `From. ${letter.partner.nickname}`}</span>
        <span className="game-intro__letter-tag">{letter.direction === 'sent' ? '보낸 편지' : '나에게 오는 중'}</span>
      </span>
      <span className="game-intro__letter-route">
        {regionLabel(letter.from_region)} → {regionLabel(letter.to_region)}
      </span>
      <span className="game-intro__letter-meta">
        {game.playable
          ? `도착까지 ${formatDuration(game.remaining_seconds)} · 한 판에 최대 ${formatDuration(Math.min(game.reducible_seconds, maxPerPlay))} 줄여요`
          : REASON_TEXT[game.reason] ?? '지금은 배달할 수 없어요'}
      </span>
    </>
  )
  const className = `game-intro__letter ${selected ? 'is-selected' : ''} ${game.playable ? '' : 'is-disabled'}`.trim()
  if (!onSelect) return <div className={className}>{content}</div>
  return (
    <button type="button" className={className} onClick={() => onSelect(letter.id)} disabled={!game.playable}>
      {content}
    </button>
  )
}

/**
 * 게임 시작 전 화면(9-1 들어가기). 편지를 고르고 규칙·보상을 보여 준다.
 * @param {object} home GET /api/game/ 응답
 * @param {object|null} letter 고른 편지(game 상태 포함). 없으면 배송 중 편지 목록에서 고른다.
 * @param {boolean} busy 시작 요청 중
 * @param {(letterId: number|null) => void} onStart null이면 연습
 * @param {(letterId: number|null) => void} onSelect 편지를 고르거나(null이면) 고르기를 취소한다
 */
function GameIntro({ home, letter, busy, onStart, onSelect }) {
  const { showToast } = useOverlay()
  const { rules, today, goals } = home
  const noToday = today.remaining <= 0
  const ownedCount = goals.filter((goal) => goal.owned).length
  const maxPerPlay = Math.max(...rules.stars.map((rule) => rule.reduce_seconds))

  const handleStart = () => {
    if (!letter) {
      showToast(home.letters.length ? '배달할 편지를 먼저 골라 주세요' : '배달할 편지가 없어요. 연습 게임만 가능해요')
      return
    }
    onStart(letter.id)
  }

  return (
    <div className="game-intro">
      <div className="game-intro__hero">
        <Mascot pose="letter" size={112} />
      </div>
      <h2 className="game-intro__title">고향이랑 직접 배달하기</h2>
      <p className="game-intro__lead">
        {rules.run_seconds}초 동안 좌우로 움직여 우표 조각을 줍고 물웅덩이를 피해요.
        <br />
        잘 배달할수록 편지가 빨리 도착해요.
      </p>

      <section className="game-intro__section" aria-label="배달할 편지">
        <h3 className="game-intro__heading">배달할 편지</h3>
        {letter ? (
          <>
            <LetterCard letter={letter} selected maxPerPlay={maxPerPlay} />
            <p className="game-intro__note">
              이 편지로 {rules.plays_per_letter}번 중 {letter.game.plays_used}번 했어요
              {letter.game.reduced_seconds > 0 && ` · 지금까지 ${formatDuration(letter.game.reduced_seconds)} 줄였어요`}
            </p>
            {home.letters.length > 1 && (
              <button type="button" className="game-intro__link" onClick={() => onSelect(null)}>
                다른 편지 고르기
              </button>
            )}
          </>
        ) : home.letters.length ? (
          <div className="game-intro__letters">
            {home.letters.map((item) => (
              <LetterCard key={item.id} letter={item} onSelect={onSelect} maxPerPlay={maxPerPlay} />
            ))}
          </div>
        ) : (
          <p className="game-intro__empty">배송 중인 편지가 없어요. 연습으로 우표를 모을 수 있어요.</p>
        )}
      </section>

      <section className="game-intro__section" aria-label="별 기준">
        <h3 className="game-intro__heading">별 기준</h3>
        <ul className="game-intro__stars">
          {rules.stars.map((rule) => (
            <li key={rule.stars}>
              <span className="game-intro__star-mark">{'★'.repeat(rule.stars)}{'☆'.repeat(3 - rule.stars)}</span>
              <span className="game-intro__star-rule">
                조각 {Math.round(rule.min_piece_ratio * 100)}% 이상{rule.max_hits !== null && ` · 부딪힘 ${rule.max_hits}번 이하`}
              </span>
              <span className="game-intro__star-reward">-{formatDuration(rule.reduce_seconds)}</span>
            </li>
          ))}
        </ul>
        <p className="game-intro__note">
          한 편지는 배송 시간의 절반까지 줄일 수 있어요(보낸 사람·받는 사람 합쳐서). 오늘 {today.remaining}판 남았어요.
        </p>
      </section>

      <section className="game-intro__section" aria-label="배달 게임 우표">
        <h3 className="game-intro__heading">
          배달 게임 우표 <span className="game-intro__count">{ownedCount}/{goals.length}</span>
        </h3>
        <StampGoals goals={goals} />
      </section>

      <div className="game-intro__actions">
        <Button variant="ghost" onClick={() => onStart(null)} disabled={busy || noToday}>
          연습하기
        </Button>
        <Button onClick={handleStart} disabled={busy || noToday || (letter && !letter.game.playable)}>
          <Icon name="game" size={20} /> 배달 시작
        </Button>
      </div>
      {noToday && <p className="game-intro__warn">오늘은 {today.limit}판을 모두 했어요. 내일 다시 해 주세요.</p>}
    </div>
  )
}

export default GameIntro
