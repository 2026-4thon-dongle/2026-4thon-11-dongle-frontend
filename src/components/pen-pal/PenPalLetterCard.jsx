import Stamp from '../../shared/ui/Stamp.jsx'
import './PenPalLetterCard.css'

/**
 * 주고받은 편지 카드 하나(5-15). 본문 첫 줄(손글씨), 우표, "10.30 보냄" 같은 날짜 줄.
 * 내가 보낸 편지는 오른쪽에 -2도, 일기와 받은 편지는 왼쪽에 2도 기울여 놓는다(시안).
 * @param {object} item penPalMapper.toPenPalLetters의 items 한 개
 */
function PenPalLetterCard({ item }) {
  const { side, preview, dateLabel, stampId } = item

  return (
    <article className={`pen-pal-letter pen-pal-letter--${side}`}>
      <p className="pen-pal-letter__preview">{preview}</p>
      <p className="pen-pal-letter__date">{dateLabel}</p>
      {stampId && (
        <span className="pen-pal-letter__stamp">
          <Stamp id={stampId} size={38} />
        </span>
      )}
    </article>
  )
}

export default PenPalLetterCard
