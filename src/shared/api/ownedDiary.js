import * as demo from './ownedDiaryDemo.js'
import { isApiDemo, request, subscribeSession } from './client.js'
import { getSignupProfile, loadProfile, saveSignupProfile, subscribeSignupProfile } from './profile.js'
import { mapDiary } from './mappers.js'
export const isOwnedDiaryDemo = isApiDemo
const listeners = new Set()
const empty = () => ({ profile: null, diaries: [], loading: false, error: null, next: null, count: 0 })
let state = { ...empty(), profile: profileView(getSignupProfile()) }, generation = 0
function update(patch) { state = { ...state, ...patch }; listeners.forEach((fn) => fn()) }
function profileView(profile) { return profile ? { ...profile, ...profile.residence, regionLabel: [profile.residence?.province, profile.residence?.district].filter(Boolean).join(' ') } : null }
subscribeSignupProfile((profile) => { if (!isApiDemo) update({ profile: profileView(profile) }) })
subscribeSession(() => { generation++; update(empty()) })
export const getOwnedDiarySnapshot = () => isApiDemo ? demo.getOwnedDiarySnapshot() : state
export const getLocalDiaries = () => isApiDemo ? demo.getLocalDiaries() : state.diaries
export function subscribeOwnedDiaries(fn) { if (isApiDemo) return demo.subscribeOwnedDiaries(fn); listeners.add(fn); return () => listeners.delete(fn) }
export async function loadOwnedDiaries(page = 1) {
  if (isApiDemo) return
  const current = ++generation
  update({ loading: true, error: null })
  try {
    const profile = getSignupProfile() || await loadProfile()
    const data = await request('/api/diaries/me/', { query: { page } })
    if (current !== generation) return
    update({ profile: profileView(profile), diaries: page === 1 ? data.results.map(mapDiary) : [...state.diaries, ...data.results.map(mapDiary)].filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index), count: data.count, next: data.next ? page + 1 : null, loading: false })
  } catch (error) {
    if (current !== generation) return
    // 다음 페이지가 실패하면 보던 목록은 그대로 두고 부른 쪽에 알린다(목록 전체를 오류 화면으로 바꾸지 않는다).
    if (page > 1) { update({ loading: false }); throw error }
    update({ loading: false, error })
  }
}
export async function loadOwnedDiary(id) {
  if (isApiDemo) return
  const current = ++generation
  update({ loading: true, error: null })
  try {
    const profile = getSignupProfile() || await loadProfile()
    const diary = mapDiary(await request(`/api/diaries/${encodeURIComponent(id)}/`))
    if (current === generation) update({ profile: profileView(profile), diaries: [diary, ...state.diaries.filter((item) => item.id !== diary.id)], loading: false })
  } catch (error) {
    if (current !== generation) return
    // 없거나 내 일기가 아니면(404 NOT_FOUND) 재시도 화면 대신 화면의 "이 일기를 찾을 수 없어요"를 보여 준다.
    if (error?.status === 404) update({ loading: false, diaries: state.diaries.filter((item) => item.id !== String(id)) })
    else update({ loading: false, error })
  }
}
/** 다른 화면(일기 쓰기)으로 옮길 때 앞 화면의 불러오기 오류를 지운다. 오류가 남으면 그 화면까지 오류 화면이 된다. */
export function clearOwnedDiaryError() { if (!isApiDemo && state.error) update({ error: null }) }
function form(draft, editing = false) {
  const content = draft.content.trim()
  if (!content || content.length > 500) throw new Error('일기를 1~500자로 입력해주세요')
  const data = new FormData()
  data.set('body', content)
  data.set('accepts_letters', String(draft.receiveLetters ?? true))
  const file = draft.photo?.file
  if (file) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('사진은 JPEG·PNG·WEBP, 5MB 이하로 첨부해주세요')
    data.set('image', file)
  } else if (editing && !draft.photo) data.set('remove_image', 'true')
  return data
}
function remember(raw) {
  const diary = mapDiary(raw)
  update({ diaries: [diary, ...state.diaries.filter((item) => item.id !== diary.id)] })
  return diary
}
export async function createOwnedDiary(draft) {
  if (isApiDemo) return demo.createOwnedDiary(draft)
  const data = await request('/api/diaries/', { method: 'POST', formData: form(draft) })
  const diary = remember(data)
  const profile = getSignupProfile()
  if (profile && !profile.first_diary_completed) saveSignupProfile({ ...profile, first_diary_completed: true })
  return diary
}
export async function updateOwnedDiary(id, draft) {
  if (isApiDemo) return demo.updateOwnedDiary(id, draft)
  return remember(await request(`/api/diaries/${encodeURIComponent(id)}/`, { method: 'PATCH', formData: form(draft, true) }))
}
export async function deleteOwnedDiary(id) {
  if (isApiDemo) return demo.deleteOwnedDiary(id)
  await request(`/api/diaries/${encodeURIComponent(id)}/`, { method: 'DELETE' })
  update({ diaries: state.diaries.filter((item) => item.id !== id), count: Math.max(0, state.count - 1) })
}
export async function setOwnedDiaryVisibility(id, visibility) {
  if (isApiDemo) return demo.setOwnedDiaryVisibility(id, visibility)
  if (!['all', 'hometown', 'private'].includes(visibility)) throw new Error('공개 범위를 선택해주세요')
  return remember(await request(`/api/diaries/${encodeURIComponent(id)}/`, { method: 'PATCH', json: { visibility: visibility === 'hometown' ? 'same_hometown' : visibility } }))
}
export async function createFirstOwnedDiary(draft) {
  if (isApiDemo) return demo.createFirstOwnedDiary(draft)
  const diary = await createOwnedDiary({ ...draft, photo: draft.photo ? { file: draft.photo } : null, receiveLetters: true })
  diary.isFirstDiary = true
  return diary
}
