import { Navigate, useLocation } from 'react-router-dom'
import { LETTER_STEPS } from '../../components/letter-write/steps.js'

/**
 * /letter-write 로 들어오면 첫 단계(편지지)로 보낸다.
 * 일기 상세 등에서 붙여 준 쿼리(diaryId, nickname, region)는 그대로 유지한다.
 */
function EntryRedirect() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: LETTER_STEPS[0].path, search }} replace />
}

export default EntryRedirect
