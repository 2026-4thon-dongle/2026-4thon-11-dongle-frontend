import './HeaderSaveButton.css'

/**
 * 헤더 오른쪽의 "저장" 글씨 버튼(7-9, 7-10). shared Header의 right 자리에 넣어 쓴다.
 * @param {() => void} onClick
 * @param {boolean} [disabled] 저장할 수 없을 때(바뀐 게 없거나 값이 올바르지 않을 때)
 */
function HeaderSaveButton({ onClick, disabled = false }) {
  return (
    <button type="button" className="header-save" disabled={disabled} onClick={onClick}>
      저장
    </button>
  )
}

export default HeaderSaveButton
