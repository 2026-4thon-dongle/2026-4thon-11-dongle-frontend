import { useEffect, useRef, useState } from 'react'
import Icon from '../../shared/ui/Icon.jsx'
import { createGame, currentStars, moveLane, step } from './engine.js'
import { formatDuration } from './format.js'
import {
  createLayout,
  drawBackground,
  drawEffect,
  drawPiece,
  drawPlayer,
  drawPuddle,
  drawRoad,
  laneX,
  loadPlayerImage,
  readPalette,
  roadCenter,
} from './sprites.js'
import './GameCanvas.css'

const COUNTDOWN = 3
// 화면 위쪽에 물건이 보이기 시작하는 시간(초). layout.speed와 함께 화면 높이를 거의 채운다.
const LOOK_AHEAD = 2.4
const SWIPE_PX = 24

/**
 * 9-1 직접 배달 게임 플레이 화면. 서버가 준 코스를 캔버스에 그리고, 30초가 지나면 onEnd로 결과를 넘긴다.
 * 조작: 아래 좌우 버튼, 화면 좌우 스와이프, 키보드 ←/→(A/D).
 * @param {object} run 판 시작 응답(POST /api/game/runs/)
 * @param {Array<{ stars: number, reduce_seconds: number }>} starRules 별마다 줄어드는 시간(게임 홈의 rules.stars)
 * @param {(result: { pieces: number, hits: number }) => void} onEnd
 */
