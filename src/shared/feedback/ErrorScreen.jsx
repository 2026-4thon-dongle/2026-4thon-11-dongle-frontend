import Mascot from '../ui/Mascot.jsx'
import Button from '../ui/Button.jsx'
import './ErrorScreen.css'

/**
 * 에러 화면(시안 8-2 네트워크 에러). 글은 기본값이 네트워크 에러 문구이고, 바꿔서 쓸 수 있다.
 * @param {string} [title]
 * @param {string} [description] 줄바꿈은 줄바꿈 문자(\n)로 넣는다.
 * @param {string} [hint] 버튼 아래 작은 안내. 빈 문자열이면 숨긴다.
 * @param {string} [retryLabel='다시 시도']
 * @param {() => void} [onRetry] 없으면 버튼을 보여주지 않는다.
 */
function ErrorScreen({
  title = '인터넷 연결이 불안정해요',
  description = '고향이가 편지를 들고 잠깐 길을 잃었어요.\n연결을 확인하고 다시 시도해주세요',
  hint = '임시저장한 편지는 안전하게 보관돼 있어요',
  retryLabel = '다시 시도',
  onRetry,
}) {
  return (
    <main className="ui-error" role="alert">
      <div className="ui-error__circle">
        <div className="ui-error__mascot">
          <Mascot pose="surprised" size={160} />
        </div>
        <span className="ui-error__bubble" aria-hidden="true" />
        <span className="ui-error__bubble-text" aria-hidden="true">?!</span>
      </div>

      <h1 className="ui-error__title">{title}</h1>
      <p className="ui-error__description">{description}</p>

      {onRetry && (
        <Button className="ui-error__retry" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
      {hint && <p className="ui-error__hint">{hint}</p>}
    </main>
  )
}

export default ErrorScreen
