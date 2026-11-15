import { createElement } from 'react'
import { useNavigate } from 'react-router-dom'
import useOverlay from '../../shared/hooks/useOverlay.js'
import useLetterDraft from './useLetterDraft.js'
import ExitConfirm from './ExitConfirm.jsx'
import { clearLetterDraft, saveLetterDraft } from './letterDraftStorage.js'
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
 *   "쓰던 편지를 저장할까요?"(4-8)를 물어보고(임시저장하면 4-9에서 이어 쓴다) 나가며, 안 썼으면 이전 단계로 간다. 3~4단계는 이전 단계로 간다.
 */
export default function useStepNavigation(step) {
  const navigate = useNavigate()
  const { openDialog, showToast } = useOverlay()
  const { draft, resetDraft } = useLetterDraft()
  const next = LETTER_STEPS[step] // step이 1부터라 인덱스 step이 다음 단계다.
  const prev = LETTER_STEPS[step - 2]

  const leave = () => navigate(-1)

  const askBeforeLeaving = () => {
    openDialog({
      label: '쓰던 편지 저장',
      content: ({ close }) =>
        createElement(ExitConfirm, {
          onDiscard: async () => {
            close()
            await clearLetterDraft(draft.reply, draft.draftId)
            resetDraft()
            leave()
          },
          // 임시저장은 서버에 한다. 저장하지 못하면 쓰던 내용을 잃지 않게 나가지 않고 알려 준다.
          onSave: async () => {
            close()
            try {
              await saveLetterDraft(draft)
            } catch (error) {
              showToast(error.message)
              return
            }
            showToast('임시저장했어요')
            leave()
          },
          onContinue: close,
        }),
    })
  }

  return {
    // 단계를 오갈 때는 기록을 쌓지 않고 갈아끼운다. 그래야 편지 쓰기를 나갈 때(navigate(-1)) 들어오기 전 화면으로 간다.
    goNext: () => next && navigate(next.path, { replace: true }),
    goBack: () => {
      if (!prev) return leave()
      if (step === ASK_STEP && hasWritten(draft)) return askBeforeLeaving()
      return navigate(prev.path, { replace: true })
    },
  }
}
