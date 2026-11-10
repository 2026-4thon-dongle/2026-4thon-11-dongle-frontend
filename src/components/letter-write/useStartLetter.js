import { createElement, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useOverlay from '../../shared/hooks/useOverlay.js'
import ResumeSheet from './ResumeSheet.jsx'
import { clearLetterDraft, loadLetterDraft } from './letterDraftStorage.js'
import { LETTER_STEPS } from './steps.js'

/**
 * 편지 쓰기를 시작한다. 일기 상세의 "편지로 답장하기"처럼 편지 쓰기로 들어가는 버튼은
 * navigate로 직접 가지 말고 이 함수를 쓴다. 임시저장한 편지가 있으면 "이어 쓰기" 시트(4-9)를 먼저 보여준다.
 *
 * const startLetter = useStartLetter()
 * startLetter({ diaryId: '12', nickname: '하늘빛', region: '충남 천안' })
 *
 * - 임시저장이 없으면 바로 /letter-write로 간다.
 * - 있으면 시트가 뜨고, "새로 쓰기"는 저장본을 지우고 처음부터, "이어 쓰기"는 저장했던 단계로 간다.
 * - 일기에 답장하는 게 아니면 diaryId, nickname 없이 region만 넘긴다.
 */
export default function useStartLetter() {
  const navigate = useNavigate()
  const { openSheet } = useOverlay()

  return useCallback(
    ({ diaryId = null, nickname = null, region = null } = {}) => {
      const params = new URLSearchParams()
      if (diaryId) params.set('diaryId', diaryId)
      if (nickname) params.set('nickname', nickname)
      if (region) params.set('region', region)
      const search = params.size ? `?${params}` : ''

      const reply = { diaryId, nickname, region }
      const saved = loadLetterDraft(reply)
      if (!saved) {
        navigate(`/letter-write${search}`)
        return
      }

      openSheet({
        title: diaryId ? '이 일기에 쓰던 편지가 있어요' : '쓰던 편지가 있어요',
        content: ({ close }) =>
          createElement(ResumeSheet, {
            saved,
            onNew: () => {
              close()
              clearLetterDraft(reply)
              navigate(`/letter-write${search}`)
            },
            onResume: () => {
              close()
              // 저장했던 작성 상태를 들고 저장했던 단계로 간다. LetterDraftProvider가 이 상태를 읽는다.
              navigate(`${LETTER_STEPS[saved.step - 1].path}${search}`, {
                state: { resumeDraft: saved.draft },
              })
            },
          }),
      })
    },
    [navigate, openSheet],
  )
}
