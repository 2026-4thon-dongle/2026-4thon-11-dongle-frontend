import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import './LeaveEditDialog.css'

/**
 * 저장하지 않고 나갈 때 뜨는 확인 다이얼로그의 내용(시안 7-10-3). 지역 설정(7-10)과 닉네임 변경(7-9)이 같이 쓴다. 바깥 틀(딤, 둥근 카드)은 shared의 useOverlay().openDialog가 그린다.
 * @param {() => void} onStay "계속 수정할게요"를 눌렀을 때(팝업만 닫는다)
 * @param {() => void} onLeave "저장 안 하고 나갈게요"를 눌렀을 때(바꾼 내용을 버리고 나간다)
 */
function LeaveEditDialog({ onStay, onLeave }) {
  return (
    <div className="leave-edit-dialog">
      <span className="leave-edit-dialog__circle">
        <Mascot pose="teary" size={96} />
      </span>
      <h2 className="leave-edit-dialog__title">저장하지 않고 나갈까요?</h2>
      <div className="leave-edit-dialog__stay">
        <Button onClick={onStay}>계속 수정할게요</Button>
      </div>
      <button type="button" className="leave-edit-dialog__leave" onClick={onLeave}>
        저장 안 하고 나갈게요
      </button>
    </div>
  )
}

export default LeaveEditDialog
