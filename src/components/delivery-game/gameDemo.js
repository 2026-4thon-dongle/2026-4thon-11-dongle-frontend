// 직접 배달 게임 가짜 서버. VITE_API_MOCK=true(개발 전용)일 때만 gameApi.js가 쓴다.
// 서버(apps/games)와 같은 모양으로 돌려준다. 코스 만드는 법은 서버와 비슷하게만 흉내 낸다.

import { ApiError } from '../../shared/api/client.js'
import { starsFor } from './engine.js'

const RUN_SECONDS = 30
const runs = new Map()
let nextRunId = 1
let played = 0
const stats = { plays: 0, successes: 0, three_stars: 0, far_three_stars: 0, perfects: 0, best_stars: 0 }
const owned = new Set()

const region = (id, name, sido) => ({ id, name, full_name: `${sido} ${name}`, sido })
const minutesLater = (minutes) => new Date(Date.now() + minutes * 60000).toISOString()

const LETTERS = [
  { id: 901, direction: 'sent', partner: { id: 7, nickname: '하늘빛' }, from_region: region(31, '성북구', '서울'), to_region: region(148, '천안시', '충남'), band: 'near', duration_minutes: 360, sent_at: minutesLater(-60), arrives_at: minutesLater(300) },
  { id: 902, direction: 'incoming', partner: { id: 8, nickname: '갈매기' }, from_region: region(201, '해운대구', '부산'), to_region: region(31, '성북구', '서울'), band: 'far', duration_minutes: 720, sent_at: minutesLater(-30), arrives_at: minutesLater(690) },
]
const reduced = new Map()

const GOALS = [
  ['star-candy', 15, '별사탕', '배달에 처음 성공하기 (별 1개 이상)', 1, 'successes'],
  ['strawberry-cat', 13, '딸기 고양이', '처음으로 별 3개 받기', 1, 'three_stars'],
  ['cloud-bread', 14, '구름빵', '배달 성공 5번', 5, 'successes'],
  ['tulip', 16, '튤립', '별 3개 3번', 3, 'three_stars'],
  ['little-whale', 17, '꼬마 고래', '12시간 거리 편지를 별 3개로 배달하기', 1, 'far_three_stars'],
  ['rainbow-letter', 20, '무지개 편지', '한 판에서 우표 조각을 모두 줍고 한 번도 안 부딪히기', 1, 'perfects'],
  ['tangerine', 18, '제철 귤', '배달 성공 10번', 10, 'successes'],
  ['bungeoppang', 19, '붕어빵', '배달 성공 15번', 15, 'successes'],
]

const stampOf = ([code, number, name]) => ({ code, number, name, description: '시즌 이벤트에서 받았어요', kind: 'decoration', grade: 'common' })

function state(letter) {
  const remaining = Math.max(0, Math.round((new Date(letter.arrives_at) - Date.now()) / 1000))
  const used = [...runs.values()].filter((run) => run.letter_id === letter.id).length
  const cap = letter.duration_minutes * 30
  const done = reduced.get(letter.id) ?? 0
  let reason = null
  if (remaining <= 0) reason = 'LETTER_ARRIVED'
  else if (remaining < 600) reason = 'ARRIVING_SOON'
  else if (used >= 3) reason = 'PLAY_LIMIT'
  else if (cap - done <= 0) reason = 'REDUCE_LIMIT'
  return { playable: !reason, reason, remaining_seconds: remaining, plays_used: used, plays_left: Math.max(0, 3 - used), reduced_seconds: done, max_reduce_seconds: cap, reducible_seconds: reason ? 0 : Math.max(0, Math.min(cap - done, remaining - 60)) }
}

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), 150))

export function fetchGameHome() {
  return delay({
    rules: { run_seconds: RUN_SECONDS, lanes: 3, plays_per_letter: 3, daily_limit: 10, max_reduce_ratio: 0.5, min_remaining_seconds: 600, stars: [{ stars: 3, min_piece_ratio: 0.85, max_hits: 1, reduce_seconds: 1800 }, { stars: 2, min_piece_ratio: 0.65, max_hits: 2, reduce_seconds: 1200 }, { stars: 1, min_piece_ratio: 0.4, max_hits: null, reduce_seconds: 600 }] },
    today: { played, limit: 10, remaining: Math.max(0, 10 - played) },
    progress: { ...stats },
    goals: GOALS.map((goal) => ({ stamp: stampOf(goal), condition: goal[3], target: goal[4], progress: Math.min(stats[goal[5]], goal[4]), owned: owned.has(goal[0]) })),
    letters: LETTERS.map((letter) => ({ ...letter, game: state(letter) })),
  })
}

