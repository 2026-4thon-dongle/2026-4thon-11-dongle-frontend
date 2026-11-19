import { Link } from 'react-router-dom'
import Stamp from '../../shared/ui/Stamp.jsx'
import './PenPalLetterCard.css'

function PenPalLetterCard({ item }) {
  const { side, preview, dateLabel, stampId, linkPath } = item

  const bubble = (
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

  return (
    <div className={`pen-pal-letter-wrap pen-pal-letter-wrap--${side}`}>
      {linkPath ? (
        <Link to={linkPath} className="pen-pal-letter-wrap__link">
          {bubble}
          <span className="pen-pal-letter-wrap__more">원문 보기 ›</span>
        </Link>
      ) : (
        bubble
      )}
    </div>
  )
}

export default PenPalLetterCard
