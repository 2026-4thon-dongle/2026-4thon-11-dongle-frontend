import { useNavigate } from 'react-router-dom'
import ErrorScreen from '../feedback/ErrorScreen.jsx'

/**
 * 없는 주소(라우트의 나머지 경로 `*`)에서 보여 주는 화면. 처음에는 화면 자리 표시였지만 지금은 모두 「없는 페이지」 자리라
 * 개발용 문구 대신 공통 에러 화면(8-2 모양)과 홈으로 가는 버튼을 보여 준다.
 * 호출부가 넘기는 title은 쓰지 않는다(어느 경로든 같은 화면).
 */
function RoutePlaceholder() {
  const navigate = useNavigate()
  return (
    <ErrorScreen
      title="페이지를 찾을 수 없어요"
      description={'주소가 바뀌었거나 없는 화면이에요.\n홈에서 다시 찾아 주세요'}
      hint=""
      retryLabel="홈으로 가기"
      onRetry={() => navigate('/', { replace: true })}
    />
  )
}

export default RoutePlaceholder
