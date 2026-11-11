import './Toggle.css'

/**
 * 켜고 끄는 스위치(7-11). 마이 전용으로 만들었다. 눌러서 바꾸고 키보드(스페이스, 엔터)로도 바꿀 수 있다.
 * @param {boolean} checked 켜져 있는지
 * @param {(next: boolean) => void} onChange 누르면 바뀔 값을 넘겨 준다
 * @param {string} label 스크린 리더용 이름 (예: "푸시 알림 받기")
 */
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`toggle${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__knob" />
    </button>
  )
}

export default Toggle
