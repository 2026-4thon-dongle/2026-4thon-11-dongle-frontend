import { useCallback, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { LetterDraftContext, EMPTY_DRAFT } from './letterDraftContext.js'

/**
 * 편지 작성 중 상태를 단계 화면들이 함께 쓰게 해 준다. 편지 쓰기 라우트 전체를 한 번 감싼다.
 * 처음 열 때 주소의 쿼리(diaryId 또는 letterId, nickname, region, preview)를 읽어 reply에 담는다.
 * 다른 화면(5-11 "편지 다시 보기")에서 돌아올 때 함께 넘어온 작성 상태(location.state.resumeDraft)로 시작한다.
 * 임시저장 "이어 쓰기"(4-9)는 입구(EntryRedirect)가 서버에서 확인해 updateDraft로 이 상태를 바꾼다.
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
          letterId: searchParams.get('letterId'),
          nickname: searchParams.get('nickname'),
          region: searchParams.get('region'),
          preview: searchParams.get('preview'),
        },
      },
  )

  const updateDraft = useCallback((patch) => setDraft((current) => ({ ...current, ...patch })), [])
  const resetDraft = useCallback(() => setDraft(EMPTY_DRAFT), [])

  const value = useMemo(() => ({ draft, updateDraft, resetDraft }), [draft, updateDraft, resetDraft])

  return <LetterDraftContext.Provider value={value}>{children}</LetterDraftContext.Provider>
}

export default LetterDraftProvider
