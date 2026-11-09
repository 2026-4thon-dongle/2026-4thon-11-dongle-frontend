// assets/stamp 안의 SVG를 파일 이름(확장자 제외)을 id로 모아 둔다. 우표를 더 넣으면 자동으로 포함된다.
const files = import.meta.glob('../assets/stamp/*.svg', { eager: true, import: 'default' })
const STAMPS = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace('.svg', ''), url]),
)

/**
 * 우표 그림. 원래 비율은 96×120이다.
 * @param {string} id 우표 id (assets/stamp의 파일 이름, 예: 'first-diary')
 * @param {number} [size=96] 가로(px). 높이는 비율에 맞춰 자동으로 정해진다.
 * @param {string} [alt] 의미가 있는 그림이면 설명. 없으면 장식으로 숨긴다.
 */
function Stamp({ id, size = 96, alt = '', className }) {
  const src = STAMPS[id]
  if (!src) return null
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      width={size}
      style={{ height: 'auto' }}
    />
  )
}

export default Stamp
