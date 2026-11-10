import { useEffect } from 'react'

export default function useOwnedLayerFocus(ref) {
  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    const layer = ref.current?.closest('[role="dialog"], [role="alertdialog"]')
    const controls = () => [...(layer?.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled)') || [])].filter((element) => element.getClientRects().length)
    document.body.style.overflow = 'hidden'
    controls()[0]?.focus()
    function trap(event) { if (event.key !== 'Tab') return; const items = controls(); if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus() } else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus() } }
    layer?.addEventListener('keydown', trap)
    return () => { document.body.style.overflow = overflow; layer?.removeEventListener('keydown', trap); if (previous?.isConnected) previous.focus() }
  }, [ref])
}
