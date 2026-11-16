// 마이 요청. 서버를 부르고 mypageMapper로 화면용 데이터를 만든다. 오류는 shared/api/client.js의 ApiError 그대로 던진다.
//   GET /api/users/me/, /settings/, GET /api/stamps/  → fetchMyPage (7-1)
//   GET /api/users/me/, /settings/, GET /api/blocks/  → fetchSettingsHome (7-1-1)
//   GET·DELETE /api/letters/drafts/                   → fetchDrafts, deleteDraft (7-3)
//   GET /api/stamps/, /{code}/, /rewards/             → fetchStampCollection, fetchStampDetail, fetchStampRewards (7-4~7-8)
//   GET /api/auth/nickname/check/, PATCH /api/users/me/ → checkNickname, fetchNickname, updateNickname (7-9)
//   GET·PATCH /api/users/me/settings/                 → fetchSettings, updateSettings (7-11)
//   GET /api/blocks/, DELETE /api/blocks/{user_id}/   → fetchBlocks, unblock (7-12)
//   GET /api/users/me/, PUT /api/users/me/regions/    → fetchRegionSettings, saveRegions (7-10)
//   POST /api/auth/logout/, DELETE /api/users/me/     → logout, withdraw (7-13)
// VITE_API_MOCK=true(개발 모드)일 때만 mypageDemo.js의 가짜 서버를 쓴다. 서버가 실패해도 mock으로 채우지 않는다.
import { ApiError, clearTokens, getTokens, isApiDemo, request } from '../../shared/api/client.js'
import { demoSource } from './mypageDemo.js'
import { saveSignupProfile } from '../../shared/api/profile.js'
import { mapProfile } from '../../shared/api/mappers.js'
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
  // 7-10. 두 번째 인자(고른 지역 원본)는 mock이 화면용 이름을 만들 때만 쓴다. 서버는 id만 받는다.
  putRegions: (body) => request('/api/users/me/regions/', { method: 'PUT', json: body }),
  unblock: (userId) => request(`/api/blocks/${encodeURIComponent(userId)}/`, { method: 'DELETE' }),
  logout: (refresh) => request('/api/auth/logout/', { method: 'POST', json: { refresh } }),
  withdraw: () => request('/api/users/me/', { method: 'DELETE' }),
}

const source = isApiDemo ? demoSource : serverSource

const MAX_PAGES = 10

// 닉네임·지역을 바꾸면 서버가 돌려준 내 정보(GET /api/users/me/와 같은 모양)로 앱 공용 프로필을 바꾼다.
// 홈 피드의 본가 칩·인사 문구가 새로고침 전까지 옛 값을 쓰지 않게 한다. 개발 모드(mock)는 응답 모양이 달라 건너뛴다.
function syncProfile(me) {
  if (!isApiDemo && me?.id) saveSignupProfile(mapProfile(me))
}

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
  syncProfile(await source.patchNickname(nickname.trim()))
}

/** 지역 설정(7-10)의 처음 값. GET /api/users/me/의 hometowns[]·residence를 지역 선택기 값(id 포함)으로 바꾼다. */
export async function fetchRegionSettings() {
  return toRegionSettings(await source.me())
}

/**
 * 지역 저장(7-10). PUT /api/users/me/regions/ { hometown_region_ids[1~3], residence_region_id }.
 * 지역 선택기가 준 id(서버 지역 id)를 그대로 보낸다. id가 없는 값(저장된 프로필에서 id 없이 온 값)이 있으면
 * 서버를 부르지 않고 "다시 골라 주세요"로 안내한다. 지역을 다시 고르면 id가 채워진다.
 * 서버가 거절하면 ApiError(VALIDATION_ERROR 등)를 그대로 던진다.
 * @param {{ hometowns: Array<{province: string, district: string, id?: number}>, residence: {province: string, district: string, id?: number} }} regions
 */
export async function saveRegions({ hometowns, residence }) {
  if (hometowns.length < 1 || hometowns.length > 3 || !residence) {
    const error = new Error('본가 지역은 1~3곳, 거주 지역은 1곳이에요')
    error.code = 'VALIDATION_ERROR'
    throw error
  }
  if (![...hometowns, residence].every((region) => Number.isInteger(region.id))) {
    const error = new Error('지역 정보를 다시 확인해야 해요. 지역을 다시 골라 주세요')
    error.code = 'VALIDATION_ERROR'
    throw error
  }
  syncProfile(await source.putRegions({ hometown_region_ids: hometowns.map((region) => region.id), residence_region_id: residence.id }, { hometowns, residence }))
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

/**
 * 로그아웃(7-13). POST /api/auth/logout/ { refresh } 로 refresh 토큰을 무효화하고, 서버 결과와 상관없이 로컬 토큰을 지운다.
 * 서버 호출이 실패해도(네트워크, 400 INVALID_REFRESH_TOKEN 등) 이 기기에서는 로그아웃된다. 이때 serverOk는 false이고 서버의 refresh는 만료 때까지 남는다.
 * 토큰을 지우면 SessionGate가 로그인 화면(/login)으로 보내므로, 화면 이동은 beforeClear에서 먼저 한다.
 * access가 만료돼 있으면 request()가 refresh를 새로 받아 오므로(회전) 처음 보낸 refresh가 무효가 될 수 있다. 그때는 새 refresh로 한 번 다시 보낸다.
 * @param {{ beforeClear?: () => void }} [options] beforeClear: 토큰을 지우기 직전에 부른다(예: navigate)
 * @returns {Promise<{ serverOk: boolean }>} 이 함수는 던지지 않는다
 */
export async function logout({ beforeClear } = {}) {
  let serverOk = true
  try {
    const sent = getTokens().refresh
    if (!isApiDemo && sent) {
      try {
        await source.logout(sent)
      } catch (error) {
        const current = getTokens().refresh
        if (!(error instanceof ApiError && error.code === 'INVALID_REFRESH_TOKEN' && current && current !== sent)) throw error
        await source.logout(current)
      }
    }
  } catch {
    serverOk = false
  }
  try {
    beforeClear?.()
  } finally {
    clearTokens()
  }
  return { serverOk }
}

/**
 * 회원 탈퇴(7-13). DELETE /api/users/me/ 가 성공한 뒤에만 로컬 토큰을 지운다. 탈퇴 뒤에는 logout을 부르지 않는다.
 * 서버가 실패하면 ApiError를 그대로 던지고 토큰은 지우지 않는다(계정이 아직 있으므로). 화면이 오류와 다시 시도를 보여 준다.
 * @param {{ beforeClear?: () => void }} [options] beforeClear: 토큰을 지우기 직전에 부른다(예: navigate)
 */
export async function withdraw({ beforeClear } = {}) {
  if (!isApiDemo) await source.withdraw()
  try {
    beforeClear?.()
  } finally {
    clearTokens()
  }
}
