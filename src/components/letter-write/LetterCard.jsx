import Mascot from '../../shared/ui/Mascot.jsx'
import nightSky from './assets/night-sky.svg'
import './Paper.css'
import './LetterCard.css'

/**
 * 편지 본문 카드(시안 4-2). 고른 편지지 위에 "To. 받는 사람"과 본문을 쓴다.
 * 편지지의 색·줄·테두리는 Paper.css(시안의 편지지 스펙)를 따르고, 장식은 편지지마다 다르다.
 * @param {string} paperId 고른 편지지 id (PAPERS의 id)
 * @param {string} recipient 받는 사람 이름 (예: '하늘빛')
 * @param {string} value 본문
 * @param {(value: string) => void} onChange
 * @param {string} fontFamily 본문과 받는 사람에 쓸 CSS font-family
 * @param {number} maxLength 최대 글자 수
 */
function LetterCard({ paperId = 'basic', recipient, value, onChange, fontFamily, maxLength }) {
  return (
    <div className={`paper paper--${paperId} letter-card letter-card--${paperId}`} style={{ fontFamily }}>
      {paperId === 'mascot' && <Mascot pose="face" size={88} className="letter-card__deco letter-card__deco--cat" />}
      {paperId === 'night' && (
        <img className="letter-card__deco letter-card__deco--sky" src={nightSky} alt="" width="108" height="106" />
      )}
      <p className="letter-card__to">To. {recipient}</p>
      <textarea
        className="letter-card__text"
        value={value}
        maxLength={maxLength}
        placeholder="하고 싶은 이야기를 적어보세요"
        aria-label="편지 본문"
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="letter-card__count">
        {value.length} / {maxLength}
      </p>
    </div>
  )
}

export default LetterCard
