// 우표 획득(5-12)·보상 해금(5-13) 요청.
// 5-13(보상 해금)은 서버 연동: GET /api/stamps/rewards/, POST /api/stamps/rewards/{code}/seen/ (api/stamps.md).
// 5-12(우표 획득)는 이번 범위가 아니라 아직 mock이다(fetchStampGain). 발송 응답(granted_stamps)과의 연결은 채현님 영역과 협의 뒤에 한다.
// VITE_API_MOCK=true(개발 전용)일 때만 mock 보상을 쓰고, 서버가 실패하면 mock으로 채우지 않고 ApiError(shared/api/client.js)를 그대로 던진다.
// 반환값은 항상 stampRewardMapper의 화면용 데이터이다.
import { isApiDemo, request } from '../../shared/api/client.js'
import { MOCK_STAMP_GAIN, MOCK_COLLECT_REWARDS } from '../../shared/mocks/stampReward.js'
import { fetchMailboxSummary } from './mailboxApi.js'
import { toStampGain, toRewardUnlock, HOME_PATH, NEW_LETTERS_TARGET, REWARD_CODE_BY_KIND } from './stampRewardMapper.js'

/**
 * 5-12 우표 획득. mock이다(이번 범위 밖).
 * @param {{ unlockThreshold?: number }} [options] unlockThreshold: 이번에 열린 보상의 기준 개수(개발 확인용). 있으면 "확인" 뒤에 5-13으로 이어진다.
 */
export async function fetchStampGain({ unlockThreshold = null } = {}) {
  return toStampGain({ ...MOCK_STAMP_GAIN, unlocked_reward_threshold: unlockThreshold }, MOCK_COLLECT_REWARDS)
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