function GameCanvas({ run, starRules, onEnd }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const startedRef = useRef(false)
  const onEndRef = useRef(onEnd)
  const [countdown, setCountdown] = useState(COUNTDOWN)
  const [hud, setHud] = useState({ remaining: run.run_seconds, pieces: 0, hits: 0, stars: 0 })

  if (gameRef.current === null) gameRef.current = createGame(run)

  useEffect(() => {
    onEndRef.current = onEnd
  }, [onEnd])

  const move = (direction) => {
    if (!startedRef.current) return
    gameRef.current = moveLane(gameRef.current, direction)
  }

  // 3, 2, 1 뒤에 출발한다.
  useEffect(() => {
    if (countdown < 0) return undefined
    const timer = setTimeout(() => {
      if (countdown === 0) startedRef.current = true
      setCountdown((value) => value - 1)
    }, countdown === 0 ? 500 : 800)
    return () => clearTimeout(timer)
  }, [countdown])

  useEffect(() => {
    const onKey = (event) => {
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) move(-1)
      else if (['ArrowRight', 'd', 'D'].includes(event.key)) move(1)
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // 그리기 루프
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const ctx = canvas.getContext('2d')
    const palette = readPalette()
    const player = loadPlayerImage()
    // 루프가 프레임마다 바꾸는 값. 화면 상태(state)가 아니라 그리기에만 쓴다.
    const loop = {
      layout: createLayout(wrap.clientWidth, wrap.clientHeight),
      frame: 0,
      last: performance.now(),
      clock: 0,
      visualLane: 1,
      hitAt: -10,
      effects: [],
      ended: false,
    }

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      loop.layout = createLayout(wrap.clientWidth, wrap.clientHeight)
      canvas.width = Math.round(loop.layout.width * ratio)
      canvas.height = Math.round(loop.layout.height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)

    const render = (now) => {
      const { layout } = loop
      // 게임 시간은 실제 시간을 따른다(서버도 시작 시각으로 판을 잰다). 화면이 느려도 한 프레임은 1초까지만 흐른다.
      const dt = Math.min(1, (now - loop.last) / 1000)
      loop.last = now
      loop.clock += dt
      const { clock } = loop
      let game = gameRef.current
      if (startedRef.current && !game.finished) {
        game = step(game, dt)
        gameRef.current = game
        for (const event of game.events) {
          const scrollNow = game.elapsed * layout.speed
          loop.effects.push({ type: event.type, x: laneX(layout, event.item.lane, layout.playerY, scrollNow), y: layout.playerY, at: clock })
          if (event.type === 'puddle') {
            loop.hitAt = clock
            navigator.vibrate?.(60)
          }
        }
        const remaining = Math.ceil(game.duration - game.elapsed)
        const stars = currentStars(game)
        setHud((prev) => (prev.remaining === remaining && prev.pieces === game.pieces && prev.hits === game.hits && prev.stars === stars ? prev : { remaining, pieces: game.pieces, hits: game.hits, stars }))
      }
      loop.visualLane += (game.lane - loop.visualLane) * Math.min(1, dt * 18)

      const scroll = game.elapsed * layout.speed
      drawBackground(ctx, layout, palette, scroll)
      drawRoad(ctx, layout, palette, scroll)
      for (const item of game.items) {
        const ahead = item.t - game.elapsed
        if (item.done || ahead > LOOK_AHEAD) continue
        const y = layout.playerY - ahead * layout.speed
        const x = laneX(layout, item.lane, y, scroll)
        if (item.kind === 'puddle') drawPuddle(ctx, x, y, layout, palette)
        else drawPiece(ctx, x, y, palette, clock)
      }
      const playerX = roadCenter(layout, layout.playerY, scroll) + (loop.visualLane - 1) * layout.laneWidth
      drawPlayer(ctx, player, playerX, layout.playerY, layout, palette, startedRef.current ? clock : 0, clock - loop.hitAt)
      loop.effects = loop.effects.filter((effect) => clock - effect.at < 0.6)
      loop.effects.forEach((effect) => drawEffect(ctx, effect, clock - effect.at, palette))

      if (game.finished && !loop.ended) {
        loop.ended = true
        onEndRef.current({ pieces: game.pieces, hits: game.hits })
      }
      loop.frame = requestAnimationFrame(render)
    }
    loop.frame = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(loop.frame)
      observer.disconnect()
    }
  }, [])

  // 스와이프
  const swipe = useRef(null)
  const onPointerDown = (event) => {
    swipe.current = event.clientX
  }
  const onPointerUp = (event) => {
    if (swipe.current === null) return
    const dx = event.clientX - swipe.current
    swipe.current = null
    if (Math.abs(dx) >= SWIPE_PX) move(dx > 0 ? 1 : -1)
  }

  const reduce = starRules.find((rule) => rule.stars === hud.stars)?.reduce_seconds ?? 0
  const preview = Math.min(reduce, run.reducible_seconds)

  return (
    <div className="game-canvas" ref={wrapRef} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
      <canvas ref={canvasRef} className="game-canvas__canvas" aria-label="배달 길" role="img" />

      <div className="game-canvas__hud">
        <span className="game-canvas__pill">
          <Icon name="clock" size={18} />
          남은 {hud.remaining}초
        </span>
        <span className="game-canvas__pill">
          <Icon name="stamp" size={18} />
          우표 {hud.pieces}
        </span>
        <span className="game-canvas__pill game-canvas__pill--accent">
          <Icon name="sparkle" size={18} />
          {run.practice ? '연습' : preview ? `-${formatDuration(preview)}` : `${'★'.repeat(hud.stars) || '☆'}`}
        </span>
      </div>

      {countdown >= 0 && (
        <div className="game-canvas__countdown" role="status">
          {countdown > 0 ? countdown : '출발!'}
        </div>
      )}

      <div className="game-canvas__controls">
        <button type="button" className="game-canvas__button" aria-label="왼쪽으로" onPointerDown={(event) => event.stopPropagation()} onClick={() => move(-1)}>
          <Icon name="back" size={26} />
        </button>
        <p className="game-canvas__hint">좌우로 움직여 길을 따라가요</p>
        <button type="button" className="game-canvas__button" aria-label="오른쪽으로" onPointerDown={(event) => event.stopPropagation()} onClick={() => move(1)}>
          <Icon name="chevron" size={26} />
        </button>
      </div>
    </div>
  )
}

export default GameCanvas
