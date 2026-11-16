// 마이 요청. 서버를 부르고 mypageMapper로 화면용 데이터를 만든다. 오류는 shared/api/client.js의 ApiError 그대로 던진다.
//   GET /api/users/me/, /settings/, GET /api/stamps/  → fetchMyPage (7-1)
//   GET /api/users/me/, /settings/, GET /api/blocks/  → fetchSettingsHome (7-1-1)
//   GET·DELETE /api/letters/drafts/                   → fetchDrafts, deleteDraft (7-3)
//   GET /api/stamps/, /{code}/, /rewards/             → fetchStampCollection, fetchStampDetail, fetchStampRewards (7-4~7-8)
//   GET /api/auth/nickname/check/, PATCH /api/users/me/ → checkNickname, fetchNickname, updateNickname (7-9)
//   GET·PATCH /api/users/me/settings/                 → fetchSettings, updateSettings (7-11)
//   GET /api/blocks/, DELETE /api/blocks/{user_id}/   → fetchBlocks, unblock (7-12)
// 연결하지 않은 것(이번 범위 밖): 지역 설정 fetchRegionSettings·saveRegions(7-10, shared/region #59 이후), logout·withdraw(7-13).
// VITE_API_MOCK=true(개발 모드)일 때만 mypageDemo.js의 가짜 서버를 쓴다. 서버가 실패해도 mock으로 채우지 않는다.
import { isApiDemo, request } from '../../shared/api/client.js'
import { MOCK_ME } from '../../shared/mocks/mypage.js'
import { PROVINCES, CITIES, DISTRICTS, METROPOLITAN, regionLabel } from '../../shared/region/regions.js'
import { demoSource } from './mypageDemo.js'
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

const serverSource = {
  me: () => request('/api/users/me/'),
  settings: () => request('/api/users/me/settings/'),
  patchSettings: (patch) => request('/api/users/me/settings/', { method: 'PATCH', json: patch }),
  drafts: (page) => request('/api/letters/drafts/', { query: { page } }),
  deleteDraft: (id) => request(`/api/letters/drafts/${encodeURIComponent(id)}/`, { method: 'DELETE' }),
  stamps: () => request('/api/stamps/'),
  stamp: (code) => request(`/api/stamps/${encodeURIComponent(code)}/`),
  rewards: () => request('/api/stamps/rewards/'),
  checkNickname: (nickname) => request('/api/auth/nickname/check/', { query: { nickname }, auth: false }),
  patchNickname: (nickname) => request('/api/users/me/', { method: 'PATCH', json: { nickname } }),
  blocks: (page) => request('/api/blocks/', { query: { page } }),
  unblock: (userId) => request(`/api/blocks/${encodeURIComponent(userId)}/`, { method: 'DELETE' }),
}

const source = isApiDemo ? demoSource : serverSource

const MAX_PAGES = 10

// 페이지 목록({ results, next })을 끝까지 모은다. 임시저장·차단은 한 사람이 많이 갖지 않아 한 번에 보여 준다.
async function collectPages(fetchPage) {
  const results = []
  let count = 0
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const data = await fetchPage(page)
    results.push(...data.results)
    count = data.count ?? results.length
    if (!data.next) break
  }
  return { count, results }
}

/** 마이(7-1). 우표 "n / 전체"는 GET /api/stamps/의 owned_count·total_count를 그대로 쓴다. */
export async function fetchMyPage() {
  const [me, settings, stamps] = await Promise.all([source.me(), source.settings(), source.stamps()])
  return toMyPage(me, settings, stamps)
}

/** 설정(7-1-1). 닉네임·지역·알림·차단 수를 한 번에 모아 메뉴 줄로 만든다. */
export async function fetchSettingsHome() {
  const [me, settings, blocks] = await Promise.all([source.me(), source.settings(), source.blocks(1)])
  return toSettingsHome(me, settings, blocks.count ?? 0)
}

/** 임시저장 목록(7-3). */
export async function fetchDrafts() {
  const { results } = await collectPages((page) => source.drafts(page))
  return results.map(toDraftCard)
}

export async function deleteDraft(id) {
  await source.deleteDraft(id)
}

/**
 * 우표첩(7-4~7-6).
 * @param {{ empty?: boolean }} [options] empty: 개발 모드(mock)에서만 우표 0개 상태를 보여 준다.
 */
