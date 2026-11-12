// 서명 그림판(SignaturePad)과 읽기 전용 서명(SignatureView)이 같이 쓰는 그리기 도구.
import { PEN_COLORS } from './data.js'

export const PEN_WIDTH = 3
export const ERASER_WIDTH = 18

// 색 id → 실제 색. 토큰(CSS 변수) 값을 읽어 쓴다.
export function colorOf(id) {
  const token = PEN_COLORS.find((color) => color.id === id)?.token ?? PEN_COLORS[0].token
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim()
}

// 선 한 조각(from → to)을 그린다. 좌표는 0~1 비율이라 width, height를 곱해 쓴다.
export function paintSegment(ctx, op, from, to, width, height) {
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

// ops의 선을 모두 그린다(스티커는 그리지 않는다. 스티커는 화면 요소로 얹는다).
export function drawStrokes(ctx, ops, width, height) {
  ctx.clearRect(0, 0, width, height)
  ops.forEach((op) => {
    if (op.type !== 'stroke') return
    op.points.forEach((point, index) => {
      paintSegment(ctx, op, op.points[Math.max(index - 1, 0)], point, width, height)
    })
  })
}

// 캔버스 픽셀 크기를 화면 크기·화면 배율에 맞춘다. 크기가 바뀌면 지워지므로 호출한 쪽이 다시 그린다.
export function fitCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1
  const { width, height } = canvas.getBoundingClientRect()
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
}
