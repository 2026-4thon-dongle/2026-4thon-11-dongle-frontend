import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import './StampGainScene.css'

// 반짝이 4개: 시안(360 기준) 왼쪽 위치와, 장면 위쪽(시안 y=206)에서 잰 위쪽 위치
const SPARKLES = [
  { x: 96, y: 4 },
  { x: 262, y: 30 },
  { x: 250, y: 162 },
  { x: 84, y: 144 },
]

/**
 * 우표 획득(5-12)의 가운데 그림: 흰 배경 원 위의 큰 우표, 반짝이 4개, "모은 우표 N개 · 보상까지 M개" 알약, 인사하는 고향이.
 * 가운데 기준으로 시안 위치를 옮겼다(장면 높이 318 = 시안 y 206~524).
 * 우표 아래 이름 띠는 Stamp 그림에 들어 있는 것을 그대로 쓴다.
 * @param {string} stampId 우표 id
 * @param {string} stampName 우표 이름
 * @param {string} progressLabel 알약 문구
 */
function StampGainScene({ stampId, stampName, progressLabel }) {
  return (
    <div className="stamp-gain">
      <span className="stamp-gain__halo" aria-hidden="true" />
      <span className="stamp-gain__stamp">
        <Stamp id={stampId} size={140} alt={stampName} />
      </span>
      {SPARKLES.map((sparkle) => (
        <span
          key={sparkle.x}
          className="stamp-gain__sparkle"
          style={{ top: sparkle.y, left: `calc(50% + ${sparkle.x - 180}px)` }}
        >
          <Icon name="sparkle" size={26} />
        </span>
      ))}
      <p className="stamp-gain__progress">{progressLabel}</p>
      <Mascot pose="greeting" size={92} className="stamp-gain__mascot" />
    </div>
  )
}

export default StampGainScene
