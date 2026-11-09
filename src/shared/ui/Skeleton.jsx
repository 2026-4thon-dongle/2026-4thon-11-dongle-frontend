import './Skeleton.css'

/**
 * 로딩 중 자리 표시 블록. 화면마다 필요한 크기로 조합해서 쓴다.
 * 시안 8-1(로딩)이 이 블록으로 만들어져 있다.
 * @param {number|string} [width] 생략하면 부모 너비를 채운다.
 * @param {number|string} [height]
 * @param {number|string} [radius] 둥근 모서리
 * @param {'soft'|'surface'} [tone='soft'] soft: line/soft 색, surface: 흰색 계열(카드 안에 놓을 때)
 */
function Skeleton({ width, height, radius, tone = 'soft', className = '', style }) {
  return (
    <div
      className={`ui-skeleton ui-skeleton--${tone} ${className}`.trim()}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  )
}

export default Skeleton
