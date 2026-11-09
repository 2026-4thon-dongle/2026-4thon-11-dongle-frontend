import { MOCK_OWNED_DIARIES, MOCK_OWNED_PROFILE, OWNED_VISIBILITY } from '../mocks/ownedDiary.js'

export const isOwnedDiaryDemo = import.meta.env.DEV
let snapshot = { profile: isOwnedDiaryDemo ? MOCK_OWNED_PROFILE : null, diaries: isOwnedDiaryDemo ? MOCK_OWNED_DIARIES : [] }
const listeners = new Set()
export const getOwnedDiarySnapshot = () => snapshot
export function subscribeOwnedDiaries(listener) { listeners.add(listener); return () => listeners.delete(listener) }
function update(diaries) { snapshot = { ...snapshot, diaries }; listeners.forEach((listener) => listener()) }
function requireDemo() { if (!isOwnedDiaryDemo) throw new Error('아직 일기 API가 연결되지 않았어요. 입력 내용은 이 화면에 유지돼요.') }
function owned(id) { const record = snapshot.diaries.find((diary) => diary.id === id && diary.authorId === snapshot.profile?.id); if (!record) throw new Error('수정할 수 없거나 존재하지 않는 일기예요'); return record }
function validate(draft) { if (!draft.content.trim() || draft.content.trim().length > 500) throw new Error('일기를 1~500자로 입력해주세요') }
function photoValue(photo, previous) {
  if (!photo) return { key: 'snow', isDefault: true }
  if (photo === previous) return previous
  if (photo.file && photo.file === previous?.file) return previous
  if (photo.file) return { file: photo.file, url: URL.createObjectURL(photo.file) }
  return { key: photo.key || 'snow' }
}
function releasePhoto(photo, next) { if (photo?.url && photo.url !== next?.url) URL.revokeObjectURL(photo.url) }
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
  const diary = { id: crypto.randomUUID(), authorId: profile.id, province: profile.province, district: profile.district, title: draft.content.trim().split('\n')[0].slice(0, 24), content: draft.content.trim(), photo: photoValue(draft.photo), receiveLetters: draft.receiveLetters, visibility: 'all', ...dateLabels() }
  update([diary, ...snapshot.diaries])
  return diary
}

/** @param {string} id @param {{content: string, photo: object|null, receiveLetters: boolean}} draft */
export async function updateOwnedDiary(id, draft) {
  requireDemo(); validate(draft)
  const previous = owned(id)
  const diary = { ...previous, content: draft.content.trim(), title: draft.content.trim().split('\n')[0].slice(0, 24), photo: photoValue(draft.photo, previous.photo), receiveLetters: draft.receiveLetters }
  update(snapshot.diaries.map((item) => item.id === id ? diary : item)); releasePhoto(previous.photo, diary.photo)
  return diary
}

export async function deleteOwnedDiary(id) { requireDemo(); const diary = owned(id); update(snapshot.diaries.filter((item) => item.id !== id)); releasePhoto(diary.photo) }
export async function setOwnedDiaryVisibility(id, visibility) { requireDemo(); owned(id); if (!OWNED_VISIBILITY.includes(visibility)) throw new Error('공개 범위를 선택해주세요'); update(snapshot.diaries.map((diary) => diary.id === id ? { ...diary, visibility } : diary)) }
