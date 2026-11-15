import { Link } from 'react-router-dom'
import Mascot from '../../shared/ui/Mascot.jsx'
import { CHAT_ROUND_TRIP_MAX } from './mailboxMapper.js'
import './ChatCard.css'

/**
 * 대화 중 카드(5-3). 상대 프로필, 상태 배지, 한 줄 설명, 왕복 횟수 점을 보여 준다.
 * 누르면 그 상대와 주고받은 편지(5-15, /pen-pal/:friendId)로 이동한다. 경로는 mapper가 정한다.
 * @param {object} chat mailboxMapper.toChatCard의 결과
 */
function ChatCard({ chat }) {
  const { path, nickname, region, avatarPose, avatarTone, badge, badgeTone, preview, roundTrips, isEnded } = chat

  return (
    <Link to={path} className={`chat-card${isEnded ? ' is-ended' : ''}`}>
      <span className="chat-card__top">
        <span className={`chat-card__avatar chat-card__avatar--${avatarTone}`}>
          <Mascot pose={avatarPose} size={40} />
        </span>
        <span className="chat-card__who">
          <span className="chat-card__name">{nickname}</span>
          {region && <span className="chat-card__region">{region}</span>}
        </span>
        {badge && <span className={`chat-card__badge chat-card__badge--${badgeTone}`}>{badge}</span>}
      </span>

      <span className="chat-card__bottom">
        <span className="chat-card__preview">{preview}</span>
        {roundTrips !== null && (
          <span className="chat-card__trips">
            <span className="chat-card__dots" role="img" aria-label={`왕복 ${roundTrips}번`}>
              {Array.from({ length: CHAT_ROUND_TRIP_MAX }, (_, index) => (
                <span key={index} className={`chat-card__dot${index < roundTrips ? ' is-filled' : ''}`} />
              ))}
            </span>
            <span className="chat-card__trips-label">왕복</span>
          </span>
        )}
      </span>
    </Link>
  )
}

export default ChatCard
