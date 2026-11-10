import { useCallback, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { LetterDraftContext, EMPTY_DRAFT } from './letterDraftContext.js'

/**
 * 편지 작성 중 상태를 단계 화면들이 함께 쓰게 해 준다. 편지 쓰기 라우트 전체를 한 번 감싼다.
 * 처음 열 때 주소의 쿼리(diaryId, nickname, region)를 읽어 reply에 담는다.
 * "이어 쓰기"(useStartLetter)로 들어오면 이동할 때 함께 넘어온 임시저장 상태(location.state.resumeDraft)로 시작한다.
 * 새로고침하면 작성 중이던 상태는 사라진다(임시저장한 것만 남는다).
 */
function LetterDraftProvider({ children }) {
  const [searchParams] = useSearchParams()
  const { state } = useLocation()

  const [draft, setDraft] = useState(
    () =>
      state?.resumeDraft ?? {
        ...EMPTY_DRAFT,
        reply: {
          diaryId: searchParams.get('diaryId'),
          nickname: searchParams.get('nickname'),
          region: searchParams.get('region'),
        },
      },
  )

  const updateDraft = useCallback((patch) => setDraft((current) => ({ ...current, ...patch })), [])
  const resetDraft = useCallback(() => setDraft(EMPTY_DRAFT), [])

  const value = useMemo(() => ({ draft, updateDraft, resetDraft }), [draft, updateDraft, resetDraft])

  return <LetterDraftContext.Provider value={value}>{children}</LetterDraftContext.Provider>
}

export default LetterDraftProvider
