// 직접 배달 게임의 규칙 계산. 화면(캔버스)과 떨어져 있어 테스트로 확인할 수 있다.
//
// 코스는 서버가 준다: [{ kind: 'piece'|'puddle', lane: 0~2, t: 초 }]
// t초가 되는 순간 고향이가 그 레인에 있으면 조각을 줍거나(piece) 물웅덩이에 부딪힌다(puddle).
// 별 기준은 서버와 같다(서버 rules.py). 화면의 「-30분」 미리보기에만 쓰고, 최종 판정은 서버가 한다.

export const LANES = 3

// 위에서부터 먼저 맞는 규칙을 쓴다(서버 STAR_RULES와 같아야 한다).
export const STAR_RULES = [
  { stars: 3, minPieceRatio: 0.85, maxHits: 1 },
  { stars: 2, minPieceRatio: 0.65, maxHits: 2 },
  { stars: 1, minPieceRatio: 0.4, maxHits: null },
]

/** 별 수(0~3). */
export function starsFor(pieces, pieceTotal, hits) {
  const ratio = pieceTotal ? pieces / pieceTotal : 0
  const rule = STAR_RULES.find((item) => ratio >= item.minPieceRatio && (item.maxHits === null || hits <= item.maxHits))
  return rule ? rule.stars : 0
}

/**
 * 새 판의 상태.
 * @param {{ course: object[], run_seconds: number }} run 서버의 판 시작 응답
 */
export function createGame(run) {
  return {
    duration: run.run_seconds,
    elapsed: 0,
    lane: 1,
    items: run.course.map((item, index) => ({ ...item, id: index, done: false, result: null })),
    pieces: 0,
    hits: 0,
    pieceTotal: run.course.filter((item) => item.kind === 'piece').length,
    events: [],
    finished: false,
  }
}

/** 레인을 옮긴다. -1 왼쪽, +1 오른쪽. 끝에서는 그대로. */
export function moveLane(game, direction) {
  if (game.finished) return game
  const lane = Math.min(LANES - 1, Math.max(0, game.lane + direction))
  return lane === game.lane ? game : { ...game, lane }
}

/**
 * 시간을 dt초 흘린다. 그 사이 고향이 앞을 지나간 물건을 판정한다.
 * events에는 이번에 일어난 일({ type: 'piece'|'puddle', item })만 담긴다(효과음·반짝임용).
 */
export function step(game, dt) {
  if (game.finished) return { ...game, events: [] }
  const elapsed = Math.min(game.duration, game.elapsed + dt)
  let { pieces, hits } = game
  const events = []
  const items = game.items.map((item) => {
    if (item.done || item.t > elapsed) return item
    const met = item.lane === game.lane
    if (met && item.kind === 'piece') pieces += 1
    if (met && item.kind === 'puddle') hits += 1
    if (met) events.push({ type: item.kind, item })
    return { ...item, done: true, result: met ? item.kind : 'missed' }
  })
  return { ...game, elapsed, items, pieces, hits, events, finished: elapsed >= game.duration }
}

/** 지금까지의 기록으로 본 별 수. */
export const currentStars = (game) => starsFor(game.pieces, game.pieceTotal, game.hits)
