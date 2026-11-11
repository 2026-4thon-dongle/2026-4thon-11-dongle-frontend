import Mascot from '../../shared/ui/Mascot.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import './RewardPreview.css'

// 시안 5-13 스티커 미리보기(240×168 안, 위치는 시안 값): 표정 5개와 하트 1개.
// x, y는 흰 타원 왼쪽 위, mx, my는 얼굴 그림 왼쪽 위(타원 기준이 아니라 미리보기 기준), w는 얼굴 가로
const STICKERS = [
  { pose: 'face', x: 12, y: 12, mx: 20.4, my: 16.8, w: 52.8 },
  { pose: 'smile', x: 88.8, y: 7.2, mx: 97.2, my: 12, w: 52.8 },
  { pose: 'sleepy', x: 163.2, y: 14.4, mx: 171.6, my: 19.2, w: 52.8 },
  { pose: 'wink', x: 31.2, y: 86.4, mx: 36, my: 91.2, w: 60 },
  { pose: 'shy', x: 110.4, y: 91.2, mx: 115.2, my: 96, w: 60 },
]

/**
 * 보상 해금(5-13)의 보상 미리보기 그림(240×168, 버터 바탕). 마이 우표첩의 RewardThumb를 가져다 쓰지 않고 우체통 안에 따로 만들었다.
 * 'sticker'는 시안의 그림이고, 나머지(paper, collector, postcard)는 시안이 없어 이름만 보이는 간단한 그림으로 근사했다.
 * @param {'sticker'|'paper'|'collector'|'postcard'} kind 보상 종류
 * @param {string} name 보상 이름 (스티커가 아닌 종류의 그림 안에 보인다)
 */
function RewardPreview({ kind, name }) {
  if (kind === 'sticker') {
    return (
      <div className="reward-preview reward-preview--sticker">
        {STICKERS.map((sticker) => (
          <span key={sticker.pose} className="reward-preview__oval" style={{ left: sticker.x, top: sticker.y }}>
            <span className="reward-preview__face" style={{ left: sticker.mx - sticker.x, top: sticker.my - sticker.y }}>
              <Mascot pose={sticker.pose} size={sticker.w} />
            </span>
          </span>
        ))}
        <span className="reward-preview__heart">
          <Icon name="heart" size={28} />
        </span>
      </div>
    )
  }

  return (
    <div className={`reward-preview reward-preview--${kind}`}>
      <span className="reward-preview__sheet">
        <Icon name={kind === 'collector' ? 'stamp' : 'letter'} size={32} />
        <span className="reward-preview__name">{name}</span>
      </span>
    </div>
  )
}

export default RewardPreview
