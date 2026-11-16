// 우표 획득(5-12)·보상 해금(5-13) 요청.
// 5-12(우표 획득): 받은 우표는 발송 응답(granted_stamps·unlocked_rewards)을 라우터 state로 받고, 진행 문구용 모은 개수만 GET /api/stamps/ 로 받는다.
// 5-13(보상 해금): GET /api/stamps/rewards/, POST /api/stamps/rewards/{code}/seen/ (api/stamps.md).
// 앱을 열 때 5-13을 자동으로 조회하지 않는다. 5-12의 "확인"(unlocked_rewards가 있을 때)과 마이 수집 보상(7-8)에서만 5-13으로 간다.
// VITE_API_MOCK=true(개발 전용)일 때만 mock을 쓰고, 서버가 실패하면 mock으로 채우지 않고 ApiError(shared/api/client.js)를 그대로 던진다.
// 반환값은 항상 stampRewardMapper의 화면용 데이터이다.
import { isApiDemo, request } from '../../shared/api/client.js'
import { MOCK_STAMP_GAIN, MOCK_COLLECT_REWARDS } from '../../shared/mocks/stampReward.js'
import { fetchMailboxSummary } from './mailboxApi.js'
import {
  toStampGain,
  toRewardUnlock,
  isRoundTripGain,
  toRoundTripGainInput,
  ROUND_TRIP_STAMP_CODE,
  HOME_PATH,
  NEW_LETTERS_TARGET,
  REWARD_CODE_BY_KIND,
} from './stampRewardMapper.js'

/**
 * 5-12가 받는 입력(location.state). 발송 응답에서 그대로 옮긴 값이다.
 * @typedef {{ grantedStamps?: {code: string, number: number, name: string, description: string}[], unlockedRewards?: {code: string}[], returnTo?: string }} StampGainInput
 */

/**
 * mock 모드에서 주소로 직접 열었을 때 쓰는 입력(mock 전용). unlockThreshold가 있으면 "확인"이 그 기준의 보상 5-13으로 이어진다.
 * @param {number|null} unlockThreshold
 * @returns {StampGainInput}
 */
export function demoStampGainInput(unlockThreshold = null) {
  const reward = MOCK_COLLECT_REWARDS.find((item) => item.threshold === unlockThreshold)
  return {
    grantedStamps: [{ ...MOCK_STAMP_GAIN.stamp, number: 0, description: MOCK_STAMP_GAIN.reason }],
    unlockedRewards: reward ? [{ code: REWARD_CODE_BY_KIND[reward.kind] }] : [],
  }
}

// mock 모드: 서버 GET /api/stamps/ 응답 중 필요한 부분({ owned_count, next_reward })과 같은 모양.
function demoStampsResponse() {
  const owned = MOCK_STAMP_GAIN.total_count
  const next = MOCK_COLLECT_REWARDS.find((reward) => reward.threshold > owned)
  return { owned_count: owned, next_reward: next ? { threshold: next.threshold, remaining: next.threshold - owned } : null }
}

/**
 * 봉투를 연 직후, 이 답장이 「첫 왕복」을 완성했는지 서버에서 확인해 5-12 입력을 돌려준다. 아니면 null.
 * 요청이 실패해도 던지지 않고 null이다(편지 읽기를 막지 않는다). 보상 조회만 실패하면 보상 없이 우표만 돌려준다.
 * mock 모드에서는 쓰지 않는다(null).
 * @param {{ senderId: number, sentAt: string, arrivedAt?: string }|null} probe letterReceiveMapper의 roundTripProbe
 * @returns {Promise<StampGainInput|null>}
 */
export async function findRoundTripGain(probe) {
  if (!probe || isApiDemo) return null
  try {
    const stamp = await request(`/api/stamps/${ROUND_TRIP_STAMP_CODE}/`)
    if (!isRoundTripGain(stamp, probe)) return null
    const rewards = await request('/api/stamps/rewards/').catch(() => null)
    return toRoundTripGainInput(stamp, rewards)
  } catch {
    return null
  }
}

/**
 * 5-12 우표 획득. 받은 우표가 없으면(입력 없음) 서버를 부르지 않고 null이다.
 * 서버가 실패하면 ApiError를 던진다(화면이 다시 시도를 보여 준다).
 * @param {StampGainInput|null} [input]
 */
export async function fetchStampGain(input = null) {
  if (!input?.grantedStamps?.length) return null
  const stamps = isApiDemo ? demoStampsResponse() : await request('/api/stamps/')
  return toStampGain(input, stamps)
}

// mock 모드: 서버 GET /api/stamps/rewards/ 응답과 같은 모양으로 만든다. 기준 개수 이하는 열렸고 아직 확인(seen)하지 않은 상태이다.
const demoSeen = new Set()
function demoRewardsResponse(threshold) {
  const owned = Math.max(6, threshold ?? 0)
  return {
    owned_count: owned,
    rewards: MOCK_COLLECT_REWARDS.map((reward) => {
      const code = REWARD_CODE_BY_KIND[reward.kind]
      return {
        code,
        threshold: reward.threshold,
        name: [reward.name, reward.detail].filter(Boolean).join(' '),
        description: reward.usage,
        unlocked: reward.threshold <= owned,
        seen: demoSeen.has(code),
      }
    }),
  }
}

/**
 * 5-13에 보여 줄 보상. GET /api/stamps/rewards/ 를 받아 고른다.
 * 입력(둘 다 없으면 새로 열렸고 아직 확인하지 않은 보상(unlocked && !seen) 중 기준 개수가 가장 낮은 것):
 *   code       보상 code(`stickers-cat` 등). 가장 정확한 입력이다.
 *   threshold  기준 개수(3, 5, 10, 15). 5-12의 "확인"이 `?threshold=`로 넘기는 값이다.
 * 고른 보상이 아직 열리지 않았거나 없으면 null이다.
 * @param {{ code?: string|null, threshold?: number|null }} [selector]
 */
export async function fetchRewardUnlock({ code = null, threshold = null } = {}) {
  const data = isApiDemo ? demoRewardsResponse(threshold) : await request('/api/stamps/rewards/')
  return toRewardUnlock(data, { code, threshold })
}

/** 보상 해금 모달을 확인했다고 기록한다(POST /api/stamps/rewards/{code}/seen/, 204). 아직 열리지 않은 보상이면 404 NOT_FOUND. */
export async function markRewardSeen(code) {
  if (isApiDemo) {
    demoSeen.add(code)
    return
  }
  await request(`/api/stamps/rewards/${encodeURIComponent(code)}/seen/`, { method: 'POST' })
}

/**
 * 5-13 "써보기"가 갈 곳. 받은 새 편지가 있으면 5-1 새 편지 탭(답장하러), 없으면 3-1 홈.
 * 새 편지가 있는지는 GET /api/mailbox/summary/의 new_count로 본다. 서버가 실패하면 ApiError를 던진다.
 * 반환: { path, state, hasNewLetter }
 */
export async function resolveTryTarget() {
  const { newCount } = await fetchMailboxSummary()
  return newCount > 0 ? { ...NEW_LETTERS_TARGET, hasNewLetter: true } : { path: HOME_PATH, hasNewLetter: false }
}
