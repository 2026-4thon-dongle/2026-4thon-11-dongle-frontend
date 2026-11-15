// 마이 요청. mock, 문서 레포 API 확정 전(프론트 연동 전).
// 지금은 shared/mocks/mypage.js를 돌려준다. 실제 API가 연결되면 이 함수 안에서 서버를 호출한다.
//   GET /api/users/me/            → fetchMyPage
//   GET /api/users/me/settings/   → fetchMyPage
//   임시저장 목록·삭제              → fetchDrafts, deleteDraft (mock 전용. 명세 없음, 저장 방식 미정)
//   우표첩(보유·보상)               → fetchStampCollection (mock 전용. 명세에 우표 목록 API가 없다)
//   GET /api/auth/nickname/check/ → checkNickname
//   PATCH /api/users/me/          → updateNickname (실제로 호출하지 않는다. 이 파일의 메모리 값만 바꾼다)
//   PUT /api/users/me/regions/    → fetchRegionSettings, saveRegions (실제로 호출하지 않는다. 메모리 값만 바꾼다)
//   GET·PATCH /api/users/me/settings/ → fetchSettings, updateSettings (실제로 호출하지 않는다)
//   GET /api/blocks/, DELETE /api/blocks/{user_id}/ → fetchBlocks, unblock (실제로 호출하지 않는다)
//   GET /api/users/me/, /settings/, GET /api/blocks/ → fetchSettingsHome (설정 7-1-1)
//   POST /api/auth/logout/, DELETE /api/users/me/ → logout, withdraw (실제로 호출하지 않는다. withdraw는 아무것도 지우지 않는다)
// 반환값은 항상 mypageMapper의 화면용 데이터이다.
import {
  MOCK_ME,
  MOCK_ME_EXTRA,
  MOCK_SETTINGS,
  MOCK_DRAFTS,
  MOCK_TAKEN_NICKNAMES,
  MOCK_BLOCKS,
} from '../../shared/mocks/mypage.js'
import { PROVINCES, CITIES, DISTRICTS, METROPOLITAN, regionLabel } from '../../shared/region/regions.js'
import { MOCK_STAMPS } from '../../shared/mocks/stamps.js'
import { MOCK_OWNED_STAMP_CODES, MOCK_STAMP_REWARDS, MOCK_STAMP_DETAILS } from '../../shared/mocks/stampCollection.js'
import {
  toMyPage,
  toDraftCard,
  toStampCollection,
  toStampDetail,
  toStampRewards,
  toRegionSettings,
  toNicknameStatus,
  toNotificationSettings,
  toBlockedUsers,
  toSettingsHome,
} from './mypageMapper.js'

// 삭제가 7-1의 "N통"에도 반영되도록 메모리에 복사해 둔다(새로고침하면 처음 mock으로 돌아간다). mock 전용.
let drafts = [...MOCK_DRAFTS]

// 내 정보. 닉네임·지역을 바꾸면 7-1에도 보이도록 메모리에 복사해 둔다(새로고침하면 처음 mock으로 돌아간다). mock 전용.
let me = { ...MOCK_ME, ...MOCK_ME_EXTRA }

// 알림·편지 설정. 7-11에서 바꾸면 7-1의 "알림 · 편지 쉬기" 줄에도 보이도록 메모리에 둔다. mock 전용.
let settings = { ...MOCK_SETTINGS }

export async function fetchMyPage() {
  return toMyPage({ ...me, stats: { ...me.stats, draft_count: drafts.length } }, settings)
}

/** 설정(7-1-1). 닉네임·지역·알림·차단 수를 한 번에 모아 메뉴 줄로 만든다. 7-9~7-13에서 바꾼 값이 곧바로 보인다. */
export async function fetchSettingsHome() {
  return toSettingsHome(me, settings, blocks.length)
}

export async function fetchDrafts() {
  return drafts.map(toDraftCard)
}

export async function deleteDraft(id) {
  drafts = drafts.filter((draft) => draft.id !== id)
}

/**
 * 우표첩. 우표 이름·종류는 shared/mocks/stamps.js를 읽기만 하고, 보유 상태와 보상은 stampCollection.js의 mock이다.
 * @param {{ empty?: boolean }} [options] empty: true면 보유한 우표가 0개인 상태(7-6)를 보여 준다. 개발 확인용.
 */
export async function fetchStampCollection({ empty = false } = {}) {
  return toStampCollection(MOCK_STAMPS, empty ? [] : MOCK_OWNED_STAMP_CODES, MOCK_STAMP_REWARDS)
}

/**
 * 우표 상세(7-7). mock 전용(명세에 없음).
 * @param {string} stampId 우표 id
 * @param {{current: number, target: number} | null} progress 수집 보상 진행("(5 / 10)" 문구용)
 */
export async function fetchStampDetail(stampId, progress = null) {
  const stamp = MOCK_STAMPS.find((item) => item.id === stampId)
  if (!stamp) return null
  return toStampDetail(stamp, MOCK_STAMP_DETAILS[stampId], progress)
}

/**
 * 수집 보상(7-8). mock 전용(명세에 없음).
 * @param {{ empty?: boolean }} [options] empty: true면 우표 0개 상태
 */
export async function fetchStampRewards({ empty = false } = {}) {
  const { achievement } = toStampCollection(MOCK_STAMPS, empty ? [] : MOCK_OWNED_STAMP_CODES, MOCK_STAMP_REWARDS)
  return toStampRewards(achievement.count, MOCK_STAMP_REWARDS)
}

