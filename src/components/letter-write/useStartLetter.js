import { createElement, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useOverlay from '../../shared/hooks/useOverlay.js'
import LoadingPill from '../../shared/feedback/LoadingPill.jsx'
import ResumeSheet from './ResumeSheet.jsx'
import { clearLetterDraft, loadLetterDraft } from './letterDraftStorage.js'
import { LETTER_STEPS } from './steps.js'

const LOADING_DELAY_MS = 300

/**
 * 편지 쓰기를 시작한다. 일기 상세의 "편지로 답장하기"처럼 편지 쓰기로 들어가는 버튼은
 * navigate로 직접 가지 말고 이 함수를 쓴다. 임시저장한 편지가 있으면 "이어 쓰기" 시트(4-9)를 먼저 보여준다.
 *
 * const startLetter = useStartLetter()
 * startLetter({ diaryId: '12', nickname: '하늘빛', region: '충남 천안' })
 *
 * - 임시저장이 없으면 바로 /letter-write로 간다. 임시저장은 서버에서 확인하므로 잠깐 기다린다.
 * - 있으면 시트가 뜨고, "새로 쓰기"는 저장본을 지우고 처음부터, "이어 쓰기"는 내용 쓰기 단계로 간다(서버는 본문·편지지·글씨체만 저장한다).
 * - 편지는 일기(diaryId)나 받은 편지(letterId)에 답장할 때만 쓴다. 받은 편지 답장의 쿼리(letterId 등)는 채원과 합의 전의 가정이다.
 */
export default function useStartLetter() {
  const navigate = useNavigate()
  const { openSheet, openDialog, close: closeOverlay } = useOverlay()

  return useCallback(
    async ({ diaryId = null, letterId = null, nickname = null, region = null } = {}) => {
      const params = new URLSearchParams()
      if (diaryId) params.set('diaryId', diaryId)
      if (letterId) params.set('letterId', letterId)
      if (nickname) params.set('nickname', nickname)
      if (region) params.set('region', region)
      const search = params.size ? `?${params}` : ''

      const reply = { diaryId, letterId, nickname, region }
      // 임시저장은 서버에서 확인해서 잠깐 걸린다. 0.3초가 넘으면 불러오는 중(8-1)을 보여 준다.
      const loading = { shown: false }
      const loadingTimer = setTimeout(() => {
        loading.shown = true
        openDialog({ label: '불러오는 중', content: createElement(LoadingPill) })
      }, LOADING_DELAY_MS)
      const saved = await loadLetterDraft(reply)
      clearTimeout(loadingTimer)
      if (loading.shown) closeOverlay()
      if (!saved) {
        navigate(`/letter-write${search}`)
        return
      }

      openSheet({
        title: diaryId ? '이 일기에 쓰던 편지가 있어요' : '쓰던 편지가 있어요',
        content: ({ close }) =>
          createElement(ResumeSheet, {
            saved,
            onNew: async () => {
              close()
              await clearLetterDraft(reply, saved.draft.draftId)
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
    [navigate, openSheet, openDialog, closeOverlay],
  )
}
