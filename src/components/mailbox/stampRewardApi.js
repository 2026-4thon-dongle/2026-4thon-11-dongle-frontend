// 우표 획득(5-12)·보상 해금(5-13) 요청. mock, 문서 레포 API 확정 전.
// 문서 레포 `api/`에 우표·보상 API가 없다. spec/stamp.md 초안은 "우표나 보상을 준 응답에 새로 받은 항목을 함께 담는다(가정)"이다.
// 그래서 이 두 화면이 어디서 데이터를 받는지는 정해지지 않았다. 지금은 shared/mocks/stampReward.js를 돌려준다.
// 반환값은 항상 stampRewardMapper의 화면용 데이터이다.
import { MOCK_STAMP_GAIN, MOCK_COLLECT_REWARDS } from '../../shared/mocks/stampReward.js'
import { fetchDemoMailboxLetters } from './mailboxDemo.js'
import { toStampGain, toRewardUnlock, HOME_PATH, NEW_LETTERS_TARGET } from './stampRewardMapper.js'

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

/**
 * 5-13 "스티커 써보기"가 갈 곳. 받은 새 편지가 있으면 5-1 새 편지 탭(답장하러), 없으면 3-1 홈.
 * 반환: { path, state, hasNewLetter }
 * mock 전용 판단: 5-12·5-13은 아직 서버와 연결하지 않아(우표·보상 질문 답 대기) 이 판단도 우체통 mock 목록(fetchDemoMailboxLetters)의 새 편지 탭을 본다.
 * 서버와 연결할 때는 GET /api/mailbox/summary/의 new_count(mailboxApi.fetchMailboxSummary)로 바꾼다.
 */
export async function resolveTryTarget() {
  const { items } = await fetchDemoMailboxLetters('new')
  return items.length > 0 ? { ...NEW_LETTERS_TARGET, hasNewLetter: true } : { path: HOME_PATH, hasNewLetter: false }
}
