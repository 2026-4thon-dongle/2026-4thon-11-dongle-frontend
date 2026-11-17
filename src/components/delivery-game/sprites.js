// 직접 배달 게임 그림(임시 에셋). 정식 그림이 나오면 이 파일의 그리는 함수만 바꾼다.
// 색은 디자인 토큰(tokens.css의 CSS 변수)에서 읽어 쓴다. 고향이는 공용 마스코트 그림(편지 든 고향이)을 쓴다.

import mascotLetter from '../../shared/assets/mascot/letter.svg'

const TOKENS = ['bg-cream', 'bg-surface', 'bg-butter', 'bg-peach', 'brand-orange', 'brand-orange-deep', 'brand-sage', 'brand-sky', 'brand-berry', 'brand-blush', 'text-brown', 'text-sub', 'line-soft', 'white']

/** 토큰 색을 읽는다. { 'brand-sky': '#bfdce6', ... } */
export function readPalette(element = document.documentElement) {
  const style = getComputedStyle(element)
  return Object.fromEntries(TOKENS.map((name) => [name, style.getPropertyValue(`--${name}`).trim() || 'white']))
}

/** 고향이 그림을 불러 둔다. */
export function loadPlayerImage() {
  const image = new Image()
  image.src = mascotLetter
  return image
}

// 화면 좌표 계산 ─────────────────────────────────────────────

/**
 * 화면 크기에 따른 배치. 길은 화면 가운데에서 좌우로 천천히 굽는다.
 * @param {number} width
 * @param {number} height
 */
export function createLayout(width, height) {
  const roadWidth = Math.min(width * 0.7, 300)
  return {
    width,
    height,
    roadWidth,
    laneWidth: roadWidth / 3,
    playerY: height * 0.76,
    speed: height * 0.4, // 물건이 내려오는 속도(px/초): 약 1.9초 앞을 보여 준다
    amplitude: width * 0.07,
  }
}

/** 화면 y에서 길 가운데 x. scroll은 지금까지 달린 거리(px). */
export function roadCenter(layout, y, scroll) {
  const distance = scroll + (layout.height - y)
  return layout.width / 2 + layout.amplitude * Math.sin(distance / 260)
}

export function laneX(layout, lane, y, scroll) {
  return roadCenter(layout, y, scroll) + (lane - 1) * layout.laneWidth
}

// 그리기 ────────────────────────────────────────────────────

