import { useEffect, useRef, useState } from 'react'
import Mascot from '../../shared/ui/Mascot.jsx'
import { STICKER_SIZE, STICKER_TILT } from './data.js'
import { drawStrokes, fitCanvas } from './signatureCanvas.js'
import './SignatureView.css'

const PAD_HEIGHT = 220 // 서명 그림판(SignaturePad)의 높이. 좌표(0~1)를 px로 바꿀 때 쓴다.
const MARGIN = 10 // 그린 부분 둘레에 남기는 여유(px)
export const FIT_HEIGHT = 132 // fit일 때 손글씨 영역의 높이(px). 그린 크기와 상관없이 항상 같다.
const FIT_MAX_WIDTH_RATIO = 0.8 // 잘라낸 손글씨의 최대 너비(전체 너비에 대한 비율)

/**
 * 선과 스티커를 감싸는 최소 영역(px). 그린 것이 없으면 null.
 * 지우개 선은 영역에 넣지 않는다. 스티커는 기울어도 들어가도록 대각선 길이의 절반만큼 잡는다.
 */
function contentBounds(ops, width) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const include = (x, y, half) => {
    minX = Math.min(minX, x - half)
    maxX = Math.max(maxX, x + half)
    minY = Math.min(minY, y - half)
    maxY = Math.max(maxY, y + half)
  }
  ops.forEach((op) => {
    if (op.type === 'stroke' && !op.erase) {
      op.points.forEach(([x, y]) => include(x * width, y * PAD_HEIGHT, 0))
    } else if (op.type === 'sticker') {
      include(op.x * width, op.y * PAD_HEIGHT, ((op.size ?? STICKER_SIZE.initial) / 2) * Math.SQRT2)
    }
  })
  if (minX === Infinity) return null
  minX = Math.max(minX - MARGIN, 0)
  minY = Math.max(minY - MARGIN, 0)
  maxX = Math.min(maxX + MARGIN, width)
  maxY = Math.min(maxY + MARGIN, PAD_HEIGHT)
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

/**
 * 쓴 손글씨를 보기만 하는 그림(편지 완성본 4-6용). 서명 그림판(SignaturePad)과 같은 크기 비율로 선과 스티커를 그린다.
 * 선 좌표와 스티커 위치는 0~1 비율이라, 이 요소의 너비에 맞춰 그려진다.
 * @param {Array} ops draft.signature.ops (letterDraftContext 참고)
 * @param {boolean} [fit] true면 그린 부분만 잘라 높이 고정(FIT_HEIGHT) 영역의 가운데에 둔다. 그림판 어디에 그렸든 여백이 생기지 않고,
 *   그린 크기와 상관없이 영역 높이가 같다. 영역보다 크게 그렸으면 줄여서 맞추고, 작으면 줄이지 않는다.
 */
function SignatureView({ ops, fit = false }) {
  const frameRef = useRef(null)
  const canvasRef = useRef(null)
  const opsRef = useRef(ops)
  const [frameWidth, setFrameWidth] = useState(0)

  // 전체 너비(그림판과 같은 너비)를 잰다. 잘라내기 계산에 쓴다.
  useEffect(() => {
    const frame = frameRef.current
    const measure = () => setFrameWidth(frame.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    opsRef.current = ops
    const canvas = canvasRef.current
    const { width, height } = canvas.getBoundingClientRect()
    drawStrokes(canvas.getContext('2d'), ops, width, height)
  }, [ops])

  // 크기가 바뀌면 캔버스가 지워지므로 맞추고 다시 그린다.
  useEffect(() => {
    const canvas = canvasRef.current
    const fitToSize = () => {
      fitCanvas(canvas)
      const { width, height } = canvas.getBoundingClientRect()
      drawStrokes(canvas.getContext('2d'), opsRef.current, width, height)
    }
    fitToSize()
    const observer = new ResizeObserver(fitToSize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  const bounds = fit && frameWidth ? contentBounds(ops, frameWidth) : null
  const scale = bounds
    ? Math.min(1, (frameWidth * FIT_MAX_WIDTH_RATIO) / bounds.width, FIT_HEIGHT / bounds.height)
    : 1

  // fit이면 그림판 크기의 무대(stage)를 줄이고 옮겨서 그린 부분만 작은 창(crop)에 보이게 한다.
  const cropStyle = fit
    ? bounds
      ? { width: bounds.width * scale, height: bounds.height * scale }
      : { height: 0 }
    : undefined
  const stageStyle =
    fit && bounds
      ? {
          width: frameWidth,
          transform: `scale(${scale}) translate(${-bounds.x}px, ${-bounds.y}px)`,
        }
      : undefined

  return (
    <div ref={frameRef} className={`signature-view${fit ? ' signature-view--fit' : ''}`} role="img" aria-label="내가 남긴 서명">
      <div className="signature-view__crop" style={cropStyle}>
        <div className="signature-view__stage" style={stageStyle}>
          <canvas ref={canvasRef} className="signature-view__canvas" />
          {ops.map((op) =>
            op.type === 'sticker' ? (
              <div
                key={op.id}
                className="signature-view__sticker"
                style={{
                  left: `${op.x * 100}%`,
                  top: `${op.y * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${op.rotate ?? STICKER_TILT.initial}deg)`,
                }}
              >
                <Mascot pose={op.pose} size={op.size ?? STICKER_SIZE.initial} />
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  )
}

export default SignatureView
