// 우표 획득(5-12)·보상 해금(5-13) 요청. mock, 문서 레포 API 확정 전.
// 문서 레포 `api/`에 우표·보상 API가 없다. spec/stamp.md 초안은 "우표나 보상을 준 응답에 새로 받은 항목을 함께 담는다(가정)"이다.
// 그래서 이 두 화면이 어디서 데이터를 받는지는 정해지지 않았다. 지금은 shared/mocks/stampReward.js를 돌려준다.
// 반환값은 항상 stampRewardMapper의 화면용 데이터이다.
import { MOCK_STAMP_GAIN, MOCK_COLLECT_REWARDS } from '../../shared/mocks/stampReward.js'
import { toStampGain, toRewardUnlock } from './stampRewardMapper.js'

/**
 * @param {{ unlockThreshold?: number }} [options] unlockThreshold: 이번에 열린 보상의 기준 개수(개발 확인용). 있으면 "확인" 뒤에 5-13으로 이어진다.
 */
export async function fetchStampGain({ unlockThreshold = null } = {}) {
  return toStampGain({ ...MOCK_STAMP_GAIN, unlocked_reward_threshold: unlockThreshold }, MOCK_COLLECT_REWARDS)
}

/** 기준 개수(3, 5, 10, 15)에 맞는 보상이 없으면 null. */
export async function fetchRewardUnlock(threshold) {
  return toRewardUnlock(threshold, MOCK_COLLECT_REWARDS)
}
