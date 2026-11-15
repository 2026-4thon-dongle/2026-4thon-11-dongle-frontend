import Mascot from '../../shared/ui/Mascot.jsx'
import nightSky from './assets/night-sky.svg'
import SignatureView from './SignatureView.jsx'
import './Paper.css'
import './LetterResult.css'

/**
 * 편지 완성본(시안 4-6의 뒷배경). 편지지 → 본문(글씨체) → 서명(손글씨·스티커)을 합친 보내기 전 모습이다.
 * 편지지의 색·줄·테두리는 Paper.css를 따르고, 편지 쓰는 카드(LetterCard)와 같은 위치에 줄이 놓인다.
 * 편지지는 본문이 길어지면 같이 길어지고(화면 전체가 스크롤된다), 손글씨는 본문 끝에 그린 부분만 잘라 가운데에 둔다.
 * @param {string} paperId 고른 편지지 id (PAPERS의 id)
 * @param {string} recipient 받는 사람 이름 (예: '하늘빛')
 * @param {string} content 본문
 * @param {string} fontFamily 본문과 받는 사람에 쓸 CSS font-family
 * @param {Array} signatureOps draft.signature.ops
 */
function LetterResult({ paperId = 'basic', recipient, content, fontFamily, signatureOps }) {
  const hasSignature = signatureOps.length > 0

  return (
    <article className={`paper paper--${paperId} letter-result letter-result--${paperId}`} style={{ fontFamily }}>
      {paperId === 'mascot' && <Mascot pose="face" size={88} className="letter-result__deco letter-result__deco--cat" />}
      {paperId === 'night' && (
        <img className="letter-result__deco letter-result__deco--sky" src={nightSky} alt="" width="108" height="106" />
      )}
      <p className="letter-result__to">To. {recipient}</p>
      {/* 줄은 본문과 손글씨를 함께 감싼 이 칸에 깔려서, 손글씨 아래로도 줄이 이어진다. */}
      <div className="letter-result__sheet">
        <div className="letter-result__body" role="region" aria-label="편지 본문">
          {content}
        </div>
        {hasSignature && (
          <div className="letter-result__signature">
            <SignatureView ops={signatureOps} fit />
          </div>
        )}
      </div>
    </article>
  )
}

export default LetterResult
