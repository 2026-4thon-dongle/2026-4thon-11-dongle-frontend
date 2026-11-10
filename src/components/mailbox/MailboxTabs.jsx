import './MailboxTabs.css'

/**
 * 우체통 상단 탭(새 편지 / 대화 중 / 배송 중 / 보관). 고른 탭에 흰 알약이 놓인다.
 * letter-write의 SegmentTabs와 모양이 같지만 다른 기능의 컴포넌트는 가져올 수 없어 따로 만들었다.
 * @param {Array<{id: string, label: string}>} options
 * @param {string} value 고른 탭의 id
 * @param {(id: string) => void} onChange
 * @param {string} [dotTabId] 읽지 않은 편지가 있다고 점을 찍을 탭의 id
 */
function MailboxTabs({ options, value, onChange, dotTabId }) {
  return (
    <div
      className="mailbox-tabs"
      role="tablist"
      aria-label="우체통 구분"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={option.id === value}
          className={`mailbox-tabs__tab${option.id === value ? ' is-selected' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
          {option.id === dotTabId && (
            <span className="mailbox-tabs__dot" role="img" aria-label="읽지 않은 편지 있음" />
          )}
        </button>
      ))}
    </div>
  )
}

export default MailboxTabs
