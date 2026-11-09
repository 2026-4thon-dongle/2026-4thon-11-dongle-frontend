import './StampTabs.css'

/**
 * 우표첩 위쪽 탭(업적 우표 / 꾸미기 우표). 고른 탭에 흰 알약이 놓인다. 마이 전용으로 만들었다.
 * (letter-write의 SegmentTabs, 우체통의 MailboxTabs와 모양이 비슷하다. shared로 올리는 것은 팀과 정한 뒤에 한다.)
 * @param {Array<{id: string, label: string}>} options
 * @param {string} value 고른 탭의 id
 * @param {(id: string) => void} onChange
 */
function StampTabs({ options, value, onChange }) {
  return (
    <div
      className="stamp-tabs"
      role="tablist"
      aria-label="우표 종류"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={option.id === value}
          className={`stamp-tabs__tab${option.id === value ? ' is-selected' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default StampTabs
