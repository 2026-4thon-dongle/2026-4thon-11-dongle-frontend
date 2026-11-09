import './Input.css'

/**
 * 한 줄 입력창. input의 모든 props(value, onChange, placeholder, type 등)를 그대로 쓴다.
 * @param {boolean} [invalid] true면 오류 테두리를 보여준다.
 */
function Input({ invalid = false, className = '', ...rest }) {
  return (
    <input
      className={`ui-input${invalid ? ' is-invalid' : ''} ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}

export default Input
