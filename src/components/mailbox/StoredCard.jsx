import { Link } from 'react-router-dom'
import Stamp from '../../shared/ui/Stamp.jsx'
import './StoredCard.css'

/**
 * 보관 카드(5-7). 읽기만 할 수 있는 편지/대화. 누르면 해당 화면으로 간다(경로는 mapper에서 가정).
 * @param {object} stored mailboxMapper.toStoredCard의 결과
 */
function StoredCard({ stored }) {
  const { name, info, hint, badge, stampId, stampName, stampImageUrl, path } = stored

  return (
    <Link to={path} className="stored-card">
      <span className="stored-card__stamp">
        {stampId ? (
          <Stamp id={stampId} size={49.92} alt={stampName} className="stored-card__stamp-img" />
        ) : (
          stampImageUrl && (
            <img className="stored-card__stamp-img" src={stampImageUrl} width={49.92} alt={stampName} />
          )
        )}
      </span>
      <span className="stored-card__body">
        <span className="stored-card__name">{name}</span>
        <span className="stored-card__info">{info}</span>
        <span className="stored-card__hint">{hint}</span>
      </span>
      <span className="stored-card__badge">{badge}</span>
    </Link>
  )
}

export default StoredCard
