import './Overlay.css'

/**
 * 다이얼로그 틀. 화면 가운데에 둥근 카드만 제공한다.
 * 제목, 설명, 버튼 등 내용은 쓰는 화면에서 children으로 채운다.
 * 보통 useOverlay().openDialog()로 열고, 직접 쓸 때는 Overlay 레이어 안에 둔다.
 * @param {string} [label] 스크린 리더용 이름
 */
function Dialog({ label, children }) {
  return (
    <div className="ui-dialog-wrap">
      <div className="ui-dialog" role="alertdialog" aria-modal="true" aria-label={label}>
        {children}
      </div>
    </div>
  )
}

export default Dialog
