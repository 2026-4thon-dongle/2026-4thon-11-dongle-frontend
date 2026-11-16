// 직접 배달 게임(9-1, 9-2) 검사: 규칙 계산(engine.js), 시간 표기(format.js), API 요청 모양(gameApi.js).
// 서버 응답은 가짜(stub)라 실서버 성공을 뜻하지 않는다. 실행: npm run test:game
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const storage = new Map()
globalThis.localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) }
globalThis.window = new EventTarget()
process.env.VITE_API_BASE_URL = ''
const vite = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, mode: 'production' })
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
let checks = 0

try {
  const engine = await vite.ssrLoadModule('/src/components/delivery-game/engine.js')
  // 별 기준은 서버 rules.py와 같다.
  assert.equal(engine.starsFor(20, 20, 0), 3)
  assert.equal(engine.starsFor(17, 20, 1), 3)
  assert.equal(engine.starsFor(17, 20, 2), 2)
  assert.equal(engine.starsFor(13, 20, 5), 1)
  assert.equal(engine.starsFor(7, 20, 0), 0)
  assert.equal(engine.starsFor(0, 0, 0), 0)
  checks++

  // 조각은 줍고 물웅덩이에는 부딪힌다. 다른 레인의 물건은 지나간다.
  const course = [
    { kind: 'piece', lane: 1, t: 1 },
    { kind: 'puddle', lane: 0, t: 2 },
    { kind: 'piece', lane: 0, t: 3 },
    { kind: 'puddle', lane: 2, t: 4 },
  ]
  let game = engine.createGame({ course, run_seconds: 5 })
  assert.equal(game.pieceTotal, 2)
  game = engine.step(game, 1.5)
  assert.deepEqual([game.pieces, game.hits, game.events.length], [1, 0, 1])
  game = engine.moveLane(game, -1)
  game = engine.moveLane(game, -1)
  assert.equal(game.lane, 0)
  game = engine.step(game, 2)
  assert.deepEqual([game.pieces, game.hits], [2, 1])
  game = engine.step(game, 5)
  assert.equal(game.hits, 1)
  assert.equal(game.finished, true)
  assert.equal(game.elapsed, 5)
  assert.equal(engine.moveLane(game, 1).lane, 0)
  checks++

  const format = await vite.ssrLoadModule('/src/components/delivery-game/format.js')
  assert.equal(format.formatDuration(30), '30초')
  assert.equal(format.formatDuration(1800), '30분')
  assert.equal(format.formatDuration(5400), '1시간 30분')
  assert.equal(format.formatDuration(3 * 3600), '3시간')
  checks++

  const api = await vite.ssrLoadModule('/src/components/delivery-game/gameApi.js')
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push([url, options.method, options.body ? JSON.parse(options.body) : null])
    if (url === '/api/game/runs/') return json({ id: 5, letter_id: 9, practice: false, course: [], run_seconds: 30 }, 201)
    if (url === '/api/game/runs/5/finish/') return json({ id: 5, stars: 2, reduced_seconds: 1200 })
    if (url === '/api/game/runs/6/finish/') return json({ code: 'RUN_EXPIRED', message: '끝난 게임이에요.' }, 409)
    return json({ letters: [] })
  }
  await api.fetchGameHome()
  await api.fetchLetterGame(9)
  await api.startRun('9')
  await api.startRun(null)
  const finished = await api.finishRun(5, { pieces: 14, hits: 2 })
  assert.equal(finished.reduced_seconds, 1200)
  assert.deepEqual(calls, [
    ['/api/game/', 'GET', null],
    ['/api/game/letters/9/', 'GET', null],
    ['/api/game/runs/', 'POST', { letter_id: 9 }],
    ['/api/game/runs/', 'POST', {}],
    ['/api/game/runs/5/finish/', 'POST', { pieces: 14, hits: 2 }],
  ])
  await assert.rejects(api.finishRun(6, { pieces: 1, hits: 0 }), (error) => error.code === 'RUN_EXPIRED' && error.status === 409)
  checks++

  console.log(`PASS: ${checks} delivery game scenarios (stubbed responses; no live server)`)
} finally {
  await vite.close()
}
