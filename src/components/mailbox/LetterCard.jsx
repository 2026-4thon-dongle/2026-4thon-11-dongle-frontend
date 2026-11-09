import { Link } from 'react-router-dom'
import Icon from '../../shared/ui/Icon.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import envelopeFold from './assets/envelope-fold.svg'
import './LetterCard.css'

/**
 * 우체통 편지 카드. 누르면 편지 화면으로 이동한다.
 * 이동 경로 /mailbox/:id 는 가정이다(5-2 이후 화면이 정해지면 바꾼다).
 * @param {object} letter mailboxMapper.toLetterCard의 결과
 */
function LetterCard({ letter }) {
  const { id, nickname, subtitle, stampId, stampName, stampImageUrl, travelLabel, arrivedLabel, isRead } = letter

  return (
    <Link to={`/mailbox/${id}`} className="letter-card">
      <span className="letter-card__fold" aria-hidden="true">
        <img src={envelopeFold} alt="" />
      </span>

      <span className="letter-card__stamp">
        {stampId ? (
          <Stamp id={stampId} size={52.48} alt={stampName} className="letter-card__stamp-img" />
        ) : (
          stampImageUrl && (
            <img className="letter-card__stamp-img" src={stampImageUrl} width={52.48} alt={stampName} />
          )
        )}
      </span>

      <span className="letter-card__body">
        <span className="letter-card__name">From. {nickname}</span>
        {subtitle && <span className="letter-card__subtitle">{subtitle}</span>}
        <span className="letter-card__meta">
          <span className="letter-card__pill">
            <Icon name="clock" size={16} />
            {travelLabel}
          </span>
          <span className="letter-card__date">{arrivedLabel}</span>
        </span>
      </span>

      {!isRead && <span className="letter-card__dot" role="img" aria-label="읽지 않음" />}
    </Link>
  )
}

export default LetterCard
