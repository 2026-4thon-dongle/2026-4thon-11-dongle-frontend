import StepLayout from '../../app/layouts/StepLayout.jsx'
import StepFooter from '../../components/letter-write/StepFooter.jsx'
import useStepNavigation from '../../components/letter-write/useStepNavigation.js'
import useLetterDraft from '../../components/letter-write/useLetterDraft.js'
import { LETTER_STEPS, LETTER_STEP_LABELS } from '../../components/letter-write/steps.js'

/**
 * 단계 화면이 만들어지기 전까지 쓰는 임시 화면. 단계 틀과 이동, 작성 중 상태가 이어지는지 확인한다.
 * 실제 화면(편지지·내용·서명·우표)이 만들어지면 각 단계의 페이지로 교체한다.
 * @param {number} step 단계 번호(1부터)
 * @param {boolean} [skippable] true면 건너뛰기 버튼을 보여준다.
 */
function LetterStepPlaceholder({ step, skippable = false }) {
  const { goNext, goBack } = useStepNavigation(step)
  const { draft } = useLetterDraft()
  const isLast = step === LETTER_STEPS.length

  return (
    <StepLayout
      title="편지 쓰기"
      steps={LETTER_STEP_LABELS}
      current={step}
      onBack={goBack}
      footer={
        <StepFooter
          onNext={goNext}
          onSkip={skippable ? goNext : undefined}
          nextLabel={isLast ? '보내기' : '다음'}
        />
      }
    >
      <h2 className="text-title-20" style={{ margin: 0 }}>
        {step}단계 · {LETTER_STEPS[step - 1].label} (임시 화면)
      </h2>
      <p className="text-body-13" style={{ color: 'var(--text-sub)' }}>
        담당 화면을 이 위치에 구현합니다. 아래는 단계를 오가도 유지되는 작성 중 상태입니다.
      </p>
      <pre className="text-caption-11" style={{ whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(draft, null, 2)}
      </pre>
    </StepLayout>
  )
}

export default LetterStepPlaceholder
