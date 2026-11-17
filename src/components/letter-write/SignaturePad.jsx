import { useCallback, useEffect, useRef } from 'react'
import Mascot from '../../shared/ui/Mascot.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import { STICKER_SIZE, STICKER_TILT } from './data.js'
import { drawStrokes, fitCanvas, paintSegment } from './signatureCanvas.js'
import './Paper.css'
import './SignaturePad.css'

/**
 * 손글씨 서명 그림판(시안 4-4, 4-5). 손가락·마우스로 그리고, 스티커를 붙이고 옮긴다.
 * 그린 내용은 ops(작업 목록)로 위에서 관리한다. 선 좌표와 스티커 위치는 그림판 크기에 대한 0~1 비율이라
 * 화면 너비가 달라져도 모양이 같다.
 *
 * @param {Array} ops 그린 순서대로 쌓은 작업 목록(letterDraftContext 참고)
 * @param {(ops: Array) => void} onOpsChange
 * @param {'pen'|'eraser'} tool 그리기 도구
 * @param {string} colorId 펜 색(PEN_COLORS의 id)
 * @param {'draw'|'sticker'} mode draw: 선을 그린다 / sticker: 스티커를 고르고 옮긴다
 * @param {string} paperId 고른 편지지 id. 그림판 바탕이 편지지와 같은 색이 된다.
 * @param {string|null} selectedId 고른 스티커의 id (스티커 모드에서만 표시된다)
 * @param {(id: string|null) => void} onSelect 스티커를 고르거나(id) 선택을 푼다(null)
 * @param {(id: string) => void} onRemove 스티커를 지운다
 */
