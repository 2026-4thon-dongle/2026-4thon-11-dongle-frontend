import { useEffect, useRef, useState } from 'react'
import Button from '../../shared/ui/Button.jsx'
import './StampSendSheet.css'

// 접힌 시트를 위로 이만큼(px) 이상 끌면 열린다. 이보다 적게 움직이면 누른 것으로 본다.
const SWIPE_PX = 30
// 열린 시트를 이만큼(px) 또는 시트 높이의 30% 중 작은 값보다 더 끌어내리면 접힌다.
const CLOSE_DRAG_PX = 120

/**
 * 우표 고르고 보내기 시트(시안 4-6)와 내렸을 때의 접힌 시트(시안 4-6-1)를 하나로 합친 시트.
 * 열려 있을 때는 제목과 내용(children)이 보이고, 내리면 같은 시트가 줄어들면서 안내 문구와 버튼으로 바뀐다.
 * 공용 Overlay의 시트는 닫히면 사라지는 방식이라 접힌 시트와 따로 놀아서, 이 화면 전용으로 따로 만들었다.
 *
 * 동작: 손잡이를 아래로 끌거나 뒤 어두운 곳을 누르거나 Esc를 누르면 접히고,
 * 접힌 시트의 손잡이·안내 문구를 위로 끌거나 누르거나 아래 버튼을 누르면 열린다.
 * @param {boolean} open 열려 있는지
 * @param {(open: boolean) => void} onOpenChange 열거나 접을 때
 * @param {string} title 열린 시트의 제목 (예: '편지를 보낼까요?')
 * @param {boolean} [ready=true] 시트에 보여 줄 값을 다 받았는지. false면 접힌 시트의 버튼이 비활성이다.
 * @param {import('react').ReactNode} children 열린 시트의 내용
 */
function StampSendSheet({ open, onOpenChange, title, ready = true, children }) {
  const sheetRef = useRef(null)
  const startY = useRef(null)
  const latestDragY = useRef(0)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)

  // Esc로 접는다.
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => event.key === 'Escape' && onOpenChange(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  const moveTo = (y) => {
    latestDragY.current = y
    setDragY(y)
  }

  const handlePointerDown = (event) => {
    startY.current = event.clientY
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (startY.current === null || !open) return
    moveTo(Math.max(0, event.clientY - startY.current)) // 열린 시트는 아래로만 끌린다.
  }

  const handlePointerEnd = (event) => {
    if (startY.current === null) return
    const moved = event.clientY - startY.current
    startY.current = null
    setDragging(false)

    if (open) {
      const height = sheetRef.current?.offsetHeight ?? 300
      const close = latestDragY.current > Math.min(CLOSE_DRAG_PX, height * 0.3)
      moveTo(0)
      if (close) onOpenChange(false)
    } else if (ready && (moved <= -SWIPE_PX || Math.abs(moved) < SWIPE_PX)) {
      onOpenChange(true) // 위로 끌었거나 거의 움직이지 않고 눌렀다.
    }
  }

  const grabHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: () => {
      startY.current = null
      setDragging(false)
      moveTo(0)
    },
  }

  return (
    <div className={`stamp-send${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="stamp-send__dim"
        aria-label="시트 내리기"
        tabIndex={-1}
        onClick={() => onOpenChange(false)}
      />

      <div
        ref={sheetRef}
        className="stamp-send__sheet"
        role={open ? 'dialog' : undefined}
        aria-modal={open ? 'true' : undefined}
        aria-label={open ? title : undefined}
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? 'none' : undefined,
        }}
      >
        <div className="stamp-send__grab" {...grabHandlers}>
          <div className="stamp-send__handle" />
        </div>

        {/* 열린 시트: 제목 + 내용. 접히면 높이가 0으로 줄어든다. */}
        <div className="stamp-send__fold stamp-send__fold--full" inert={!open}>
          <div className="stamp-send__fold-inner">
            <div className="stamp-send__content">
              <h2 className="stamp-send__title">{title}</h2>
              {children}
            </div>
          </div>
        </div>

        {/* 접힌 시트: 안내 문구 + 버튼. 열리면 높이가 0으로 줄어든다. */}
        <div className="stamp-send__fold stamp-send__fold--peek" inert={open}>
          <div className="stamp-send__fold-inner stamp-send__peek">
            <button
              type="button"
              className="stamp-send__hint"
              disabled={!ready}
              aria-label="우표 고르고 보내기 시트 열기"
              {...grabHandlers}
              // 키보드는 Enter/Space(click의 detail이 0)로 연다. 누르기와 끌기는 위 포인터 동작이 맡는다.
              onClick={(event) => event.detail === 0 && onOpenChange(true)}
            >
              {ready ? '위로 올리면 우표를 고르고 보낼 수 있어요' : '우표와 도착 시간을 불러오는 중이에요…'}
            </button>
            <Button className="stamp-send__send" onClick={() => onOpenChange(true)} disabled={!ready}>
              우표 고르고 보내기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StampSendSheet
