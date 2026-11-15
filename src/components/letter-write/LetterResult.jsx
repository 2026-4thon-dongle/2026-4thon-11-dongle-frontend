import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import nightSky from './assets/night-sky.svg'
import SignatureView from './SignatureView.jsx'
import './Paper.css'
import './LetterResult.css'

/**
 * 편지 완성본(시안 4-6의 뒷배경). 편지지 → 본문(글씨체) → 서명(손글씨·스티커)을 합친 보내기 전 모습이다.
 * 편지지의 색·줄·테두리는 Paper.css를 따르고, 편지 쓰는 카드(LetterCard)와 같은 위치에 줄이 놓인다.
 * 카드 크기는 화면에 맞춰 고정이고, 본문이 길어지면 본문만 스크롤된다. 손글씨는 그린 부분만 잘라 아래 가운데에 둔다.
 * @param {string} paperId 고른 편지지 id (PAPERS의 id)
 * @param {string} recipient 받는 사람 이름 (예: '하늘빛')
 * @param {string} content 본문
 * @param {string} fontFamily 본문과 받는 사람에 쓸 CSS font-family
 * @param {Array} signatureOps draft.signature.ops
 * @param {string} [stampId] 붙일 우표 id. 오른쪽 위에 붙고, 다른 우표를 고르면 바로 바뀐다.
 */
function LetterResult({ paperId = 'basic', recipient, content, fontFamily, signatureOps, stampId }) {
  const hasSignature = signatureOps.length > 0

  return (
    <article className={`paper paper--${paperId} letter-result letter-result--${paperId}`} style={{ fontFamily }}>
      {paperId === 'mascot' && <Mascot pose="face" size={88} className="letter-result__deco letter-result__deco--cat" />}
      {paperId === 'night' && (
        <img className="letter-result__deco letter-result__deco--sky" src={nightSky} alt="" width="108" height="106" />
      )}
      {/* key가 바뀌면 새로 붙는 모션이 다시 나온다. */}
      {stampId && (
        <span key={stampId} className="letter-result__stamp">
          <Stamp id={stampId} size={52} />
        </span>
      )}
      <p className="letter-result__to">To. {recipient}</p>
      {/* 본문이 길면 이 안에서만 스크롤된다. 키보드로도 스크롤할 수 있게 포커스를 받는다. */}
      <div className="letter-result__body" role="region" aria-label="편지 본문" tabIndex={0}>
        {/* 우표가 첫 줄을 가리지 않게 첫 줄 오른쪽을 우표 너비만큼 비워 둔다. */}
        {stampId && <span className="letter-result__stamp-gap" aria-hidden="true" />}
        {content}
      </div>
      {hasSignature && (
        <div className="letter-result__signature">
          <SignatureView ops={signatureOps} fit />
        </div>
      )}
    </article>
  )
}

export default LetterResult
