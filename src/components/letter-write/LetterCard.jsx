import './LetterCard.css'

/**
 * 편지 본문 카드(시안 4-2). "To. 받는 사람"과 줄 노트 위에 글을 쓴다.
 * @param {string} recipient 받는 사람 이름 (예: '하늘빛')
 * @param {string} value 본문
 * @param {(value: string) => void} onChange
 * @param {string} fontFamily 본문과 받는 사람에 쓸 CSS font-family
 * @param {number} maxLength 최대 글자 수
 */
function LetterCard({ recipient, value, onChange, fontFamily, maxLength }) {
  return (
    <div className="letter-card" style={{ fontFamily }}>
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