export function fetchLetterGame(letterId) {
  const letter = LETTERS.find((item) => String(item.id) === String(letterId))
  if (!letter) return Promise.reject(new ApiError(404, { code: 'NOT_FOUND', message: '편지를 찾을 수 없습니다.' }))
  return delay({ ...letter, game: state(letter) })
}

function buildCourse() {
  const items = []
  for (let t = 2; t <= RUN_SECONDS - 2; t += 0.9 + Math.random() * 0.5) {
    const lanes = [0, 1, 2].sort(() => Math.random() - 0.5)
    const at = Math.round(t * 100) / 100
    if (Math.random() < 0.4) items.push({ kind: 'puddle', lane: lanes[0], t: at })
    items.push({ kind: 'piece', lane: lanes[1], t: at })
  }
  return items
}

export function startRun({ letter_id: letterId }) {
  if (played >= 10) return Promise.reject(new ApiError(429, { code: 'DAILY_LIMIT', message: '오늘은 10번까지 배달할 수 있어요. 내일 다시 해 주세요.' }))
  const letter = letterId ? LETTERS.find((item) => item.id === letterId) : null
  if (letterId && !letter) return Promise.reject(new ApiError(404, { code: 'NOT_FOUND', message: '편지를 찾을 수 없습니다.' }))
  if (letter) {
    const current = state(letter)
    if (current.reason) return Promise.reject(new ApiError(409, { code: current.reason, message: '배달할 수 없는 편지예요.' }))
  }
  played += 1
  const course = buildCourse()
  const run = { id: nextRunId++, letter_id: letter?.id ?? null, practice: !letter, seed: 1, run_seconds: RUN_SECONDS, lanes: 3, course, piece_total: course.filter((item) => item.kind === 'piece').length, puddle_total: course.filter((item) => item.kind === 'puddle').length, started_at: new Date().toISOString(), expires_at: minutesLater(3), reducible_seconds: letter ? state(letter).reducible_seconds : 0, today_remaining: 10 - played }
  runs.set(run.id, run)
  return delay(run)
}

export function finishRun(runId, { pieces, hits }) {
  const run = runs.get(runId)
  if (!run) return Promise.reject(new ApiError(404, { code: 'NOT_FOUND', message: '게임을 찾을 수 없습니다.' }))
  const stars = starsFor(pieces, run.piece_total, hits)
  const letter = LETTERS.find((item) => item.id === run.letter_id) ?? null
  let reduce = 0
  if (letter && stars) {
    const remaining = Math.round((new Date(letter.arrives_at) - Date.now()) / 1000)
    const capLeft = letter.duration_minutes * 30 - (reduced.get(letter.id) ?? 0)
    reduce = Math.max(0, Math.min(stars * 600, capLeft, remaining - 60))
    reduced.set(letter.id, (reduced.get(letter.id) ?? 0) + reduce)
    letter.arrives_at = new Date(new Date(letter.arrives_at).getTime() - reduce * 1000).toISOString()
  }
  stats.plays += 1
  if (stars) stats.successes += 1
  if (stars === 3) stats.three_stars += 1
  if (stars === 3 && letter?.band === 'far') stats.far_three_stars += 1
  if (pieces === run.piece_total && hits === 0) stats.perfects += 1
  stats.best_stars = Math.max(stats.best_stars, stars)
  const granted = GOALS.filter((goal) => !owned.has(goal[0]) && stats[goal[5]] >= goal[4]).map(stampOf)
  granted.forEach((stamp) => owned.add(stamp.code))
  return delay({
    id: run.id, stars, success: stars > 0, perfect: pieces === run.piece_total && hits === 0, pieces, hits, piece_total: run.piece_total, puddle_total: run.puddle_total, reduced_seconds: reduce,
    letter: letter && { id: letter.id, arrives_at: letter.arrives_at, remaining_seconds: Math.round((new Date(letter.arrives_at) - Date.now()) / 1000), reduced_total_seconds: reduced.get(letter.id) ?? 0 },
    granted_stamps: granted, unlocked_rewards: [], progress: { ...stats },
  })
}
