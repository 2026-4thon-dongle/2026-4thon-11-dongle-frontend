import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LetterDraftProvider from '../../components/letter-write/LetterDraftProvider.jsx'
import useLetterDraft from '../../components/letter-write/useLetterDraft.js'
import { LETTER_STEPS } from '../../components/letter-write/steps.js'

// 서명(3)·우표(4) 단계는 본문을 쓴 뒤에만 온다. 편지를 보낸 뒤 뒤로 가기, 새로고침처럼 작성 상태가 비어서 오면
// 빈 편지로 「편지를 보낼까요?」를 묻지 않도록 내용 쓰기(2) 단계로 돌려보낸다.
const NEEDS_CONTENT = [LETTER_STEPS[2].path, LETTER_STEPS[3].path]

function StepGuard() {
  const { pathname, search } = useLocation()
  const { draft } = useLetterDraft()
  if (NEEDS_CONTENT.includes(pathname) && draft.content.trim() === '') return <Navigate to={`${LETTER_STEPS[1].path}${search}`} replace />
  return <Outlet />
}

/**
 * 편지 쓰기 라우트(/letter-write/*) 전체를 감싼다.
 * 작성 중 상태(LetterDraftProvider)를 단계 화면들이 함께 쓰게 하고, 본문 없이 서명·우표 단계에 오지 않게 막는다.
 */
function LetterWriteLayout() {
  return (
    <LetterDraftProvider>
      <StepGuard />
    </LetterDraftProvider>
  )
}

export default LetterWriteLayout
