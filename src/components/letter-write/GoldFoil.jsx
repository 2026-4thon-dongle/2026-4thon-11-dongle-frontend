import sparkle1 from './assets/gold/sparkle-1.svg'
import sparkle2 from './assets/gold/sparkle-2.svg'
import sparkle3 from './assets/gold/sparkle-3.svg'
import sparkle4 from './assets/gold/sparkle-4.svg'
import sparkle5 from './assets/gold/sparkle-5.svg'
import sparkle6 from './assets/gold/sparkle-6.svg'
import sparkle7 from './assets/gold/sparkle-7.svg'
import dot1 from './assets/gold/dot-1.svg'
import dot2 from './assets/gold/dot-2.svg'
import dot3 from './assets/gold/dot-3.svg'
import './GoldFoil.css'

// 시안 4-1 금박 미리보기(80×122)의 위치와 크기(px, 왼쪽 위 기준). 위치는 %로 바꿔 쓰므로 어떤 크기의 편지지에도 놓인다.
// inset은 그림자(번짐)가 들어 있는 SVG가 칸 밖으로 나온 비율이다.
const BASE_WIDTH = 80
const BASE_HEIGHT = 122
const SPARKLES = [
  { src: sparkle1, left: 5, top: 6, size: 11, inset: -36.36 },
  { src: sparkle2, left: 64, top: 14, size: 7, inset: -57.14 },
  { src: sparkle3, left: 68, top: 98, size: 13, inset: -30.77 },
  { src: sparkle4, left: 12, top: 88, size: 7, inset: -57.14 },
  { src: sparkle5, left: 40, top: 28, size: 5, inset: -80 },
  { src: sparkle6, left: 82, top: 52, size: 8, inset: -50 },
  { src: sparkle7, left: -4, top: 114, size: 6, inset: -66.67 },
]
// 반짝 점(번짐 없음)
const DOTS = [
  { src: dot1, left: 50, top: 6, size: 3 },
  { src: dot1, left: 20, top: 66, size: 3 },
  { src: dot2, left: 62, top: 72, size: 2.5 },
  { src: dot3, left: 8, top: 32, size: 2 },
]

// 테두리 쪽에 더 얹는 다이아몬드 반짝이(편지 본문 카드용). left·top은 편지지 크기의 %, size는 --foil-scale 배 하기 전 px.
const FRAME_SPARKLES = [
  { left: 4, top: 2.5, size: 7 },
  { left: 30, top: 0.5, size: 5 },
  { left: 62, top: 1.5, size: 6 },
  { left: 93, top: 3, size: 8 },
  { left: 97, top: 30, size: 5 },
  { left: 95, top: 62, size: 6 },
  { left: 91, top: 96, size: 7 },
  { left: 58, top: 98.5, size: 5 },
  { left: 28, top: 97, size: 6 },
  { left: 3, top: 93, size: 8 },
  { left: 1.5, top: 62, size: 5 },
  { left: 2.5, top: 32, size: 6 },
]

const toLeft = (px) => `${(px / BASE_WIDTH) * 100}%`
const toTop = (px) => `${(px / BASE_HEIGHT) * 100}%`

/**
 * 금박 편지지의 광택 줄과 반짝이. 편지지(`paper paper--gold`) 안에 넣는다.
 * 크기는 부모의 `--foil-scale`(미리보기 1, 본문 카드는 더 크게)을 따라 커진다.
 * 글씨 뒤(z-index 0)에 깔리고 클릭을 막지 않는다.
 * @param {boolean} shine 광택 줄을 그릴지(기본 true). 본문 카드는 끈다.
 * @param {boolean} frameSparkles 테두리 쪽에 다이아몬드 반짝이를 더 그릴지(기본 false). 본문 카드는 켠다.
 */
function GoldFoil({ shine = true, frameSparkles = false }) {
  return (
    <>
      {/* 광택 줄 두 개: 편지지 안에서만 보이도록 잘라 낸 층 */}
      {shine && (
        <div className="gold-foil__shine" aria-hidden="true">
          <span className="gold-foil__stripe gold-foil__stripe--wide" />
          <span className="gold-foil__stripe gold-foil__stripe--thin" />
        </div>
      )}
      {/* 반짝이: 테두리 밖으로 조금 나온다. */}
      <div className="gold-foil__sparkles" aria-hidden="true">
        {SPARKLES.map(({ src, left, top, size, inset }) => (
          <span
            key={`s${left}-${top}`}
            className="gold-foil__sparkle"
            style={{ left: toLeft(left), top: toTop(top), '--size': size }}
          >
            <img
              src={src}
              alt=""
              style={{ top: `${inset}%`, left: `${inset}%`, width: `${100 - 2 * inset}%`, height: `${100 - 2 * inset}%` }}
            />
          </span>
        ))}
        {frameSparkles &&
          FRAME_SPARKLES.map(({ left, top, size }) => (
            <span
              key={`f${left}-${top}`}
              className="gold-foil__sparkle gold-foil__sparkle--frame"
              style={{ left: `${left}%`, top: `${top}%`, '--size': size }}
            >
              <img src={sparkle1} alt="" style={{ top: '-36.36%', left: '-36.36%', width: '172.72%', height: '172.72%' }} />
            </span>
          ))}
        {DOTS.map(({ src, left, top, size }) => (
          <img
            key={`d${left}-${top}`}
            className="gold-foil__dot"
            src={src}
            alt=""
            style={{ left: toLeft(left), top: toTop(top), '--size': size }}
          />
        ))}
      </div>
    </>
  )
}

export default GoldFoil