export function drawBackground(ctx, layout, palette, scroll) {
  const { width, height } = layout
  const sky = ctx.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, palette['brand-sky'])
  sky.addColorStop(0.55, palette['bg-cream'])
  sky.addColorStop(1, palette['bg-butter'])
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, height)

  // 언덕: 길보다 느리게 흘러 멀리 있어 보인다.
  ctx.fillStyle = palette['brand-sage']
  ctx.globalAlpha = 0.55
  for (let i = -1; i < 4; i++) {
    const y = ((scroll * 0.35 + i * height * 0.42) % (height * 1.68)) - height * 0.25
    const left = i % 2 === 0
    ctx.beginPath()
    ctx.ellipse(left ? width * 0.08 : width * 0.92, y, width * 0.42, height * 0.11, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // 구름
  ctx.fillStyle = palette.white
  ctx.globalAlpha = 0.8
  for (let i = 0; i < 3; i++) {
    const y = ((scroll * 0.15 + i * height * 0.5) % (height * 1.5)) - height * 0.2
    const x = width * (0.2 + 0.3 * i)
    ctx.beginPath()
    ctx.arc(x, y, 18, 0, Math.PI * 2)
    ctx.arc(x + 20, y - 8, 22, 0, Math.PI * 2)
    ctx.arc(x + 42, y, 16, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

export function drawRoad(ctx, layout, palette, scroll) {
  const { height, roadWidth, laneWidth } = layout
  const half = roadWidth / 2
  const points = []
  for (let y = -20; y <= height + 20; y += 10) points.push([roadCenter(layout, y, scroll), y])

  ctx.beginPath()
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x - half, y) : ctx.moveTo(x - half, y)))
  for (let i = points.length - 1; i >= 0; i--) ctx.lineTo(points[i][0] + half, points[i][1])
  ctx.closePath()
  ctx.fillStyle = palette['bg-surface']
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = palette['line-soft']
  ctx.stroke()

  // 레인 사이 점선. 달린 거리만큼 흘러간다.
  ctx.strokeStyle = palette['line-soft']
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  const dash = 34
  const offset = scroll % dash
  for (const side of [-0.5, 0.5]) {
    for (let y = -dash + offset; y < height + dash; y += dash) {
      const x1 = roadCenter(layout, y, scroll) + side * laneWidth
      const x2 = roadCenter(layout, y + 14, scroll) + side * laneWidth
      ctx.beginPath()
      ctx.moveTo(x1, y)
      ctx.lineTo(x2, y + 14)
      ctx.stroke()
    }
  }
}

export function drawPuddle(ctx, x, y, layout, palette) {
  const w = layout.laneWidth * 0.36
  ctx.fillStyle = palette['brand-sky']
  ctx.beginPath()
  ctx.ellipse(x, y, w, w * 0.42, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = palette.white
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.ellipse(x - w * 0.35, y - w * 0.1, w * 0.22, w * 0.08, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

/** 우표 조각: 톱니 테두리 우표 안에 하트. time으로 살짝 위아래로 움직인다. */
export function drawPiece(ctx, x, y, palette, time) {
  const w = 26
  const h = 32
  const top = y - h / 2 + Math.sin(time * 5 + x) * 2
  const left = x - w / 2
  ctx.fillStyle = palette.white
  ctx.fillRect(left, top, w, h)
  // 톱니(작은 원으로 테두리를 파낸 모양)
  ctx.fillStyle = palette['bg-surface']
  for (let i = 0; i <= 4; i++) {
    for (const [cx, cy] of [[left + (i * w) / 4, top], [left + (i * w) / 4, top + h], [left, top + (i * h) / 4], [left + w, top + (i * h) / 4]]) {
      ctx.beginPath()
      ctx.arc(cx, cy, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.fillStyle = palette['bg-peach']
  ctx.fillRect(left + 4, top + 4, w - 8, h - 8)
  ctx.fillStyle = palette['brand-berry']
  ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('♥', x, top + h / 2 + 1)
  ctx.strokeStyle = palette['line-soft']
  ctx.lineWidth = 1
  ctx.strokeRect(left, top, w, h)
}

/** 고향이. hitTime이 최근이면 흔들리고 반투명해진다. */
export function drawPlayer(ctx, image, x, y, layout, palette, time, hitAgo) {
  const size = Math.min(layout.laneWidth * 1.05, 96)
  const bounce = Math.abs(Math.sin(time * 9)) * 4
  const shaking = hitAgo < 0.45
  ctx.save()
  ctx.translate(x, y - bounce)
  if (shaking) {
    ctx.rotate(Math.sin(hitAgo * 40) * 0.12)
    ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(hitAgo * 30))
  }
  if (image.complete && image.naturalWidth) {
    const ratio = image.naturalHeight / image.naturalWidth
    ctx.drawImage(image, -size / 2, -size * ratio * 0.8, size, size * ratio)
  } else {
    ctx.fillStyle = palette['brand-orange']
    ctx.beginPath()
    ctx.arc(0, -size * 0.4, size * 0.35, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** 조각을 주웠을 때 반짝임, 부딪혔을 때 물방울. age는 생긴 뒤 지난 초. */
export function drawEffect(ctx, effect, age, palette) {
  const t = Math.min(1, age / 0.6)
  ctx.globalAlpha = 1 - t
  if (effect.type === 'piece') {
    ctx.fillStyle = palette['brand-orange-deep']
    ctx.font = '16px Jua, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('+1', effect.x, effect.y - 30 - t * 30)
    ctx.fillStyle = palette['brand-orange']
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(effect.x + Math.cos(angle) * t * 26, effect.y + Math.sin(angle) * t * 26, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    ctx.fillStyle = palette['brand-sky']
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI + (i / 6) * Math.PI
      ctx.beginPath()
      ctx.arc(effect.x + Math.cos(angle) * t * 30, effect.y + Math.sin(angle) * t * 30 + t * t * 20, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
}
