import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import './WithdrawDialog.css'

/**
 * 회원 탈퇴 확인 다이얼로그의 내용(7-13). 바깥 틀(딤, 둥근 카드)은 shared의 useOverlay().openDialog가 그린다.
 * @param {() => void} onStay "더 있을래요"를 눌렀을 때(닫기)
 * @param {() => void} onWithdraw "탈퇴할게요"를 눌렀을 때
 */
function WithdrawDialog({ onStay, onWithdraw }) {
  return (
    <div className="withdraw-dialog">
      <span className="withdraw-dialog__circle">
        <Mascot pose="teary" size={96} />
      </span>
      <h2 className="withdraw-dialog__title">정말 떠나실 건가요?</h2>
      <p className="withdraw-dialog__description">
        주고받은 편지와 우표첩이
        <br />
        모두 사라져요
      </p>
      <div className="withdraw-dialog__stay">
        <Button onClick={onStay}>더 있을래요</Button>
      </div>
      <button type="button" className="withdraw-dialog__leave" onClick={onWithdraw}>
        탈퇴할게요
      </button>
    </div>
  )
}

export default WithdrawDialog
