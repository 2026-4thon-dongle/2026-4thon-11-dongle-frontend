import './SegmentTabs.css'

/**
 * 두세 개 중 하나를 고르는 탭(시안의 "손글씨 / 스티커"). 고른 탭에 흰 알약이 놓인다.
 * @param {Array<{id: string, label: string}>} options
 * @param {string} value 고른 탭의 id
 * @param {(id: string) => void} onChange
 */
function SegmentTabs({ options, value, onChange, label }) {
  return (
    <div
      className="segment-tabs"
      role="tablist"
      aria-label={label}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={option.id === value}
          className={`segment-tabs__tab${option.id === value ? ' is-selected' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentTabs
