import { isApiDemo } from './client.js'
import { getLocalDiaries, subscribeOwnedDiaries } from './ownedDiaryDemo.js'
import { getSignupProfile, subscribeSignupProfile } from './profile.js'
import { MOCK_READING_DIARIES, MOCK_READING_NOTIFICATIONS, MOCK_READING_PROFILE, READING_REPORT_REASONS } from '../mocks/readingDiary.js'

export const isReadingDemo = isApiDemo
let snapshot = { profile: isReadingDemo ? MOCK_READING_PROFILE : null, diaries: isReadingDemo ? MOCK_READING_DIARIES : [], notifications: isReadingDemo ? MOCK_READING_NOTIFICATIONS : [], hiddenDiaryIds: [], blockedAuthorIds: [] }
const listeners = new Set()
function applySignupProfile(profile) {
  if (!profile) return
  snapshot = { ...snapshot, profile }
  listeners.forEach((listener) => listener())
}
function syncDiaries() {
  const local = getLocalDiaries().map((diary) => ({ ...diary, nickname: diary.nickname || '친구', preview: diary.content.slice(0, 80), ago: diary.dateLabel, stamp: { id: 'first-diary', label: '첫 일기', number: '02' }, deliveryLabel: '편지는 실제 거리만큼 천천히 배달돼요' }))
  snapshot = { ...snapshot, diaries: [...local, ...MOCK_READING_DIARIES] }
  listeners.forEach((listener) => listener())
}
if (isReadingDemo) syncDiaries()
subscribeOwnedDiaries(syncDiaries)
applySignupProfile(getSignupProfile())
subscribeSignupProfile(applySignupProfile)
export const getReadingSnapshot = () => snapshot
export function subscribeReading(listener) { listeners.add(listener); return () => listeners.delete(listener) }
function update(patch) { snapshot = { ...snapshot, ...patch }; listeners.forEach((listener) => listener()) }
function requireDemo() { if (!isReadingDemo) throw new Error('아직 서버가 연결되지 않았어요. 잠시 후 다시 이용해주세요.') }

export function visibleReadingDiaries(state = snapshot) {
  return state.diaries.filter((diary) => !state.hiddenDiaryIds.includes(diary.id) && !state.blockedAuthorIds.includes(diary.authorId) && canReadDiary(diary, state.profile))
}

/** @param {string} authorId 실제 서버 연동 시 차단 요청 성공 후 공유 상태를 갱신한다. */
export async function blockReadingAuthor(authorId) {
  requireDemo()
  if (!snapshot.diaries.some((diary) => diary.authorId === authorId)) throw new Error('작성자를 찾을 수 없어요')
  update({ blockedAuthorIds: [...new Set([...snapshot.blockedAuthorIds, authorId])] })
}

/** @param {{diaryId: string, reason: string, details: string, blockAuthor: boolean}} report */
export async function reportReadingDiary({ diaryId, reason, details, blockAuthor }) {
  requireDemo()
  const diary = visibleReadingDiaries().find((item) => item.id === diaryId)
  if (!diary) throw new Error('이미 숨겨졌거나 존재하지 않는 일기예요')
  if (!READING_REPORT_REASONS.includes(reason)) throw new Error('신고 사유를 선택해주세요')
  if (reason === '기타 (직접 입력)' && !details.trim()) throw new Error('신고 내용을 입력해주세요')
  update({ hiddenDiaryIds: [...new Set([...snapshot.hiddenDiaryIds, diaryId])], blockedAuthorIds: blockAuthor ? [...new Set([...snapshot.blockedAuthorIds, diary.authorId])] : snapshot.blockedAuthorIds })
  return { demo: true }
}

export async function markReadingNotification(id) {
  requireDemo()
  update({ notifications: snapshot.notifications.map((notice) => notice.id === id ? { ...notice, unread: false } : notice) })
}

export function canReadDiary(diary, profile) {
  if (diary.authorId === profile?.id) return true
  if (diary.visibility === 'private') return false
  if (diary.visibility === 'hometown') return Boolean(profile?.hometowns?.some((region) => region.province === diary.province && (!region.district || region.district === diary.district)))
  return true
}
export function canReplyToDiary(diary, profile) {
  return diary.receiveLetters !== false && diary.authorId !== profile?.id && canReadDiary(diary, profile)
}
