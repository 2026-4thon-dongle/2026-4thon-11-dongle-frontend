import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import './ProfileCard.css'

/**
 * 마이 맨 위 프로필 카드(7-1). 고향이, 닉네임, 학교 인증, 편지에 적히는 이름.
 * @param {{nickname: string, schoolLabel: string, letterSignature: string}} profile mypageMapper.toMyPage의 일부
 */
function ProfileCard({ profile }) {
  const { nickname, schoolLabel, letterSignature } = profile

  return (
    <section className="profile-card" aria-label="내 프로필">
      <span className="profile-card__avatar">
        <Mascot pose="smile" size={60} />
      </span>
      <div className="profile-card__info">
        <h2 className="profile-card__name">{nickname}</h2>
        {schoolLabel && (
          <span className="profile-card__school">
            <Icon name="check" size={18} />
            {schoolLabel}
          </span>
        )}
        <p className="profile-card__signature">{letterSignature}</p>
      </div>
    </section>
  )
}

export default ProfileCard