function SignaturePad({ ops, onOpsChange, tool, colorId, mode, paperId = 'basic', selectedId = null, onSelect, onRemove }) {
  const canvasRef = useRef(null)
  const currentRef = useRef(null) // 지금 그리고 있는 선
  const pointerRef = useRef(null) // 그 선을 그리고 있는 손가락(pointerId)
  const dragRef = useRef(null) // 지금 옮기고 있는 스티커
  const resizeRef = useRef(null) // 지금 크기·각도를 조절하고 있는 스티커

  const size = () => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  }

  // ops 전체를 다시 그린다.
  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { width, height } = canvas.getBoundingClientRect()
    drawStrokes(canvas.getContext('2d'), ops, width, height)
  }, [ops])

  // ops가 바뀌면 다시 그린다.
  useEffect(() => {
    redraw()
  }, [redraw])

  // 캔버스 픽셀 크기를 화면 크기·화면 배율에 맞춘다(크기가 바뀌면 지워지므로 다시 그린다).
  const redrawRef = useRef(redraw)
  useEffect(() => {
    redrawRef.current = redraw
  }, [redraw])

  useEffect(() => {
    const canvas = canvasRef.current
    const fit = () => {
      fitCanvas(canvas)
      redrawRef.current()
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  const point = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return [
      Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1),
      Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1),
    ]
  }

  // ── 선 그리기 ──
  // 한 번에 한 손가락만 그린다. 그리는 중에 손바닥·다른 손가락이 닿아도 그 입력은 무시한다
  // (같이 받으면 앞 선이 저장되지 않고 사라지거나, 두 손가락 사이를 잇는 선이 생겼다).
  const handleDown = (event) => {
    if (mode !== 'draw') {
      onSelect?.(null) // 빈 곳을 누르면 스티커 선택을 푼다.
      return
    }
    if (currentRef.current) return
    pointerRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    const start = point(event)
    currentRef.current = { type: 'stroke', erase: tool === 'eraser', color: colorId, points: [start] }
    const { width, height } = size()
    paintSegment(canvasRef.current.getContext('2d'), currentRef.current, start, start, width, height)
  }

  const handleMove = (event) => {
    const current = currentRef.current
    if (!current || event.pointerId !== pointerRef.current) return
    const next = point(event)
    const from = current.points[current.points.length - 1]
    current.points.push(next)
    const { width, height } = size()
    paintSegment(canvasRef.current.getContext('2d'), current, from, next, width, height)
  }

  const handleUp = (event) => {
    const current = currentRef.current
    if (!current || event.pointerId !== pointerRef.current) return
    currentRef.current = null
    pointerRef.current = null
    onOpsChange([...ops, current])
  }

  // ── 스티커 옮기기 ──
  const handleStickerDown = (event, index) => {
    if (mode !== 'sticker') return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = index
    onSelect?.(ops[index].id)
  }

  // 키보드: Enter·Space로 고르고, 고른 스티커는 Delete·Backspace로 지운다.
  const handleStickerKey = (event, op) => {
    if (mode !== 'sticker') return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect?.(op.id)
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      onRemove?.(op.id)
    }
  }

  const handleStickerMove = (event) => {
    const index = dragRef.current
    if (index === null) return
    const [x, y] = point(event)
    onOpsChange(ops.map((op, i) => (i === index ? { ...op, x, y } : op)))
  }

  const handleStickerUp = () => {
    dragRef.current = null
  }

  // ── 스티커 크기·각도 조절: 모서리 손잡이를 끌면 스티커 중심을 기준으로 크기와 각도가 함께 바뀐다. ──
  const handleResizeDown = (event, op) => {
    event.stopPropagation() // 스티커 끌기가 시작되지 않게 한다.
    event.currentTarget.setPointerCapture(event.pointerId)
    const rect = canvasRef.current.getBoundingClientRect()
    const cx = rect.left + op.x * rect.width
    const cy = rect.top + op.y * rect.height
    resizeRef.current = {
      id: op.id,
      cx,
      cy,
      startDistance: Math.max(Math.hypot(event.clientX - cx, event.clientY - cy), 1),
      startAngle: Math.atan2(event.clientY - cy, event.clientX - cx),
      startSize: op.size ?? STICKER_SIZE.initial,
      startRotate: op.rotate ?? STICKER_TILT.initial,
    }
  }

  const handleResizeMove = (event) => {
    const start = resizeRef.current
    if (!start) return
    const distance = Math.hypot(event.clientX - start.cx, event.clientY - start.cy)
    const angle = Math.atan2(event.clientY - start.cy, event.clientX - start.cx)
    const size = Math.min(Math.max(Math.round((start.startSize * distance) / start.startDistance), STICKER_SIZE.min), STICKER_SIZE.max)
    // 각도는 -180~180도로 맞춘다.
    let rotate = start.startRotate + ((angle - start.startAngle) * 180) / Math.PI
    rotate = Math.round(((((rotate + 180) % 360) + 360) % 360) - 180)
    onOpsChange(ops.map((op) => (op.id === start.id ? { ...op, size, rotate } : op)))
  }

  const handleResizeUp = () => {
    resizeRef.current = null
  }

  // 손잡이 키보드: 위·아래 화살표는 크기, 왼쪽·오른쪽 화살표는 각도를 바꾼다.
  const handleResizeKey = (event, op) => {
    const size = op.size ?? STICKER_SIZE.initial
    const rotate = op.rotate ?? STICKER_TILT.initial
    const patch = {
      ArrowUp: { size: Math.min(size + STICKER_SIZE.step, STICKER_SIZE.max) },
      ArrowDown: { size: Math.max(size - STICKER_SIZE.step, STICKER_SIZE.min) },
      ArrowRight: { rotate: Math.min(rotate + 5, 180) },
      ArrowLeft: { rotate: Math.max(rotate - 5, -180) },
    }[event.key]
    if (!patch) return
    event.preventDefault()
    event.stopPropagation()
    onOpsChange(ops.map((item) => (item.id === op.id ? { ...item, ...patch } : item)))
  }

  return (
    <div className={`paper paper--${paperId} signature-pad signature-pad--${mode}`}>
      <canvas
        ref={canvasRef}
        className="signature-pad__canvas"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      />
      {ops.map((op, index) => {
        if (op.type !== 'sticker') return null
        const selected = mode === 'sticker' && op.id === selectedId
        const size = op.size ?? STICKER_SIZE.initial
        return (
          <div
            key={op.id}
            className={`signature-pad__sticker${selected ? ' is-selected' : ''}`}
            role="button"
            tabIndex={mode === 'sticker' ? 0 : -1}
            aria-label="붙인 스티커"
            aria-pressed={selected}
            style={{
              left: `${op.x * 100}%`,
              top: `${op.y * 100}%`,
              transform: `translate(-50%, -50%) rotate(${op.rotate ?? STICKER_TILT.initial}deg)`,
              '--rotate': `${op.rotate ?? STICKER_TILT.initial}deg`,
              // 고른 스티커의 원 테두리: 스티커 크기에 비례해 조금 넉넉하게 두르고(귀가 안 나오게), 버튼은 이 원 위에 놓는다.
              '--ring-offset': `${size * 0.12}px`,
              '--ring-radius': `${size * 0.62 + 1}px`,
            }}
            onPointerDown={(event) => handleStickerDown(event, index)}
            onPointerMove={handleStickerMove}
            onPointerUp={handleStickerUp}
            onPointerCancel={handleStickerUp}
            onKeyDown={(event) => handleStickerKey(event, op)}
          >
            <Mascot pose={op.pose} size={size} />
            {selected && (
              <button
                type="button"
                className="signature-pad__sticker-handle"
                aria-label="스티커 크기·각도 조절 (끌어서 조절, 방향키로도 가능)"
                onPointerDown={(event) => handleResizeDown(event, op)}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeUp}
                onPointerCancel={handleResizeUp}
                onKeyDown={(event) => handleResizeKey(event, op)}
              >
                {/* 대각선 양방향 화살표 */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M8.5 2H12V5.5M5.5 12H2V8.5M12 2L8 6M2 12L6 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {selected && (
              <button
                type="button"
                className="signature-pad__sticker-remove"
                aria-label="스티커 삭제"
                // 끌기가 시작되지 않게 막아야 이 버튼의 클릭이 동작한다.
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onRemove?.(op.id)}
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SignaturePad
