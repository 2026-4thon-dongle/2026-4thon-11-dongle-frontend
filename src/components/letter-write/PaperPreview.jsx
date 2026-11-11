import Mascot from '../../shared/ui/Mascot.jsx'
import nightSky from './assets/night-sky.svg'
import './Paper.css'
import './PaperPreview.css'

// 줄 위치(미리보기 위쪽 px). 스펙(200×260 예시)의 줄을 세로 0.47배로 줄인 값이다.
// 기본·줄노트·금박은 위에서 19px부터 15px 간격 7줄, 밤하늘은 56px부터 15px 간격 5줄이다.
const lineTops = (first, count) => Array.from({ length: count }, (_, index) => first + index * 15)
const LINES = {
  basic: lineTops(19, 7),
  ruled: lineTops(19, 7),
  gold: lineTops(19, 7),
  night: lineTops(56, 5),
}

// 체크 격자: 14px 칸(스펙은 32px 칸). 세로선은 80px 너비 안에, 가로선은 122px 높이 안에 놓는다.
const GRID_COLUMNS = Array.from({ length: 6 }, (_, index) => index * 14)
const GRID_ROWS = Array.from({ length: 9 }, (_, index) => index * 14)

/**
 * 편지지 미리보기(80×122). 색과 테두리는 Paper.css(시안의 편지지 스펙)를 따르고, 줄과 장식은 편지지마다 다르다.
 * 편지지 고르기(4-1)의 카드 안에서 쓴다. 편지 쓰는 카드는 LetterCard가 같은 스펙으로 그린다.
 * @param {string} paperId PAPERS의 id
 */
function PaperPreview({ paperId }) {
  return (
    <div className={`paper paper--${paperId} paper-preview paper-preview--${paperId}`} aria-hidden="true">
      {/* 줄은 background 그라데이션이 아니라 테두리 한 줄(border)로 그린다. 그라데이션은 화면 배율이 1.25배·1.5배처럼
          정수가 아니면 줄마다 두께가 달라 보이지만, 테두리는 항상 화면 한 칸 두께로 그려진다. */}
      {LINES[paperId] && (
        <div className="paper-preview__lines">
          {LINES[paperId].map((top) => (
            <span key={top} className="paper-preview__line" style={{ top }} />
          ))}
        </div>
      )}
      {paperId === 'check' && (
        <div className="paper-preview__lines">
          {GRID_COLUMNS.map((left) => (
            <span key={`c${left}`} className="paper-preview__grid-column" style={{ left }} />
          ))}
          {GRID_ROWS.map((top) => (
            <span key={`r${top}`} className="paper-preview__grid-row" style={{ top }} />
          ))}
        </div>
      )}
      {paperId === 'mascot' && <Mascot pose="face" size={35} className="paper-preview__mascot" />}
      {paperId === 'night' && (
        <img className="paper-preview__sky" src={nightSky} alt="" width="43" height="42" />
      )}
    </div>
  )
}

export default PaperPreview
