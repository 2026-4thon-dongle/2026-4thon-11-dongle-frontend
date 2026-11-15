import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import Button from '../../shared/ui/Button.jsx'
import envelopeFold from './assets/envelope-fold-deep.svg'
import './LetterArrival.css'

/**
 * 새 편지 도착(5-8). 닫힌 봉투와 "봉투 열기" 버튼.
 * 들어올 때 한 번, 봉투 윗면이 뒤로 젖혀지고 편지지가 입구에서 올라왔다가 들어가며 윗면이 닫힌다(CSS 애니메이션, 동작 줄이기면 없음).
 * @param {object} arrival letterReceiveMapper.toLetterArrival의 결과
 * @param {() => void} onOpen "봉투 열기"를 눌렀을 때
 * @param {() => void} onLater "나중에 읽을래요"를 눌렀을 때
 */
function LetterArrival({ arrival, onOpen, onLater }) {
  const { titleLines, routeLabel, stampId, stampName, toLabel } = arrival

  return (
    <div className="letter-arrival">
      <div className="letter-arrival__circle" aria-hidden="true" />

      <h1 className="letter-arrival__title">
        {titleLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h1>
      <p className="letter-arrival__route">{routeLabel}</p>

      <div className="letter-arrival__scene">
        <Mascot pose="heart" size={120} className="letter-arrival__mascot" />
        {/* 봉투 안 편지지: 봉투가 열리면 입구에서 올라온다. 봉투 몸통 앞면(아래 envelope)이 아랫부분을 가린다 */}
        <span className="letter-arrival__sheet" aria-hidden="true" />
        <div className="letter-arrival__envelope">
          <span className="letter-arrival__fold" aria-hidden="true">
            <img src={envelopeFold} alt="" />
          </span>
          {stampId && <Stamp id={stampId} size={51} alt={stampName} className="letter-arrival__stamp" />}
          <span className="letter-arrival__seal" aria-hidden="true">
            <Icon name="heart" size={20} />
          </span>
          <span className="letter-arrival__to">{toLabel}</span>
        </div>
      </div>

      <div className="letter-arrival__actions">
        <Button onClick={onOpen}>봉투 열기</Button>
        <button type="button" className="letter-arrival__later" onClick={onLater}>
          나중에 읽을래요
        </button>
      </div>
    </div>
  )
}

export default LetterArrival
