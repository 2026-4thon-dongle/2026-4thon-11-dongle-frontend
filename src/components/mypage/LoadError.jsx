import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'

/**
 * 마이 화면의 불러오기 실패 화면. shared의 ErrorScreen에 ApiError의 메시지를 보여 주고 "다시 시도"를 붙인다.
 * 네트워크 오류(status 0)는 ErrorScreen의 기본 문구를 쓴다.
 * @param {Error & {status?: number}} error
 * @param {() => void} onRetry
 */
function LoadError({ error, onRetry }) {
  const isNetwork = error?.status === 0
  return isNetwork ? (
    <ErrorScreen description={error.message} hint="" onRetry={onRetry} />
  ) : (
    <ErrorScreen title="불러오지 못했어요" description={error?.message ?? '잠시 후 다시 시도해주세요.'} hint="" onRetry={onRetry} />
  )
}

export default LoadError
