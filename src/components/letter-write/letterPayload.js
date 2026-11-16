// 편지 보내기(POST /api/letters/) 요청에 넣을 서명 이미지와 스티커 목록을 만든다.
// 명세: 문서 레포 api/letters.md, spec/letter.md
//   - signature: 손글씨 서명 PNG 파일(1MB 이하). 스티커는 그림에 넣지 않는다.
//   - stickers: JSON 문자열 [{ code, x, y, rotation, scale }]. x, y는 편지지 기준 0~1 비율(스티커 중심), rotation은 도.
//   스티커 크기는 scale(편지지 너비 대비 스티커 너비, 0~1)로 보낸다. 서버 필드는 요청 중이다(requests/fe2be 스티커 크기 필드).
import { STICKERS, STICKER_TILT, STICKER_SIZE } from './data.js'
import { drawStrokes } from './signatureCanvas.js'

// 서명 PNG를 그리는 기준 크기(그림판 높이 220px, 시안 너비 360px)와 화면 배율.
// 선 좌표가 0~1 비율이라 어떤 크기로 그려도 모양이 같고, 펜 굵기는 기준 크기에 맞춰 보인다.
const SIGNATURE_WIDTH = 360
const SIGNATURE_HEIGHT = 220
const SIGNATURE_SCALE = 2
const MAX_SIGNATURE_BYTES = 1024 * 1024 // 서버 제한 1MB

/** 서명 선(ops)이 하나라도 있는지. 스티커만 있으면 서명 이미지는 보내지 않는다. */
export const hasSignatureStroke = (ops) => ops.some((op) => op.type === 'stroke' && !op.erase)

/**
 * 서명 선을 투명 배경 PNG로 만든다. 스티커는 그리지 않는다.
 * 그릴 선이 없으면 null이다(서명은 선택 항목이라 보내지 않는다).
 * @param {Array} ops letterDraftContext의 signature.ops
 * @returns {Promise<File|null>} 'signature.png'
 */
/** 캔버스에 조금이라도 보이는(투명하지 않은) 점이 있는지. */
function hasVisiblePixel(ctx, width, height) {
  const { data } = ctx.getImageData(0, 0, width, height)
  for (let index = 3; index < data.length; index += 4) if (data[index] !== 0) return true
  return false
}

export async function signatureToFile(ops) {
  if (!hasSignatureStroke(ops)) return null

  const canvas = document.createElement('canvas')
  canvas.width = SIGNATURE_WIDTH * SIGNATURE_SCALE
  canvas.height = SIGNATURE_HEIGHT * SIGNATURE_SCALE
  const ctx = canvas.getContext('2d')
  ctx.setTransform(SIGNATURE_SCALE, 0, 0, SIGNATURE_SCALE, 0, 0)
  drawStrokes(ctx, ops, SIGNATURE_WIDTH, SIGNATURE_HEIGHT) // 지우개는 destination-out이라 투명하게 지워진다.
  // 선을 그렸다가 지우개로 모두 지웠으면 보이는 점이 없다. 빈 그림을 보내지 않는다(받는 쪽에 빈 서명 자리가 생긴다).
  if (!hasVisiblePixel(ctx, canvas.width, canvas.height)) return null

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('서명 이미지를 만들지 못했어요.')
  if (blob.size > MAX_SIGNATURE_BYTES) throw new Error('서명 이미지가 너무 커요. 조금 줄여서 다시 그려 주세요.')
  return new File([blob], 'signature.png', { type: 'image/png' })
}

const round = (value) => Math.round(value * 10000) / 10000

// 스티커 크기(px)를 편지지 너비(시안 기준 360px)에 대한 비율로 바꾼다. 받는 사람 화면은 scale × 편지지 너비로 그린다.
const toScale = (size) => round(Math.min(Math.max((size ?? STICKER_SIZE.initial) / SIGNATURE_WIDTH, 0), 1))

/**
 * 스티커 목록을 서버 형식으로 바꾼다. 서버 스티커 코드를 모르는 스티커는 뺀다.
 * @param {Array} ops letterDraftContext의 signature.ops
 * @returns {Array<{code: string, x: number, y: number, rotation: number, scale: number}>}
 */
export function toStickerPayload(ops) {
  return ops
    .filter((op) => op.type === 'sticker')
    .map((op) => {
      const sticker = STICKERS.find((item) => item.pose === op.pose)
      if (!sticker) return null
      return { code: sticker.code, x: round(op.x), y: round(op.y), rotation: op.rotate ?? STICKER_TILT.initial, scale: toScale(op.size) }
    })
    .filter(Boolean)
}

/**
 * 편지 보내기 요청에 붙일 서명 파일과 스티커 JSON 문자열.
 * 서명이 없으면 signature는 null, 스티커가 없으면 stickers는 null이다. 없는 항목은 요청에 넣지 않는다.
 * @returns {Promise<{ signature: File|null, stickers: string|null }>}
 */
export async function buildSignatureParts(ops) {
  const stickers = toStickerPayload(ops)
  return {
    signature: await signatureToFile(ops),
    stickers: stickers.length > 0 ? JSON.stringify(stickers) : null,
  }
}
