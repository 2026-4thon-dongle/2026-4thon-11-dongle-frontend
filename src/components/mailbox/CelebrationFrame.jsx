import './CelebrationFrame.css'

/**
 * 우표 획득(5-12)과 보상 해금(5-13)이 함께 쓰는 틀. 버터 바탕 전체 화면에 꾸밈 점, 큰 제목과 설명, 가운데 내용, 아래 버튼 영역.
 * 위치는 시안(360 기준, 프레임 위쪽부터 잰 값)을 따르고, 가로는 가운데 기준으로 맞춘다.
 * @param {string} title 큰 제목
 * @param {number} titleTop 제목 위쪽 위치(시안 값. 5-12는 96, 5-13은 104)
 * @param {import('react').ReactNode} description 제목 아래 설명
 * @param {{x:number, y:number, size:number, color:string}[]} [dots] 꾸밈 점(시안의 left, top, 지름, 색)
 * @param {boolean} [hill] 아래쪽 복숭아색 언덕(5-12만). 시안은 360 화면에 480 원을 y=420에 둔 것이다.
 * @param {import('react').ReactNode} children 가운데 내용
 * @param {import('react').ReactNode} actions 아래 버튼들
 */
function CelebrationFrame({ title, titleTop, description, dots = [], hill = false, children, actions }) {
  return (
    <div className="celebration" style={{ '--title-top': `${titleTop}px` }}>
      {hill && <div className="celebration__hill" aria-hidden="true" />}
      {dots.map((dot) => (
        <span
          key={`${dot.x}-${dot.y}`}
          className="celebration__dot"
          aria-hidden="true"
          style={{
            top: dot.y,
            left: `calc(50% + ${dot.x - 180}px)`,
            width: dot.size,
            height: dot.size,
            background: dot.color,
          }}
        />
      ))}

      <h1 className="celebration__title">{title}</h1>
      <div className="celebration__description">{description}</div>

      <div className="celebration__content">{children}</div>

      <div className="celebration__actions">{actions}</div>
    </div>
  )
}

export default CelebrationFrame
