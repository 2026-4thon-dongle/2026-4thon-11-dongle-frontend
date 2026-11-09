import { createElement } from 'react'
import { useNavigate } from 'react-router-dom'
import useOverlay from '../../shared/hooks/useOverlay.js'
import useLetterDraft from './useLetterDraft.js'
import ExitConfirm from './ExitConfirm.jsx'
import { LETTER_STEPS } from './steps.js'

// 4-8을 묻는 단계: 본문을 쓰는 2단계(내용)에서 뒤로 갈 때
const ASK_STEP = 2

// 쓰던 내용이 있는지(본문을 썼는지)
function hasWritten(draft) {
  return draft.content.trim() !== ''
}

/**
 * 편지 쓰기 단계 이동. 현재 단계 번호(1부터)를 넘기면 다음·이전 단계로 가는 함수를 돌려준다.
 *
 * const { goNext, goBack } = useStepNavigation(2)
 *
 * - goNext: 마지막 단계에서는 아무 일도 하지 않는다(보내기는 우표 단계 화면에서 처리한다).
 * - goBack: 1단계(편지지)는 바로 편지 쓰기를 나간다. 2단계(내용)는 본문을 썼으면
 *   "쓰던 편지를 저장할까요?"(4-8)를 물어보고 나가며, 안 썼으면 이전 단계로 간다. 3~4단계는 이전 단계로 간다.
 */
export default function useStepNavigation(step) {
  const navigate = useNavigate()
  const { openDialog } = useOverlay()
  const { draft, resetDraft } = useLetterDraft()
  const next = LETTER_STEPS[step] // step이 1부터라 인덱스 step이 다음 단계다.
  const prev = LETTER_STEPS[step - 2]

  const leave = () => navigate(-1)

  const askBeforeLeaving = () => {
    openDialog({
      label: '쓰던 편지 저장',
      content: ({ close }) =>
        createElement(ExitConfirm, {
          onDiscard: () => {
            close()
            resetDraft()
            leave()
          },
          // TODO: 임시저장은 아직 저장하지 않고 나가기만 한다. 저장 방식(API)이 정해지면 여기서 저장한다.
          onSave: () => {
            close()
            leave()
          },
          onContinue: close,
        }),
    })
  }

  return {
    goNext: () => next && navigate(next.path),
    goBack: () => {
      if (!prev) return leave()
      if (step === ASK_STEP && hasWritten(draft)) return askBeforeLeaving()
      return navigate(prev.path)
    },
  }
}
