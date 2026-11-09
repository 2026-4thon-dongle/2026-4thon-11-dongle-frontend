import { Link } from 'react-router-dom'
import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import './ShippingCard.css'

/**
 * 배송 중 카드(5-5). 우표, 상대와 경로, 진행 바(고향이가 달리는 중), 남은 시간, "지도 보기".
 * "지도 보기"는 다른 담당 화면(4-12)으로 간다. 경로 /delivery/:id/map 은 가정이다.
 * @param {object} shipping mailboxMapper.toShippingCard의 결과
 */
function ShippingCard({ shipping }) {
  const { name, route, stampId, stampName, stampImageUrl, progress, remainingLabel, mapPath } = shipping
  const percent = `${Math.round(progress * 100)}%`

  return (
    <article className="shipping-card">
      <div className="shipping-card__head">
        <span className="shipping-card__stamp">
          {stampId ? (
            <Stamp id={stampId} size={48} alt={stampName} className="shipping-card__stamp-img" />
          ) : (
            stampImageUrl && (
              <img className="shipping-card__stamp-img" src={stampImageUrl} width={48} alt={stampName} />
            )
          )}
        </span>
        <span className="shipping-card__who">
          <span className="shipping-card__name">{name}</span>
          <span className="shipping-card__route">{route}</span>
        </span>
        <Link to={mapPath} className="shipping-card__map">
          지도 보기 ›
        </Link>
      </div>

      <div
        className="shipping-card__bar"
        role="progressbar"
        aria-label="배송 진행률"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <span className="shipping-card__fill" style={{ width: percent }} />
        <span className="shipping-card__rider" style={{ left: `calc(${percent} - 10px)` }}>
          <Mascot pose="face" size={34} />
        </span>
      </div>

      <p className="shipping-card__remaining">{remainingLabel}</p>
    </article>
  )
}

export default ShippingCard
