// 우표 획득(5-12)·보상 해금(5-13) 변환 함수. 서버 응답 → 화면용 데이터.
// 5-13(toRewardUnlock)은 GET /api/stamps/rewards/ 응답을, 5-12(toStampGain)는 발송 응답의 granted_stamps·unlocked_rewards와 GET /api/stamps/ 응답을 쓴다. 화면과 컴포넌트는 서버 필드 이름을 직접 쓰지 않고 이 파일의 결과만 쓴다.
import { toStampArtId } from './stampArt.js'

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

// 「첫 왕복」 우표(5-12) 판정. 서버가 받는 쪽에 "새로 받음"을 알려 주지 않아서(plan §13) 우표 상세의 granted_at·granted_with로 추론한다.
export const ROUND_TRIP_STAMP_CODE = 'first-roundtrip'
// 허용 오차(넉넉하게). 우표는 답장을 보낸 때(sent_at) 지급되지만, 지급이 도착 때로 바뀌어도 맞도록
// granted_at이 [답장 sent_at - 5분, max(답장 arrived_at, 지금) + 5분] 안이면 이 답장이 완성한 왕복으로 본다.
export const ROUND_TRIP_TOLERANCE_MS = 5 * 60 * 1000

/**
 * 이 답장이 「첫 왕복」을 완성했는가. 우표 상세(GET /api/stamps/first-roundtrip/)와 편지 상세의 roundTripProbe를 비교한다.
 * 보유 중이고, 계기가 된 상대(granted_with.id)가 이 편지를 보낸 사람이고, granted_at이 위 범위 안이면 true.
 * @param {{ owned?: boolean, granted_at?: string|null, granted_with?: {id: number}|null }} stamp
 * @param {{ senderId: number, sentAt: string, arrivedAt?: string }} probe
 * @param {number} [now] 지금(ms)
 */
export function isRoundTripGain(stamp, probe, now = Date.now()) {
  if (!stamp?.owned || stamp.granted_with?.id !== probe.senderId) return false
  const granted = Date.parse(stamp.granted_at)
  const sent = Date.parse(probe.sentAt)
  if (!Number.isFinite(granted) || !Number.isFinite(sent)) return false
  const arrived = Date.parse(probe.arrivedAt)
  const upper = Math.max(now, Number.isFinite(arrived) ? arrived : 0) + ROUND_TRIP_TOLERANCE_MS
  return granted >= sent - ROUND_TRIP_TOLERANCE_MS && granted <= upper
}

/** 5-12 입력({ grantedStamps, unlockedRewards })을 만든다. rewards는 GET /api/stamps/rewards/ 응답이고 열렸고 아직 보지 않은(unlocked && !seen) 것만 넘긴다. */
export function toRoundTripGainInput(stamp, rewards) {
  const { code, number, name, description } = stamp
  return {
    grantedStamps: [{ code, number, name, description }],
    unlockedRewards: (rewards?.rewards ?? []).filter((reward) => reward.unlocked && !reward.seen),
  }
}

// 돌아갈 곳(returnTo)은 앱 안의 경로만 받는다. 바깥 주소로 보내지 않는다.
export const safeReturnTo = (value) => (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : null)

/**
 * 우표 획득(5-12) 화면용 데이터. 입력은 서버 모양이다.
 *  - input.grantedStamps   발송 응답(POST /api/letters/)의 granted_stamps[] = [{ code, number, name, description }]. 가입·일기 응답의 것도 같은 모양이다.
 *  - input.returnTo        선택. 읽던 화면 경로(예: /mailbox/12). 있으면 "확인"이 5-3 대신 여기로 돌아오고, 보상이 열렸으면 5-13의 "확인"이 돌아온다.
 *  - input.unlockedRewards 같은 응답의 unlocked_rewards[] = [{ code, threshold, name, ... }]. 있으면 "확인" 뒤에 5-13으로 이어진다.
 *  - stamps                GET /api/stamps/ 응답 중 { owned_count, next_reward: { remaining }|null }. 진행 문구에만 쓴다.
 * 받은 우표가 없으면 null이다. 여러 장이면 첫 장을 보여 주고 나머지는 "외 N장" 문구로 알린다.
 * stampId       우표 그림 id (서버 code를 stampArt.js 표로 바꾼 것)
 * title         "첫 편지 완성!" (우표 이름 + " 완성!")
 * descLines     ["첫 편지를 보냈어요", "「첫 편지」 우표를 받았어요"]  (첫 줄은 서버 description. 여러 장이면 "외 1개의 우표도 받았어요" 줄이 붙는다)
 * progressLabel "모은 우표 6개 · 보상까지 4개" (다음 보상이 없으면 "모은 우표 N개")
 * stampBookTarget, confirmTarget  { path, state }. "확인" 뒤에는 이번에 보상이 열렸으면 5-13(?code=), 아니면 5-3(대화 중 탭)
 */
export function toStampGain({ grantedStamps = [], unlockedRewards = [], returnTo = null } = {}, stamps) {
  const back = safeReturnTo(returnTo)
  const [stamp, ...others] = grantedStamps
  if (!stamp) return null
  const owned = stamps.owned_count
  const remaining = stamps.next_reward?.remaining
  const unlocked = unlockedRewards[0]
  return {
    stampId: toStampArtId(stamp.code),
    stampName: stamp.name,
    title: `${stamp.name} 완성!`,
    descLines: [
      stamp.description,
      `「${stamp.name}」 우표를 받았어요`,
      others.length > 0 ? `외 ${others.length}개의 우표도 받았어요` : '',
    ].filter(Boolean),
    progressLabel: remaining > 0 ? `모은 우표 ${owned}개 · 보상까지 ${remaining}개` : `모은 우표 ${owned}개`,
    stampBookTarget: { path: STAMP_BOOK_PATH },
    confirmTarget: unlocked
      ? { path: `${REWARD_UNLOCKED_PATH}?code=${encodeURIComponent(unlocked.code)}`, state: back ? { returnTo: back } : undefined }
      : back
        ? { path: back, replace: true }
        : CHATTING_TARGET,
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
