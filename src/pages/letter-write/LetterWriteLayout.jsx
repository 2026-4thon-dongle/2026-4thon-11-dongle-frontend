import { Outlet } from 'react-router-dom'
import LetterDraftProvider from '../../components/letter-write/LetterDraftProvider.jsx'

/**
 * 편지 쓰기 라우트(/letter-write/*) 전체를 감싼다.
 * 작성 중 상태(LetterDraftProvider)를 단계 화면들이 함께 쓰게 하는 역할만 한다.
 */
function LetterWriteLayout() {
  return (
    <LetterDraftProvider>
      <Outlet />
    </LetterDraftProvider>
  )
}

export default LetterWriteLayout
