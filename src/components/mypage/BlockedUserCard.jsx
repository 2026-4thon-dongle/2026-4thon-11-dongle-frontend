import Mascot from '../../shared/ui/Mascot.jsx'
import './BlockedUserCard.css'

/**
 * 차단 목록 카드(7-12). 프로필, 닉네임, 지역·차단한 날, "해제" 버튼.
 * @param {object} user mypageMapper.toBlockedUsers의 한 항목
 * @param {(userId: number) => void} onUnblock "해제"를 눌렀을 때
 */
function BlockedUserCard({ user, onUnblock }) {
  const { userId, nickname, infoLabel, avatarPose, avatarTone } = user

  return (
    <article className="blocked-card">
      <span className={`blocked-card__avatar blocked-card__avatar--${avatarTone}`}>
        <Mascot pose={avatarPose} size={38} />
      </span>
      <div className="blocked-card__who">
        <h2 className="blocked-card__name">{nickname}</h2>
        {infoLabel && <p className="blocked-card__info">{infoLabel}</p>}
      </div>
      <button
        type="button"
        className="blocked-card__release"
        aria-label={`${nickname} 차단 해제`}
        onClick={() => onUnblock(userId)}
      >
        해제
      </button>
    </article>
  )
}

export default BlockedUserCard
