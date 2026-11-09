import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'
import './AuthFrame.css'

/** @param {{title?: string, progress?: number, onBack: () => void, children: import('react').ReactNode, footer?: import('react').ReactNode, className?: string}} props 공통 가입·인증 화면. progress: 0~100. */
export default function AuthFrame({ title = '회원가입', progress, onBack, children, footer, className = '' }) {
  const heading = useRef(null)
  useEffect(() => { heading.current?.focus(); window.scrollTo(0, 0) }, [title, progress])
  return (
    <main className={`auth-page ${className}`}>
      <header className="auth-header">
        <button type="button" className="auth-back" aria-label="뒤로 가기" onClick={onBack}><Icon name="back" /></button>
        <h1 className="text-title-17" tabIndex={-1} ref={heading}>{title}</h1>
      </header>
      {progress !== undefined && <div className="auth-progress" role="progressbar" aria-label="가입 진행" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>}
      <div className="auth-content">{children}</div>
      {footer && <footer className="auth-footer">{footer}</footer>}
    </main>
  )
}

/** @param {{children: import('react').ReactNode, description?: import('react').ReactNode}} props */
export function AuthHeading({ children, description }) {
  return <div className="auth-heading"><h2 className="text-title-24">{children}</h2>{description && <p className="text-body-13">{description}</p>}</div>
}
