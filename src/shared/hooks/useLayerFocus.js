import { useEffect } from 'react'

// 공용 Overlay(시트·팝업) 안의 내용이 키보드 포커스와 배경 스크롤을 관리한다.
// 처음 누를 수 있는 요소로 포커스를 옮기고, Tab을 레이어 안에서 돌게 하고, 닫히면 원래 자리로 돌려준다.
// 일기 신고·차단(3-6~3-8)에서 쓰던 것을 편지 신고·차단(5-9)과 함께 쓰려고 shared로 옮겼다.
export default function useLayerFocus(ref) {
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
