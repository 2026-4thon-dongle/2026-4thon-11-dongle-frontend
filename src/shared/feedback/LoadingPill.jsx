import Mascot from '../ui/Mascot.jsx'
import './LoadingPill.css'

/**
 * "불러오는 중…" 알약(시안 8-1의 알약). 서버를 기다리는 동안 화면이나 자리 가운데에 둔다.
 * 화면 전체가 비는 경우는 fullScreen을 켜면 화면 가운데에 놓인다.
 * 홈 모양의 스켈레톤(Loading)은 라우트 전환용이고, 편지 쓰기·배송 화면처럼 모양이 다른 화면은 이 알약이나 Skeleton 블록으로 만든다.
 * @param {boolean} [fullScreen=false] 화면 전체 높이에서 가운데에 둔다.
 */
function LoadingPill({ fullScreen = false }) {
  return (
    <div
      className={`ui-loading-pill${fullScreen ? ' ui-loading-pill--screen' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="불러오는 중"
    >
      <span className="ui-loading-pill__body">
        <Mascot pose="sleepy" size={34} />
        <span>불러오는 중…</span>
      </span>
    </div>
  )
}

export default LoadingPill
