// 우표 획득(5-12)·보상 해금(5-13) 변환 함수. 서버 응답 → 화면용 데이터.
// 5-13(toRewardUnlock)은 GET /api/stamps/rewards/ 응답을 쓴다. 5-12(toStampGain)는 아직 mock 모양이다(이번 범위 밖). 화면과 컴포넌트는 서버 필드 이름을 직접 쓰지 않고 이 파일의 결과만 쓴다.

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

// 서버 보상 code ↔ 미리보기 그림 종류. 마이 우표첩(7-8)의 표와 같은 값이지만 마이 폴더를 가져다 쓰지 않고 따로 둔다.
const REWARD_KIND_BY_CODE = {
  'stickers-cat': 'sticker',
  'stationery-night-sky': 'paper',
  'collector-and-font': 'collector',
  'stationery-gold-postcard': 'postcard',
}
export const REWARD_CODE_BY_KIND = Object.fromEntries(Object.entries(REWARD_KIND_BY_CODE).map(([code, kind]) => [kind, code]))

// 아래 보조 버튼 이름. 시안은 스티커만 "스티커 써보기"이고 나머지는 시안이 없어서 정했다.
const TRY_LABEL_BY_KIND = {
  sticker: '스티커 써보기',
  paper: '편지지 써보기',
  collector: '글씨체 써보기',
  postcard: '편지지 써보기',
}

function pickReward(sorted, { code, threshold }) {
  const unlocked = sorted.filter((reward) => reward.unlocked)
  if (code) return unlocked.find((reward) => reward.code === code) ?? null
  if (threshold) return unlocked.find((reward) => reward.threshold === threshold) ?? null
  return unlocked.find((reward) => !reward.seen) ?? null
}

/**
 * 보상 해금(5-13) 화면용 데이터. 서버 GET /api/stamps/rewards/ 응답({ owned_count, rewards[] })에서 보상 하나를 골라 만든다.
 * 고르는 법은 selector: code(보상 code) → threshold(기준 개수) → 둘 다 없으면 열렸고 아직 확인하지 않은(unlocked && !seen) 첫 보상.
 * 열리지 않았거나 없으면 null.
 * code         고른 보상 code (seen 호출에 쓴다)
 * needsSeen    아직 확인 전이면 true. false(이미 확인한 보상을 다시 본 경우)면 seen을 다시 보내지 않는다
 * title        "우표 3개 달성!"
 * subtitle     "첫 번째 수집 보상이 열렸어요"
 * rewardKind   미리보기 그림 종류
 * rewardLabel  서버 보상 이름 ("고향이 표정 스티커")
 * usage        해금 뒤 어디서 쓰는지(서버 description)
 * next         { ratio(모은 우표 ÷ 다음 보상 개수), label("다음 보상 · 5개: 편지지 「밤하늘」") } 또는 null (마지막 보상)
 * tryLabel     아래 보조 버튼 이름(어디로 갈지는 stampRewardApi.resolveTryTarget이 정한다)
 * confirmTarget  "확인" 뒤에 가는 곳({ path, state }): 5-3 대화 중 탭
 * @param {{ owned_count: number, rewards: object[] }} data
 * @param {{ code?: string|null, threshold?: number|null }} [selector]
 */
export function toRewardUnlock(data, { code = null, threshold = null } = {}) {
  const sorted = byThreshold(data.rewards ?? [])
  const reward = pickReward(sorted, { code, threshold })
  if (!reward) return null
  const index = sorted.indexOf(reward)
  const next = sorted[index + 1]
  const kind = REWARD_KIND_BY_CODE[reward.code] ?? 'sticker'
  return {
    code: reward.code,
    needsSeen: !reward.seen,
    title: `우표 ${reward.threshold}개 달성!`,
    subtitle: `${ORDINALS[index] ?? `${index + 1}`} 번째 수집 보상이 열렸어요`,
    rewardKind: kind,
    rewardLabel: reward.name,
    rewardName: reward.name,
    usage: reward.description ?? '',
    next: next
      ? {
          ratio: Math.min(Math.max((data.owned_count ?? reward.threshold) / next.threshold, 0), 1),
          label: `다음 보상 · ${next.threshold}개: ${next.name}`,
        }
      : null,
    tryLabel: TRY_LABEL_BY_KIND[kind],
    confirmTarget: CHATTING_TARGET,
  }
}
