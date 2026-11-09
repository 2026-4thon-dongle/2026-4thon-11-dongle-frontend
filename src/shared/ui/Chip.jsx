import './Chip.css'

/**
 * 칩. onClick이 있으면 버튼으로, 없으면 표시용 span으로 렌더링한다.
 * @param {'default'|'selected'|'light'} [variant='default'] 기본 / 선택 / 연한
 * @param {() => void} [onClick]
 */
function Chip({ variant = 'default', onClick, className = '', children, ...rest }) {
  const classes = `ui-chip ui-chip--${variant} ${className}`.trim()
  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        aria-pressed={variant === 'selected'}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    )
  }
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  )
}

export default Chip
