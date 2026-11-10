import { Link } from 'react-router-dom'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import './PenPalCard.css'

/**
 * 펜팔 친구 카드(5-14). 프로필, 닉네임, "지역 · 편지 N통", 최근 시간. 누르면 그 친구와 주고받은 편지(5-15)로 간다.
 * 이동 경로 /pen-pal/:id 는 가정이다.
 * @param {object} friend penPalMapper.toPenPalList의 카드 하나
 */
function PenPalCard({ friend }) {
  const { nickname, infoLabel, agoLabel, avatarPose, avatarTone, to } = friend

  return (
    <Link to={to} className="pen-pal-card">
      <span className={`pen-pal-card__avatar pen-pal-card__avatar--${avatarTone}`}>
        <Mascot pose={avatarPose} size={48} />
      </span>
      <span className="pen-pal-card__who">
        <span className="pen-pal-card__name">{nickname}</span>
        <span className="pen-pal-card__info">{infoLabel}</span>
      </span>
      <span className="pen-pal-card__side">
        <span className="pen-pal-card__ago">{agoLabel}</span>
        <Icon name="chevron" size={20} />
      </span>
    </Link>
  )
}

export default PenPalCard
