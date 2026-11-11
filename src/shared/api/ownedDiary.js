import { getSignupProfile, subscribeSignupProfile } from './profile.js'
import { MOCK_OWNED_DIARIES, MOCK_OWNED_PROFILE, OWNED_VISIBILITY } from '../mocks/ownedDiary.js'

export const isOwnedDiaryDemo = import.meta.env.DEV
const STORAGE_KEY = 'dongle.owned-diaries.v1'
const listeners = new Set()
function loadRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : null
  } catch { return null }
}
let records = isOwnedDiaryDemo ? loadRecords() || (getSignupProfile() ? [] : MOCK_OWNED_DIARIES) : []
function ownedProfile(profile) {
  return profile ? { ...profile, ...profile.residence, regionLabel: [profile.residence.province, profile.residence.district].filter(Boolean).join(' ') } : isOwnedDiaryDemo ? MOCK_OWNED_PROFILE : null
}
let snapshot = { profile: ownedProfile(getSignupProfile()), diaries: [] }
function refresh() {
  snapshot = { ...snapshot, diaries: records.filter((diary) => diary.authorId === snapshot.profile?.id) }
  listeners.forEach((listener) => listener())
}
refresh()
subscribeSignupProfile((profile) => { snapshot = { ...snapshot, profile: ownedProfile(profile) }; refresh() })
export const getOwnedDiarySnapshot = () => snapshot
export const getLocalDiaries = () => records
export function subscribeOwnedDiaries(listener) { listeners.add(listener); return () => listeners.delete(listener) }
function update(diaries) {
  const next = [...diaries, ...records.filter((diary) => diary.authorId !== snapshot.profile.id)]
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) }
  catch { throw new Error('브라우저에 저장하지 못했어요. 저장 공간과 브라우저 설정을 확인해주세요.') }
  records = next
  refresh()
}
function requireDemo() { if (!isOwnedDiaryDemo) throw new Error('아직 일기 API가 연결되지 않았어요. 입력 내용은 이 화면에 유지돼요.') }
function owned(id) { const record = snapshot.diaries.find((diary) => diary.id === id && diary.authorId === snapshot.profile?.id); if (!record) throw new Error('수정할 수 없거나 존재하지 않는 일기예요'); return record }
function validate(draft) { if (!draft.content.trim() || draft.content.trim().length > 500) throw new Error('일기를 1~500자로 입력해주세요') }
async function photoValue(photo, previous) {
  if (!photo) return { key: 'snow', isDefault: true }
  if (photo === previous) return previous
  if (photo.file) {
    const url = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('사진을 읽지 못했어요. 다시 첨부해주세요.'))
      reader.readAsDataURL(photo.file)
    })
    return { url }
  }
  return photo.url ? { url: photo.url } : { key: photo.key || 'snow' }
}
function releasePhoto(photo, next) { if (photo?.url?.startsWith('blob:') && photo.url !== next?.url) URL.revokeObjectURL(photo.url) }
function dateLabels() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).formatToParts(now)
  const month = parts.find((part) => part.type === 'month').value
  const day = parts.find((part) => part.type === 'day').value
  return { dateLabel: `${Number(month)}월 ${Number(day)}일`, postmarkDate: `${month}.${day}` }
}

/** @param {{content: string, photo: object|null, receiveLetters: boolean}} draft 서버 연동 시 FormData·인증 처리를 교체한다. */
export async function createOwnedDiary(draft) {
  requireDemo(); validate(draft)
  const profile = snapshot.profile
  const diary = { id: crypto.randomUUID(), authorId: profile.id, province: profile.province, district: profile.district, title: draft.content.trim().split('\n')[0].slice(0, 24), content: draft.content.trim(), photo: await photoValue(draft.photo), receiveLetters: draft.receiveLetters, visibility: 'all', isFirstDiary: draft.isFirstDiary === true, nickname: profile.nickname, createdAt: new Date().toISOString(), ...dateLabels() }
  update([diary, ...snapshot.diaries])
  return diary
}

/** @param {string} id @param {{content: string, photo: object|null, receiveLetters: boolean}} draft */
export async function updateOwnedDiary(id, draft) {
  requireDemo(); validate(draft)
  const previous = owned(id)
  const diary = { ...previous, content: draft.content.trim(), title: draft.content.trim().split('\n')[0].slice(0, 24), photo: await photoValue(draft.photo, previous.photo), receiveLetters: draft.receiveLetters }
  update(snapshot.diaries.map((item) => item.id === id ? diary : item)); releasePhoto(previous.photo, diary.photo)
  return diary
}

export async function deleteOwnedDiary(id) { requireDemo(); const diary = owned(id); update(snapshot.diaries.filter((item) => item.id !== id)); releasePhoto(diary.photo) }
export async function setOwnedDiaryVisibility(id, visibility) { requireDemo(); owned(id); if (!OWNED_VISIBILITY.includes(visibility)) throw new Error('공개 범위를 선택해주세요'); update(snapshot.diaries.map((diary) => diary.id === id ? { ...diary, visibility } : diary)) }

// First diaries share the same records and ownership checks as ordinary diaries.
export async function createFirstOwnedDiary(draft) {
  const previous = snapshot.diaries.find((diary) => diary.isFirstDiary)
  if (previous) return previous
  return createOwnedDiary({ ...draft, photo: draft.photo ? { file: draft.photo } : null, receiveLetters: true, isFirstDiary: true })
}
