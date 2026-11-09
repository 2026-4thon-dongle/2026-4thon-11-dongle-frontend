import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OverlayContext } from './overlayContext.js'
import BottomSheet from './BottomSheet.jsx'
import Dialog from './Dialog.jsx'
import Toast from './Toast.jsx'
import './Overlay.css'

const TOAST_MS = 2500
const SHEET_CLOSE_MS = 200 // Overlay.css의 닫기 애니메이션 시간과 맞춘다.

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 바텀시트·다이얼로그·토스트를 한 곳에서 관리한다. 앱 최상단(라우터 안쪽)에 한 번만 감싼다.
 * 쓰는 화면에서는 shared/hooks/useOverlay를 호출한다.
 */
function OverlayProvider({ children }) {
  const [layer, setLayer] = useState(null) // { type: 'sheet' | 'dialog', props, closing? }
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const closeTimer = useRef(null)

  // 시트는 내려가는 애니메이션이 끝난 뒤에 없앤다. 다이얼로그는 바로 없앤다.
  const close = useCallback(() => {
    setLayer((current) => {
      if (!current || current.closing) return current
      if (current.type !== 'sheet') return null
      return { ...current, closing: true }
    })
  }, [])

  useEffect(() => {
    if (!layer?.closing) return undefined
    closeTimer.current = setTimeout(() => setLayer(null), prefersReducedMotion() ? 0 : SHEET_CLOSE_MS)
    return () => clearTimeout(closeTimer.current)
  }, [layer?.closing])

  const openSheet = useCallback((props) => setLayer({ type: 'sheet', props }), [])
  const openDialog = useCallback((props) => setLayer({ type: 'dialog', props }), [])

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // Esc로 닫기
  useEffect(() => {
    if (!layer) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [layer, close])

  const value = useMemo(
    () => ({ openSheet, openDialog, showToast, close }),
    [openSheet, openDialog, showToast, close],
  )

  // content는 React 요소이거나, close를 받아 요소를 돌려주는 함수다.
  const renderContent = (content) => (typeof content === 'function' ? content({ close }) : content)

  let content = null
  if (layer?.type === 'sheet') {
    content = (
      <BottomSheet title={layer.props.title} onClose={close}>
        {renderContent(layer.props.content)}
      </BottomSheet>
    )
  } else if (layer?.type === 'dialog') {
    content = <Dialog label={layer.props.label}>{renderContent(layer.props.content)}</Dialog>
  }

  return (
    <OverlayContext.Provider value={value}>
      {children}
      {layer && (
        <div className={`ui-overlay${layer.closing ? ' is-closing' : ''}`}>
          <button type="button" className="ui-overlay__dim" aria-label="닫기" onClick={close} />
          {content}
        </div>
      )}
      {toast && (
        <div className="ui-overlay" style={{ pointerEvents: 'none' }}>
          <Toast message={toast} />
        </div>
      )}
    </OverlayContext.Provider>
  )
}

export default OverlayProvider
