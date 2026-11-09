import Button from '../../shared/ui/Button.jsx'
import './StepFooter.css'

/**
 * 단계 화면 아래 버튼. "다음" 하나, 또는 onSkip을 주면 왼쪽에 "건너뛰기"가 함께 나온다.
 * StepLayout의 footer에 넣어서 쓴다.
 * @param {() => void} onNext
 * @param {() => void} [onSkip] 있으면 건너뛰기 버튼을 보여준다.
 * @param {string} [nextLabel='다음']
 * @param {boolean} [nextDisabled=false]
 */
function StepFooter({ onNext, onSkip, nextLabel = '다음', nextDisabled = false }) {
  return (
    <>
      {onSkip && (
        <Button variant="ghost" className="step-footer__skip" onClick={onSkip}>
          건너뛰기
        </Button>
      )}
      <Button className="step-footer__next" onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </Button>
    </>
  )
}

export default StepFooter