export async function fetchStampCollection({ empty = false } = {}) {
  return toStampCollection(await source.stamps({ empty }))
}

/** 우표 상세(7-7). @param {string} code 서버 우표 code */
export async function fetchStampDetail(code) {
  return toStampDetail(await source.stamp(code))
}

/** 수집 보상(7-8). @param {{ empty?: boolean }} [options] empty: 개발 모드(mock)에서만 */
export async function fetchStampRewards({ empty = false } = {}) {
  return toStampRewards(await source.rewards({ empty }))
}

/**
 * 닉네임 확인(7-9). GET /api/auth/nickname/check/ 응답({ available, code })을 화면 상태로 바꾼다.
 * 2~10자가 아니면 서버를 부르지 않고 INVALID_NICKNAME으로 본다.
 */
export async function checkNickname(nickname) {
  const value = nickname.trim()
  if (value.length < 2 || value.length > 10) return toNicknameStatus({ available: false, code: 'INVALID_NICKNAME' })
  return toNicknameStatus(await source.checkNickname(value))
}

/** 현재 닉네임(7-9 입력창의 처음 값). */
export async function fetchNickname() {
  return (await source.me()).nickname
}

/** 닉네임 변경(7-9). 실패하면 ApiError(INVALID_NICKNAME 400, NICKNAME_TAKEN 409 등)를 던진다. */
export async function updateNickname(nickname) {
  await source.patchNickname(nickname.trim())
}

// ── 7-10 지역 설정: 이번 연동 범위가 아니다(shared/region #59 이후). 서버를 부르지 않고 이 파일의 메모리 값만 바꾼다. ──
let regionMe = structuredClone(MOCK_ME)

export async function fetchRegionSettings() {
  return toRegionSettings(regionMe)
}

// 지역 선택기({province, district})의 지역에 임시 id를 붙인다. 실제 id는 GET /api/regions/에 있다. 7-10 mock 전용.
function toMockRegion(region) {
  const list = METROPOLITAN.includes(region.province) ? DISTRICTS[region.province] : CITIES[region.province]
  const index = Math.max(list ? list.indexOf(region.district) : 0, 0)
  const id = (PROVINCES.indexOf(region.province) + 1) * 1000 + index + 1
  return { id, name: region.district || region.province, full_name: regionLabel(region) }
}

/** 지역 저장(7-10). 서버를 부르지 않는다(메모리 값만 바꾼다). */
export async function saveRegions({ hometowns, residence }) {
  if (hometowns.length < 1 || hometowns.length > 3 || !residence) {
    const error = new Error('본가 지역은 1~3곳, 거주 지역은 1곳이에요')
    error.code = 'VALIDATION_ERROR'
    throw error
  }
  regionMe = { ...regionMe, hometowns: hometowns.map(toMockRegion), residence: toMockRegion(residence) }
  return { hometown_region_ids: regionMe.hometowns.map((region) => region.id), residence_region_id: regionMe.residence.id }
}

/** 알림·편지 설정(7-11). */
export async function fetchSettings() {
  return toNotificationSettings(await source.settings())
}

/**
 * 설정 바꾸기(7-11). 바꾼 항목만 보낸다.
 * @param {Partial<Record<'letter_paused'|'push_enabled'|'daily_digest_enabled'|'weekly_prompt_enabled'|'letter_arrival_push_enabled'|'letter_departure_push_enabled', boolean>>} patch
 */
export async function updateSettings(patch) {
  return toNotificationSettings(await source.patchSettings(patch))
}

/**
 * 차단 목록(7-12).
 * @param {{ empty?: boolean }} [options] empty: 개발 모드(mock)에서만 차단한 사람이 없는 상태를 보여 준다.
 */
export async function fetchBlocks({ empty = false } = {}) {
  const { results } = await collectPages((page) => source.blocks(page, { empty }))
  return toBlockedUsers({ results })
}

/** 차단 해제(7-12). */
export async function unblock(userId) {
  await source.unblock(userId)
}

/** 로그아웃(7-13). 이번 범위 밖이라 아무것도 하지 않는다(refresh 토큰을 꺼내는 shared 변경이 필요하다). */
export async function logout() {}

/** 회원 탈퇴(7-13). 이번 범위 밖이라 아무것도 지우지 않는다. */
export async function withdraw() {}
