// 마이 개발용 가짜 서버. VITE_API_MOCK=true(개발 모드)일 때만 mypageApi.js가 쓴다. 운영·기본 설정에서는 쓰지 않는다.
// 서버와 같은 모양의 "원본 응답"을 돌려주므로 mypageMapper는 mock과 서버를 구분하지 않는다.
import { MOCK_ME, MOCK_SETTINGS, MOCK_DRAFTS, MOCK_TAKEN_NICKNAMES, MOCK_BLOCKS } from '../../shared/mocks/mypage.js'
import { regionLabel } from '../../shared/region/regions.js'
import { MOCK_STAMP_CATALOG, MOCK_OWNED_STAMPS, MOCK_STAMP_REWARDS } from '../../shared/mocks/stampCollection.js'

let me = structuredClone(MOCK_ME)
let settings = { ...MOCK_SETTINGS }
let drafts = [...MOCK_DRAFTS]
let blocks = [...MOCK_BLOCKS]

const page = (results) => ({ count: results.length, next: null, previous: null, results })

function apiError(status, code, message) {
  const error = new Error(message)
  error.status = status
  error.code = code
  return error
}

const ownedOf = (empty) => (empty ? {} : MOCK_OWNED_STAMPS)

function stampSummary(empty) {
  const owned = ownedOf(empty)
  const ownedCount = Object.keys(owned).length
  const next = MOCK_STAMP_REWARDS.find((reward) => reward.threshold > ownedCount)
  return {
    owned_count: ownedCount,
    total_count: MOCK_STAMP_CATALOG.length,
    next_reward: next ? { code: next.code, name: next.name, threshold: next.threshold, remaining: next.threshold - ownedCount } : null,
    received_rewards: MOCK_STAMP_REWARDS.filter((reward) => reward.threshold <= ownedCount).map(({ code, name }) => ({ code, name })),
  }
}

export const demoSource = {
  async me() {
    return { ...me, stats: { ...me.stats, draft_count: drafts.length } }
  },
  async settings() {
    return { ...settings }
  },
  async patchSettings(patch) {
    settings = { ...settings, ...patch }
    return { ...settings }
  },
  // 7-10 mock: 서버처럼 id만 받지만 화면 이름은 고른 지역 원본에서 만든다.
  async putRegions(_body, { hometowns, residence }) {
    const toRegion = (region) => ({ id: region.id, name: region.district || region.province, full_name: regionLabel(region) })
    me = { ...me, hometowns: hometowns.map(toRegion), residence: toRegion(residence) }
    return { ...me }
  },
  async drafts() {
    return page(drafts)
  },
  async deleteDraft(id) {
    drafts = drafts.filter((draft) => draft.id !== id)
  },
  async stamps({ empty = false } = {}) {
    const owned = ownedOf(empty)
    return {
      ...stampSummary(empty),
      stamps: MOCK_STAMP_CATALOG.map((stamp) => ({ ...stamp, owned: stamp.code in owned, granted_at: owned[stamp.code]?.granted_at ?? null })),
    }
  },
  async stamp(code) {
    const stamp = MOCK_STAMP_CATALOG.find((item) => item.code === code)
    if (!stamp) throw apiError(404, 'NOT_FOUND', '우표를 찾을 수 없어요.')
    const owned = MOCK_OWNED_STAMPS[code]
    const { owned_count, next_reward } = stampSummary(false)
    return { ...stamp, owned: Boolean(owned), granted_at: owned?.granted_at ?? null, granted_with: owned?.granted_with ?? null, owned_count, next_reward }
  },
  async rewards({ empty = false } = {}) {
    const ownedCount = Object.keys(ownedOf(empty)).length
    return {
      owned_count: ownedCount,
      rewards: MOCK_STAMP_REWARDS.map((reward) => {
        const unlocked = reward.threshold <= ownedCount
        return { ...reward, unlocked, unlocked_at: unlocked ? '2026-10-31T09:30:00+09:00' : null, seen: unlocked }
      }),
    }
  },
  async checkNickname(nickname) {
    if (nickname.length < 2 || nickname.length > 10) return { available: false, code: 'INVALID_NICKNAME' }
    if (nickname !== me.nickname && MOCK_TAKEN_NICKNAMES.includes(nickname)) return { available: false, code: 'NICKNAME_TAKEN' }
    return { available: true, code: null }
  },
  async patchNickname(nickname) {
    const result = await this.checkNickname(nickname)
    if (!result.available) throw apiError(result.code === 'NICKNAME_TAKEN' ? 409 : 400, result.code, '닉네임을 사용할 수 없어요.')
    me = { ...me, nickname }
    return { ...me }
  },
  async blocks(_page, { empty = false } = {}) {
    return page(empty ? [] : blocks)
  },
  async unblock(userId) {
    blocks = blocks.filter((item) => item.user.id !== userId)
  },
}
