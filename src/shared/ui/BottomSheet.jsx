import { useRef, useState } from 'react'
import './Overlay.css'

// 이만큼(px) 또는 시트 높이의 30% 중 작은 값보다 더 끌어내리면 닫힌다.
const CLOSE_DRAG_PX = 120

/**
 * 바텀시트 틀. 핸들 + (선택) 제목 + 내용 영역만 제공한다.
 * 안에 들어갈 내용(메뉴, 목록, 버튼 등)은 쓰는 화면에서 children으로 채운다.
 * 보통 useOverlay().openSheet()로 열고, 직접 쓸 때는 Overlay 레이어 안에 둔다.
 *
 * 동작: 열릴 때 아래에서 올라오고, 핸들을 잡고 아래로 끌어 내리면 닫힌다(마우스·터치).
 * 조금만 끌고 놓으면 제자리로 돌아간다.
 * @param {string} [title] 시트 제목. 없으면 제목 줄을 그리지 않는다.
 * @param {() => void} [onClose] 끌어내려서 닫을 때 호출한다.
 */
function BottomSheet({ title, onClose, children }) {
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const sheetRef = useRef(null)
  const startY = useRef(null)
  const latestDragY = useRef(0)

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
    if (startY.current === null) return
    moveTo(Math.max(0, event.clientY - startY.current)) // 위로는 올라가지 않는다
  }

  const handlePointerEnd = () => {
    if (startY.current === null) return
    startY.current = null
    setDragging(false)
    const height = sheetRef.current?.offsetHeight ?? 300
    if (latestDragY.current > Math.min(CLOSE_DRAG_PX, height * 0.3)) {
      onClose?.() // 닫히는 애니메이션은 현재 위치에서 이어서 내려간다.
    } else {
      moveTo(0)
    }
  }

  return (
    <div
      ref={sheetRef}
      className="ui-sheet"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        transform: dragY ? `translateY(${dragY}px)` : undefined,
        transition: dragging ? 'none' : 'transform 0.2s ease-out',
        '--sheet-drag': `${dragY}px`,
      }}
    >
      <div
        className="ui-sheet__grab"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="ui-sheet__handle" />
      </div>
      {title && <h2 className="ui-sheet__title">{title}</h2>}
      {children}
    </div>
  )
}

export default BottomSheet
