import './LetterSignaturePreview.css'

/**
 * 닉네임 변경(7-9)의 편지 서명 미리보기. 살짝 기울어진 편지지에 "From. 닉네임"이 적힌다.
 * @param {string} nickname 편지에 적힐 닉네임
 */
function LetterSignaturePreview({ nickname }) {
  return (
    <div className="signature-preview" role="img" aria-label={`편지 서명 미리보기: From. ${nickname}`}>
      <div className="signature-preview__paper">
        <span className="signature-preview__line signature-preview__line--first" />
        <span className="signature-preview__line signature-preview__line--second" />
        <p className="signature-preview__hello">잘 지내시죠?</p>
        <p className="signature-preview__from">From. {nickname}</p>
      </div>
    </div>
  )
}

export default LetterSignaturePreview
