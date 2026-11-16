import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import ResumeSheet from '../../components/letter-write/ResumeSheet.jsx'
import { clearLetterDraft, loadLetterDraft } from '../../components/letter-write/letterDraftStorage.js'
import useLetterDraft from '../../components/letter-write/useLetterDraft.js'
import { LETTER_STEPS } from '../../components/letter-write/steps.js'
import LoadingPill from '../../shared/feedback/LoadingPill.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'

/**
 * /letter-write 로 들어오면 첫 단계(편지지)로 보낸다. 일기 상세·우체통·마이 등 어디서 들어와도 이 입구를 지난다.
 * 일기 상세 등에서 붙여 준 쿼리(diaryId, nickname, region)는 그대로 유지한다.
 *
 * 답장 대상(diaryId 또는 letterId)이 있으면 먼저 서버에서 임시저장한 편지가 있는지 확인한다(그동안 8-1 로딩).
 * 있으면 첫 단계로 보낸 뒤 그 위에 "이어 쓰기" 시트(4-9)를 띄운다.
 * - 이어 쓰기: 저장한 편지로 작성 상태를 바꾸고 저장했던 단계로 간다.
 * - 새로 쓰기: 저장한 편지를 지우고 첫 단계에서 처음부터 쓴다.
 * - 시트를 그냥 닫으면 첫 단계에서 새로 쓰는 것과 같다(저장한 편지는 남는다).
 * 임시저장이 없거나 확인하지 못하면 바로 첫 단계로 가서 새로 쓴다.
 */
function EntryRedirect() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const { openSheet } = useOverlay()
  const { draft, updateDraft } = useLetterDraft()
  const { reply } = draft
  // 쿼리 없이 들어오면(개발 확인용) 확인할 대상이 없다.
  const [checked, setChecked] = useState(!reply.diaryId && !reply.letterId)

  useEffect(() => {
    if (checked) return undefined
    let cancelled = false
    loadLetterDraft(reply).then((saved) => {
      if (cancelled) return
      if (saved) {
        openSheet({
          title: reply.diaryId ? '이 일기에 쓰던 편지가 있어요' : '쓰던 편지가 있어요',
          content: ({ close }) => (
            <ResumeSheet
              saved={saved}
              onNew={async () => {
                close()
                await clearLetterDraft(reply, saved.draft.draftId)
              }}
              onResume={() => {
                close()
                updateDraft(saved.draft)
                navigate(`${LETTER_STEPS[saved.step - 1].path}${search}`, { replace: true })
              }}
            />
          ),
        })
      }
      setChecked(true)
    })
    return () => {
      cancelled = true
    }
  }, [checked, reply, search, navigate, openSheet, updateDraft])

  if (!checked) return <LoadingPill fullScreen />
  return <Navigate to={{ pathname: LETTER_STEPS[0].path, search }} replace />
}

export default EntryRedirect
