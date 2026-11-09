import Mascot from '../../shared/ui/Mascot.jsx'
import moon from './assets/moon.svg'
import './PaperPreview.css'

// 밤하늘 편지지의 별 위치(미리보기 왼쪽·위쪽 px, 시안 값)
const STARS = [
  [14, 18],
  [34, 34],
  [62, 46],
  [20, 60],
]

/**
 * 편지지 미리보기(80×122). 편지지마다 모양이 달라서 id로 구분한다.
 * 편지 본문 카드에는 쓰지 않고, 편지지 고르기(4-1)의 카드 안에서만 쓴다.
 * @param {string} paperId PAPERS의 id
 */
function PaperPreview({ paperId }) {
  return (
    <div className={`paper-preview paper-preview--${paperId}`} aria-hidden="true">
      {paperId === 'mascot' && <Mascot pose="face" size={39} className="paper-preview__mascot" />}
      {paperId === 'night' && (
        <>
          <img className="paper-preview__moon" src={moon} alt="" width="16" height="16" />
          {STARS.map(([left, top]) => (
            <span key={`${left}-${top}`} className="paper-preview__star" style={{ left, top }} />
          ))}
        </>
      )}
    </div>
  )
}

export default PaperPreview
