import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import './RewardThumb.css'

// 고향이 표정 스티커 미리보기: 표정과 자리(124×86.8 안의 px). 시안 7-8에서 그대로 옮겼다.
const STICKERS = [
  { pose: 'face', left: 6.2, top: 6.2, size: 27.28 },
  { pose: 'smile', left: 45.88, top: 3.72, size: 27.28 },
  { pose: 'sleepy', left: 84.32, top: 7.44, size: 27.28 },
  { pose: 'wink', left: 16.12, top: 44.64, size: 31 },
  { pose: 'shy', left: 57.04, top: 47.12, size: 31 },
]

// 보상 이름이 아니라 그림 모양(kind)으로 나눈다. 시안에 이미지 파일이 없고 여러 도형을 겹친 그림이라 CSS로 근사해서 그렸다.
function Sticker() {
  return (
    <>
      {STICKERS.map((sticker) => (
        <span
          key={sticker.pose}
          className="reward-thumb__bubble"
          style={{ left: sticker.left, top: sticker.top }}
        >
          <Mascot pose={sticker.pose} size={sticker.size} />
        </span>
      ))}
      <span className="reward-thumb__heart" aria-hidden="true">
        ♥
      </span>
    </>
  )
}

function NightPaper() {
  return (
    <>
      <span className="reward-thumb__night" />
      <span className="reward-thumb__moon" />
      <span className="reward-thumb__moon reward-thumb__moon--cut" />
      <span className="reward-thumb__sparkle" style={{ left: 34.7, top: 13.6, fontSize: 7.4 }}>
        ✦
      </span>
      <span className="reward-thumb__sparkle" style={{ left: 59.5, top: 21, fontSize: 5 }}>
        ✦
      </span>
      <span className="reward-thumb__sparkle" style={{ left: 86.8, top: 32.2, fontSize: 3.7 }}>
        ✦
      </span>
      <span className="reward-thumb__night-to">To. 고향</span>
      {[39.7, 49.6, 59.5, 69.4].map((top) => (
        <span key={top} className="reward-thumb__night-line" style={{ top }} />
      ))}
    </>
  )
}

function Collector() {
  return (
    <>
      <span className="reward-thumb__collector-stamp">
        <Stamp id="stamp-collector" size={39.68} />
      </span>
      <span className="reward-thumb__font-card">
        <span className="reward-thumb__font-label">글씨체</span>
        <span className="reward-thumb__font-sample">
          엄마의
          <br />
          손편지
        </span>
      </span>
      <span className="reward-thumb__sparkle reward-thumb__sparkle--gold" style={{ left: 105.4, top: 9.9, fontSize: 6.2 }}>
        ✦
      </span>
    </>
  )
}

function Postcard() {
  return (
    <>
      <span className="reward-thumb__postcard" />
      <span className="reward-thumb__postcard-slot" />
      {[35.9, 45.9, 55.8].map((top) => (
        <span key={top} className="reward-thumb__postcard-line" style={{ top }} />
      ))}
      <span className="reward-thumb__postcard-dear">Dear.</span>
      {[
        [12.4, 12.4],
        [100.4, 12.4],
        [12.4, 65.7],
        [100.4, 65.7],
      ].map(([left, top]) => (
        <span
          key={`${left}-${top}`}
          className="reward-thumb__sparkle reward-thumb__sparkle--gold"
          style={{ left, top, fontSize: 6.2 }}
        >
          ✦
        </span>
      ))}
    </>
  )
}

const THUMBS = { sticker: Sticker, paper: NightPaper, collector: Collector, postcard: Postcard }

/**
 * 수집 보상 미리보기 그림(7-8). 보상 종류(kind)에 따라 다른 그림을 보여 준다. 아직 받지 못한 보상은 흐리게 보인다.
 * @param {'sticker'|'paper'|'collector'|'postcard'} kind
 * @param {boolean} locked 받지 못한 보상이면 true
 */
function RewardThumb({ kind, locked = false }) {
  const Thumb = THUMBS[kind]
  return (
    <div className={`reward-thumb reward-thumb--${kind}${locked ? ' is-locked' : ''}`} aria-hidden="true">
      {Thumb && <Thumb />}
    </div>
  )
}

export default RewardThumb
