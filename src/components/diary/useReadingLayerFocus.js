import { useEffect } from 'react'

// 기존 공용 Overlay 안에서 이 기능의 키보드 포커스와 배경 스크롤을 관리한다.
export default function useReadingLayerFocus(ref) {
  useEffect(() => {
    const element = ref.current
    const previous = document.activeElement
    const previousOverflow = document.body.style.overflow
    const layer = element?.closest('[role="dialog"], [role="alertdialog"]')
    document.body.style.overflow = 'hidden'
    const focusable = () => [...(layer?.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]') || [])].filter((item) => item.getClientRects().length)
    focusable()[0]?.focus()
    function trap(event) {
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    layer?.addEventListener('keydown', trap)
    return () => { document.body.style.overflow = previousOverflow; layer?.removeEventListener('keydown', trap); if (previous?.isConnected) previous.focus() }
  }, [ref])
}
