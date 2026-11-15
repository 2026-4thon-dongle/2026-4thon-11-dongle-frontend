// 우표 획득(5-12)·보상 해금(5-13) 변환 함수. 서버(지금은 mock) 응답 → 화면용 데이터.
// mock, 문서 레포 API 확정 전. 화면과 컴포넌트는 서버 필드 이름을 직접 쓰지 않고 이 파일의 결과만 쓴다.

// 가정: 이동 경로. 우표첩은 마이(7-4, 같은 담당이지만 다른 브랜치)이다.
// 이동 대상은 { path, state }이다. 우체통 탭은 주소가 아니라 location.state.tab으로 연다(MailboxPage가 시작 탭으로 쓴다).
const MAILBOX_PATH = '/mailbox'
const STAMP_BOOK_PATH = '/mypage/stamps'
export const HOME_PATH = '/home' // 3-1 홈(authRoutes의 /home/*)
export const REWARD_UNLOCKED_PATH = '/mailbox/reward-unlocked'

/** 5-1 새 편지 탭 / 5-3 대화 중 탭으로 가는 대상 */
export const NEW_LETTERS_TARGET = { path: MAILBOX_PATH, state: { tab: 'new' } }
export const CHATTING_TARGET = { path: MAILBOX_PATH, state: { tab: 'chatting' } }

const ORDINALS = ['첫', '두', '세', '네']

function byThreshold(rewards) {
  return [...rewards].sort((a, b) => a.threshold - b.threshold)
}

/**
 * 우표 획득(5-12) 화면용 데이터.
 * title        "첫 왕복 완성!" (우표 이름 + " 완성!")
 * descLines    ["하늘빛님과 편지를 주고받아", "「첫 왕복」 우표를 받았어요"]
 * progressLabel "모은 우표 6개 · 보상까지 4개" (다음 보상이 없으면 "모은 우표 N개")
 * stampBookTarget, confirmTarget  { path, state }. "확인" 뒤에는 이번에 보상이 열렸으면 5-13, 아니면 5-3(대화 중 탭)
 */
export function toStampGain(raw, rewards) {
  const sorted = byThreshold(rewards)
  const next = sorted.find((reward) => reward.threshold > raw.total_count)
  const unlocked = raw.unlocked_reward_threshold
  return {
    stampId: raw.stamp.code,
    stampName: raw.stamp.name,
    title: `${raw.stamp.name} 완성!`,
    descLines: [raw.reason, `「${raw.stamp.name}」 우표를 받았어요`].filter(Boolean),
    progressLabel: next
      ? `모은 우표 ${raw.total_count}개 · 보상까지 ${next.threshold - raw.total_count}개`
      : `모은 우표 ${raw.total_count}개`,
    stampBookTarget: { path: STAMP_BOOK_PATH },
    confirmTarget: unlocked ? { path: `${REWARD_UNLOCKED_PATH}?threshold=${unlocked}` } : CHATTING_TARGET,
  }
}

/**
 * 보상 해금(5-13) 화면용 데이터. 기준 개수에 맞는 보상이 없으면 null.
 * title        "우표 3개 달성!"
 * subtitle     "첫 번째 수집 보상이 열렸어요"
 * rewardKind   미리보기 그림 종류
 * rewardLabel  "고향이 표정 스티커 5종"
 * usage        "편지 서명 단계에서 스티커를 붙일 수 있어요"
 * next         { ratio, label("다음 보상 · 5개: 편지지 「밤하늘」") } 또는 null (마지막 보상)
 * tryLabel    아래 보조 버튼 이름(어디로 갈지는 stampRewardApi.resolveTryTarget이 정한다)
 * confirmTarget  "확인" 뒤에 가는 곳({ path, state }): 5-3 대화 중 탭
 */
export function toRewardUnlock(threshold, rewards) {
  const sorted = byThreshold(rewards)
  const index = sorted.findIndex((reward) => reward.threshold === threshold)
  if (index < 0) return null
  const reward = sorted[index]
  const next = sorted[index + 1]
  return {
    title: `우표 ${reward.threshold}개 달성!`,
    subtitle: `${ORDINALS[index] ?? `${index + 1}`} 번째 수집 보상이 열렸어요`,
    rewardKind: reward.kind,
    rewardLabel: [reward.name, reward.detail].filter(Boolean).join(' '),
    rewardName: reward.name,
    usage: reward.usage,
    // 시안의 진행 바는 30%인데 다음 보상(5개)과 맞지 않는다. 여기서는 모은 개수 ÷ 다음 보상 개수로 계산한다.
    next: next
      ? {
          ratio: Math.min(reward.threshold / next.threshold, 1),
          label: `다음 보상 · ${next.threshold}개: ${next.name}`,
        }
      : null,
    tryLabel: reward.try_label,
    confirmTarget: CHATTING_TARGET,
  }
}