/**
 * 닉네임 확인(7-9). 서버의 GET /api/auth/nickname/check/ 응답({ available, code })을 흉내 낸다.
 * 2~10자가 아니면 INVALID_NICKNAME, 이미 쓰는 닉네임이면 NICKNAME_TAKEN. 내 지금 닉네임은 그대로 쓸 수 있다.
 */
export async function checkNickname(nickname) {
  const value = nickname.trim()
  if (value.length < 2 || value.length > 10) return { current: me.nickname, ...toNicknameStatus({ available: false, code: 'INVALID_NICKNAME' }) }
  if (value !== me.nickname && MOCK_TAKEN_NICKNAMES.includes(value)) {
    return { current: me.nickname, ...toNicknameStatus({ available: false, code: 'NICKNAME_TAKEN' }) }
  }
  return { current: me.nickname, ...toNicknameStatus({ available: true, code: null }) }
}

/** 현재 닉네임(7-9 입력창의 처음 값). */
export async function fetchNickname() {
  return me.nickname
}

/**
 * 닉네임 변경(7-9). PATCH /api/users/me/ { nickname }을 흉내 낸다. 실제 서버는 호출하지 않는다.
 * 실패하면 서버와 같은 code(INVALID_NICKNAME 400, NICKNAME_TAKEN 409)를 가진 에러를 던진다.
 */
export async function updateNickname(nickname) {
  const value = nickname.trim()
  const check = await checkNickname(value)
  if (!check.available) {
    const error = new Error(check.message)
    error.code = value.length < 2 || value.length > 10 ? 'INVALID_NICKNAME' : 'NICKNAME_TAKEN'
    throw error
  }
  me = { ...me, nickname: value }
}

/**
 * 지역 설정(7-10). GET /api/users/me/의 hometowns·residence를 화면용으로 바꿔 준다.
 */
export async function fetchRegionSettings() {
  return toRegionSettings(me)
}

// 지역 선택기({province, district})의 지역에 임시 id를 붙인다. 실제 id는 GET /api/regions/에 있고 아직 연결 전이다. mock 전용.
function toMockRegion(region) {
  const list = METROPOLITAN.includes(region.province) ? DISTRICTS[region.province] : CITIES[region.province]
  const index = Math.max(list ? list.indexOf(region.district) : 0, 0)
  const id = (PROVINCES.indexOf(region.province) + 1) * 1000 + index + 1
  return { id, name: region.district || region.province, full_name: regionLabel(region) }
}

/**
 * 지역 저장(7-10). PUT /api/users/me/regions/ { hometown_region_ids[1~3], residence_region_id }를 흉내 낸다.
 * 실제 서버는 호출하지 않고 이 파일의 메모리 값만 바꾼다. 바꾼 지역은 이미 쓴 일기에는 적용되지 않는다(명세).
 * @param {{ hometowns: Array<{province: string, district: string}>, residence: {province: string, district: string} }} regions
 */
export async function saveRegions({ hometowns, residence }) {
  if (hometowns.length < 1 || hometowns.length > 3 || !residence) {
    const error = new Error('본가 지역은 1~3곳, 거주 지역은 1곳이에요')
    error.code = 'VALIDATION_ERROR'
    throw error
  }
  const body = {
    hometown_region_ids: hometowns.map((region) => toMockRegion(region).id),
    residence_region_id: toMockRegion(residence).id,
  }
  me = { ...me, hometowns: hometowns.map(toMockRegion), residence: toMockRegion(residence) }
  return body
}

/** 알림·편지 설정(7-11). GET /api/users/me/settings/를 흉내 낸다. */
export async function fetchSettings() {
  return toNotificationSettings(settings)
}

/**
 * 설정 바꾸기(7-11). PATCH /api/users/me/settings/ — 바꾼 항목만 보낸다. 실제 서버는 호출하지 않는다.
 * @param {Partial<typeof MOCK_SETTINGS>} patch 예: { push_enabled: false }
 */
export async function updateSettings(patch) {
  settings = { ...settings, ...patch }
  return toNotificationSettings(settings)
}

// 차단 목록. 해제하면 이 목록에서 빠진다(새로고침하면 처음 mock으로 돌아간다). mock 전용.
let blocks = [...MOCK_BLOCKS.results]

/**
 * 차단 목록(7-12). GET /api/blocks/를 흉내 낸다.
 * @param {{ empty?: boolean }} [options] empty: true면 차단한 사람이 없는 상태(개발 확인용)
 */
export async function fetchBlocks({ empty = false } = {}) {
  const results = empty ? [] : blocks
  return toBlockedUsers({ ...MOCK_BLOCKS, count: results.length, results })
}

/** 차단 해제(7-12). DELETE /api/blocks/{user_id}/를 흉내 낸다. */
export async function unblock(userId) {
  blocks = blocks.filter((item) => item.user.id !== userId)
}

/** 로그아웃(7-13). POST /api/auth/logout/을 흉내 낸다. 실제 서버도, 토큰도 건드리지 않는다. */
export async function logout() {}

/** 회원 탈퇴(7-13). DELETE /api/users/me/를 흉내 낸다. 실제로는 아무것도 지우지 않는다. mock 동작 전용. */
export async function withdraw() {}
