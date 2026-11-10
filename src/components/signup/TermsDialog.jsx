import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from '../../shared/ui/Button.jsx'
import { TERMS_NOTICE } from './terms.js'
import './TermsDialog.css'

/** @param {{open: boolean, term: {id: string, label: string, content: string}, onClose: () => void}} props */
export default function TermsDialog({ open, term, onClose }) {
  const dialog = useRef(null)
  const body = useRef(null)
  useEffect(() => {
    if (!open) return
    const element = dialog.current
    const previousOverflow = document.body.style.overflow
    element.showModal()
    body.current.scrollTop = 0
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow; element.close() }
  }, [open, term.id])

  return createPortal(<dialog className="signup-terms-dialog" ref={dialog} aria-labelledby="terms-title" onClose={onClose}>
    <header className="signup-terms-dialog-header"><h2 id="terms-title" className="text-title-20">{term.label}</h2><p className="text-caption-11">{TERMS_NOTICE}</p></header>
    <div className="signup-terms-dialog-body" ref={body} role="region" aria-label="약관 본문" tabIndex={0}>
      {term.content.split('\n\n').map((block, index) => {
        const [first, ...rest] = block.split('\n')
        const heading = /^제\d+조|^부칙$|^· /.test(first)
        return <section key={`${term.id}-${index}`}>{heading ? <><h3 className="text-label-15">{first}</h3><p>{rest.join('\n')}</p></> : <p>{block}</p>}</section>
      })}
    </div>
    <footer className="signup-terms-dialog-footer"><Button variant="secondary" onClick={() => dialog.current.close()}>닫기</Button></footer>
  </dialog>, document.body)
}
