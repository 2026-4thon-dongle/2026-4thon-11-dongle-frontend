import { useEffect } from 'react'
import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import './GameExitConfirm.css'

/**
 * 게임 중 나가기 확인. useOverlay().openDialog()의 content로 넣어 쓴다.
 * 모달이 떠 있는 동안 onPause(true)로 게임을 멈추고, 어떻게 닫히든(바깥 클릭·Esc 포함) 닫히면 onPause(false)로 다시 시작한다.
 * @param {(paused: boolean) => void} onPause
 * @param {() => void} onExit 나가기
 * @param {() => void} onContinue 계속하기
 */
function GameExitConfirm({ onPause, onExit, onContinue }) {
  useEffect(() => {
    onPause(true)
    return () => onPause(false)
  }, [onPause])

  return (
    <div className="game-exit-confirm">
      <div className="game-exit-confirm__icon">
        <Mascot pose="letter" size={56} />
      </div>
      <h2 className="game-exit-confirm__title">나가시겠어요?</h2>
      <p className="game-exit-confirm__description">{'지금 나가면 이번 판은\n기록되지 않아요'}</p>
      <div className="game-exit-confirm__actions">
        <Button variant="secondary" onClick={onExit}>
          나가기
        </Button>
        <Button onClick={onContinue}>계속하기</Button>
      </div>
    </div>
  )
}

export default GameExitConfirm
