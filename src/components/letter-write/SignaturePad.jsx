import { useCallback, useEffect, useRef } from 'react'
import Mascot from '../../shared/ui/Mascot.jsx'
import { PEN_COLORS } from './data.js'
import './SignaturePad.css'

const PEN_WIDTH = 3
const ERASER_WIDTH = 18
const STICKER_SIZE = 64
const STICKER_TILT = 8 // 붙인 스티커는 시안처럼 살짝 기울인다(도).

// 색 id → 실제 색. 토큰(CSS 변수) 값을 읽어 쓴다.
function colorOf(id) {
  const token = PEN_COLORS.find((color) => color.id === id)?.token ?? PEN_COLORS[0].token
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim()
}

function paintSegment(ctx, op, from, to, width, height) {
  ctx.globalCompositeOperation = op.erase ? 'destination-out' : 'source-over'
  ctx.strokeStyle = op.erase ? '#000' : colorOf(op.color)
  ctx.lineWidth = op.erase ? ERASER_WIDTH : PEN_WIDTH
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(from[0] * width, from[1] * height)
  ctx.lineTo(to[0] * width, to[1] * height)
  ctx.stroke()
}

/**
 * 손글씨 서명 그림판(시안 4-4, 4-5). 손가락·마우스로 그리고, 스티커를 붙이고 옮긴다.
 * 그린 내용은 ops(작업 목록)로 위에서 관리한다. 선 좌표와 스티커 위치는 그림판 크기에 대한 0~1 비율이라
 * 화면 너비가 달라져도 모양이 같다.
 *
 * @param {Array} ops 그린 순서대로 쌓은 작업 목록(letterDraftContext 참고)
 * @param {(ops: Array) => void} onOpsChange
 * @param {'pen'|'eraser'} tool 그리기 도구
 * @param {string} colorId 펜 색(PEN_COLORS의 id)
 * @param {'draw'|'sticker'} mode draw: 선을 그린다 / sticker: 스티커를 옮긴다
 */
function SignaturePad({ ops, onOpsChange, tool, colorId, mode }) {
  const canvasRef = useRef(null)
  const currentRef = useRef(null) // 지금 그리고 있는 선
  const dragRef = useRef(null) // 지금 옮기고 있는 스티커

  const size = () => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  }

  // ops 전체를 다시 그린다.
  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, width, height)
    ops.forEach((op) => {
      if (op.type !== 'stroke') return
      op.points.forEach((point, index) => {
        paintSegment(ctx, op, op.points[Math.max(index - 1, 0)], point, width, height)
      })
    })
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
      const dpr = window.devicePixelRatio || 1
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
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
  const handleDown = (event) => {
    if (mode !== 'draw') return
    event.currentTarget.setPointerCapture(event.pointerId)
    const start = point(event)
    currentRef.current = { type: 'stroke', erase: tool === 'eraser', color: colorId, points: [start] }
    const { width, height } = size()
    paintSegment(canvasRef.current.getContext('2d'), currentRef.current, start, start, width, height)
  }

  const handleMove = (event) => {
    const current = currentRef.current
    if (!current) return
    const next = point(event)
    const from = current.points[current.points.length - 1]
    current.points.push(next)
    const { width, height } = size()
    paintSegment(canvasRef.current.getContext('2d'), current, from, next, width, height)
  }

  const handleUp = () => {
    const current = currentRef.current
    if (!current) return
    currentRef.current = null
    onOpsChange([...ops, current])
  }

  // ── 스티커 옮기기 ──
  const handleStickerDown = (event, index) => {
    if (mode !== 'sticker') return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = index
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

  return (
    <div className={`signature-pad signature-pad--${mode}`}>
      <canvas
        ref={canvasRef}
        className="signature-pad__canvas"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      />
      {ops.map((op, index) =>
        op.type === 'sticker' ? (
          <div
            key={op.id}
            className="signature-pad__sticker"
            style={{
              left: `${op.x * 100}%`,
              top: `${op.y * 100}%`,
              transform: `translate(-50%, -50%) rotate(${STICKER_TILT}deg)`,
            }}
            onPointerDown={(event) => handleStickerDown(event, index)}
            onPointerMove={handleStickerMove}
            onPointerUp={handleStickerUp}
            onPointerCancel={handleStickerUp}
          >
            <Mascot pose={op.pose} size={STICKER_SIZE} />
          </div>
        ) : null,
      )}
    </div>
  )
}

export default SignaturePad
