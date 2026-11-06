import './Button.css'

// variant: 'primary'(기본) | 'secondary' | 'ghost'
function Button({ variant = 'primary', type = 'button', className = '', children, ...rest }) {
  return (
    <button
      type={type}
      className={`ui-button ui-button--${variant} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
