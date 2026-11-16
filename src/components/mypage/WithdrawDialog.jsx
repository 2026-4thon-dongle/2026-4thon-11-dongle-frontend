import { useState } from 'react'
import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import './WithdrawDialog.css'

/**
 * 회원 탈퇴 확인 다이얼로그의 내용(7-13). 바깥 틀(딤, 둥근 카드)은 shared의 useOverlay().openDialog가 그린다.
 * @param {() => void} onStay "더 있을래요"를 눌렀을 때(닫기)
 * @param {() => Promise<void>} onWithdraw "탈퇴할게요"를 눌렀을 때. 실패하면 던진다(다이얼로그가 오류 문구와 "다시 시도"를 보여 준다)
 */
function WithdrawDialog({ onStay, onWithdraw }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const handleWithdraw = async () => {
    setBusy(true)
    setError(null)
    try {
      await onWithdraw()
    } catch (reason) {
      setError(reason)
      setBusy(false)
    }
  }

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
        <Button onClick={onStay} disabled={busy}>
          더 있을래요
        </Button>
      </div>
      {error && (
        <p className="withdraw-dialog__error" role="alert">
          {error.message ?? '탈퇴하지 못했어요.'} 계정은 그대로 남아 있어요.
        </p>
      )}
      <button type="button" className="withdraw-dialog__leave" onClick={handleWithdraw} disabled={busy}>
        {busy ? '처리하는 중…' : error ? '다시 시도' : '탈퇴할게요'}
      </button>
    </div>
  )
}

export default WithdrawDialog
