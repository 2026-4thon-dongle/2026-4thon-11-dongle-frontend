import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import './ExitConfirm.css'

/**
 * 쓰다가 나가기 확인(시안 4-8). useOverlay().openDialog()의 content로 넣어 쓴다.
 * @param {() => void} onDiscard 저장 안 함
 * @param {() => void} onSave 임시저장
 * @param {() => void} onContinue 계속 쓰기
 */
function ExitConfirm({ onDiscard, onSave, onContinue }) {
  return (
    <div className="exit-confirm">
      <div className="exit-confirm__icon">
        <Mascot pose="letter" size={56} />
      </div>
      <h2 className="exit-confirm__title">쓰던 편지를 저장할까요?</h2>
      <p className="exit-confirm__description">
        {'임시저장하면 편지 쓰기에서\n이어서 쓸 수 있어요'}
      </p>
      <div className="exit-confirm__actions">
        <Button variant="secondary" onClick={onDiscard}>
          저장 안 함
        </Button>
        <Button onClick={onSave}>임시저장</Button>
      </div>
      <button type="button" className="exit-confirm__continue" onClick={onContinue}>
        계속 쓰기
      </button>
    </div>
  )
}

export default ExitConfirm
