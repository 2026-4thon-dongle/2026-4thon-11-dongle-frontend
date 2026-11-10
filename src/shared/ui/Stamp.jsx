import { MOCK_STAMPS } from '../mocks/stamps.js'
import './Stamp.css'

// assets/stamp 아래 폴더(basic, decoration)의 SVG를 파일 이름(확장자 제외)을 id로 모아 둔다.
// 우표를 더 넣으면 자동으로 포함되므로 id(파일 이름)는 폴더가 달라도 겹치면 안 된다.
const files = import.meta.glob('../assets/stamp/*/*.svg', { eager: true, import: 'default' })
const STAMPS = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace('.svg', ''), url]),
)

const BASIC_STAMPS = MOCK_STAMPS.filter((stamp) => stamp.kind === 'basic')

/**
 * 우표. 시안의 우표 컴포넌트처럼 그림 위에 이름 띠와 글자가 붙는다. 원래 크기는 96×120이다.
 * - 기본 우표(basic): 이름 띠 + 왼쪽 위 "동글" + 오른쪽 위 번호(No.01처럼 기본 우표 목록 순서)
 * - 꾸미기 우표(decoration): 이름 띠 + 오른쪽 위 하트
 * 이름과 종류는 shared/mocks/stamps.js에서 id로 찾는다.
 * @param {string} id 우표 id (assets/stamp 아래 파일 이름, 예: 'first-diary')
 * @param {number} [size=96] 가로(px). 높이는 비율(5:4)에 맞춰 정해지고, 글자도 같은 비율로 줄어든다.
 * @param {boolean} [label=true] 이름 띠와 글자를 보일지. false면 그림만 보인다.
 * @param {string} [alt] 의미가 있는 그림이면 설명. 없으면 장식으로 숨긴다.
 */
function Stamp({ id, size = 96, label = true, alt = '', className = '' }) {
  const src = STAMPS[id]
  if (!src) return null

  const info = MOCK_STAMPS.find((stamp) => stamp.id === id)
  const isBasic = info?.kind === 'basic'
  const number = `No.${String(BASIC_STAMPS.findIndex((stamp) => stamp.id === id) + 1).padStart(2, '0')}`

  return (
    <span
      className={`ui-stamp ui-stamp--${info?.kind ?? 'basic'} ${className}`.trim()}
      style={{ width: size, height: (size * 120) / 96 }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <span className="ui-stamp__body" style={{ transform: `scale(${size / 96})` }}>
        <img className="ui-stamp__art" src={src} alt="" width="96" height="120" />
        {label && info && (
          <>
            <span className="ui-stamp__band" />
            <span className="ui-stamp__name">{info.name}</span>
            {isBasic ? (
              <>
                <span className="ui-stamp__brand">동글</span>
                <span className="ui-stamp__number">{number}</span>
              </>
            ) : (
              <span className="ui-stamp__heart">♡</span>
            )}
          </>
        )}
      </span>
    </span>
  )
}

export default Stamp
