import { createElement } from 'react'
import { useNavigate } from 'react-router-dom'
import useOverlay from '../../shared/hooks/useOverlay.js'
import useLetterDraft from './useLetterDraft.js'
import ExitConfirm from './ExitConfirm.jsx'
import { EMPTY_DRAFT } from './letterDraftContext.js'
import { LETTER_STEPS } from './steps.js'

// 쓰던 내용이 있는지(편지지·글씨체를 바꿨거나, 본문·서명을 썼는지)
function hasWritten(draft) {
  return (
    draft.content.trim() !== '' ||
    draft.signature.ops.length > 0 ||
    draft.paperId !== EMPTY_DRAFT.paperId ||
    draft.fontId !== EMPTY_DRAFT.fontId
  )
}

/**
 * 편지 쓰기 단계 이동. 현재 단계 번호(1부터)를 넘기면 다음·이전 단계로 가는 함수를 돌려준다.
 *
 * const { goNext, goBack } = useStepNavigation(2)
 *
 * - goNext: 마지막 단계에서는 아무 일도 하지 않는다(보내기는 우표 단계 화면에서 처리한다).
 * - goBack: 2~4단계에서는 이전 단계로 간다. 첫 단계에서는 편지 쓰기를 나가는데,
 *   쓰던 내용이 있으면 "쓰던 편지를 저장할까요?"(4-8)를 먼저 물어본다. 내용이 없으면 바로 나간다.
 */
export default function useStepNavigation(step) {
  const navigate = useNavigate()
  const { openDialog } = useOverlay()
  const { draft, resetDraft } = useLetterDraft()
  const next = LETTER_STEPS[step] // step이 1부터라 인덱스 step이 다음 단계다.
  const prev = LETTER_STEPS[step - 2]

  const leave = () => navigate(-1)

  const askBeforeLeaving = () => {
    if (!hasWritten(draft)) return leave()
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
    goBack: () => (prev ? navigate(prev.path) : askBeforeLeaving()),
  }
}
