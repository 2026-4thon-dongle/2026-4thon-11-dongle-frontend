import * as demo from './readingDiaryDemo.js'
import { isApiDemo, request, subscribeSession } from './client.js'
import { getSignupProfile, loadProfile, subscribeSignupProfile } from './profile.js'
import { getRegions } from './regions.js'
import { mapDiary } from './mappers.js'
import appendUnique from './appendUnique.js'
import { relativeTime } from '../utils/relativeTime.js'
import { READING_REPORT_REASONS } from '../mocks/readingDiary.js'
export const isReadingDemo = isApiDemo
const empty = () => ({ profile: null, diaries: [], notifications: [], hiddenDiaryIds: [], blockedAuthorIds: [], regions: [], newCount: 0, unreadCount: 0, loading: false, error: null, next: null, notificationNext: null })
let state = { ...empty(), profile: getSignupProfile() }, generation = 0
const listeners = new Set()
function update(patch) { state = { ...state, ...patch }; listeners.forEach((fn) => fn()) }
subscribeSignupProfile((profile) => { if (!isApiDemo) update({ profile }) })
subscribeSession(() => { generation++; update(empty()) })
export const getReadingSnapshot = () => isApiDemo ? demo.getReadingSnapshot() : state
export function subscribeReading(fn) { if (isApiDemo) return demo.subscribeReading(fn); listeners.add(fn); return () => listeners.delete(fn) }
export function visibleReadingDiaries(snapshot = getReadingSnapshot()) { return isApiDemo ? demo.visibleReadingDiaries(snapshot) : snapshot.diaries.filter((item) => !snapshot.hiddenDiaryIds.includes(item.id) && !snapshot.blockedAuthorIds.includes(item.authorId)) }
export const canReadDiary = (diary, profile) => isApiDemo ? demo.canReadDiary(diary, profile) : true
export const canReplyToDiary = (diary, profile) => isApiDemo ? demo.canReplyToDiary(diary, profile) : diary.canReply === true
export async function loadReadingFeed({ away = false, region, page = 1 } = {}) {
  if (isApiDemo) return
  const current = ++generation
  update({ loading: true, error: null, ...(page === 1 ? { diaries: [] } : {}) })
  try {
    const profile = getSignupProfile() || await loadProfile()
    // 배너 숫자·알림 점은 부가 정보라 실패해도 피드는 보여 준다.
    const [regions, summary, unread] = await Promise.all([getRegions(), request('/api/feed/hometown/summary/').catch(() => null), request('/api/notifications/unread-count/').catch(() => null)])
    const selected = !region || region === '전체' ? undefined : away ? regions.find((item) => item.short_name === region)?.id : profile.hometowns.find((item) => (item.district || item.province) === region)?.id
    // 주소에 남은 지역이 지금 고를 수 없는 지역이면(본가를 바꾼 뒤 뒤로 가기 등) 화면 칩처럼 "전체"로 불러온다.
    // 오류로 막으면 다시 시도해도 같은 지역으로 다시 실패했다.
    const data = await request(away ? '/api/feed/others/' : '/api/feed/hometown/', { query: { page, [away ? 'sido' : 'region']: selected } })
    if (current !== generation) return
    // 첫 페이지는 서버가 차단·신고한 일기를 이미 빼고 주므로 화면에서 숨기던 목록을 비운다(차단 해제 뒤 다시 보이게).
    update({ profile, regions, newCount: page === 1 ? summary?.new_count ?? 0 : state.newCount, unreadCount: unread?.unread_count ?? state.unreadCount, ...(page === 1 ? { blockedAuthorIds: [], hiddenDiaryIds: [] } : {}), diaries: page === 1 ? data.results.map(mapDiary) : appendUnique(state.diaries, data.results.map(mapDiary)), next: data.next ? page + 1 : null, loading: false })
    // 확인 기록은 첫 페이지를 보여 준 뒤 한 번만 남긴다(api/feed.md). 실패해도 이미 보여 준 피드를 오류 화면으로 바꾸지 않는다.
    if (!away && page === 1) request('/api/feed/hometown/seen/', { method: 'POST' }).catch(() => {})
  } catch (error) {
    if (current !== generation) return
    // 다음 페이지가 실패하면 보던 목록은 그대로 두고 부른 쪽에 알린다.
    if (page > 1) { update({ loading: false }); throw error }
    update({ loading: false, error })
  }
}
export async function loadReadingDetail(id) {
  if (isApiDemo) return
  const current = ++generation
  update({ loading: true, error: null, diaries: [] })
  try {
    const diary = mapDiary(await request(`/api/feed/diaries/${encodeURIComponent(id)}/`))
    if (current === generation) update({ diaries: [diary], loading: false })
  } catch (error) { if (current === generation) update({ loading: false, error }) }
}
function mapNotice(raw) {
  const paths = { letter_arrived: `/mailbox/${raw.target_id}`, letter_departed: '/mailbox?tab=shipping', letter_location: `/delivery/${raw.target_id}/map`, round_trip: `/mailbox/chats/${raw.target_id}`, prompt: '/diary/write' }
  return { ...raw, id: String(raw.id), unread: !raw.read_at, to: paths[raw.type] || '/notification', icon: ({ prompt: 'sparkle', letter_location: 'map', round_trip: 'stamp' })[raw.type] || 'mail', tone: ({ prompt: 'sage', letter_location: 'sky', round_trip: 'cream' })[raw.type] || 'peach', ago: relativeTime(raw.created_at) }
}
export async function loadReadingNotifications(page = 1) {
  if (isApiDemo) return
  const current = ++generation
  update({ loading: true, error: null })
  try {
    const data = await request('/api/notifications/', { query: { page } })
    if (current === generation) update({ notifications: page === 1 ? data.results.map(mapNotice) : appendUnique(state.notifications, data.results.map(mapNotice)), notificationNext: data.next ? page + 1 : null, loading: false })
  } catch (error) {
    if (current !== generation) return
    if (page > 1) { update({ loading: false }); throw error }
    update({ loading: false, error })
  }
}
export async function markReadingNotification(id) {
  if (isApiDemo) return demo.markReadingNotification(id)
  const notice = mapNotice(await request(`/api/notifications/${encodeURIComponent(id)}/read/`, { method: 'POST' }))
  update({ notifications: state.notifications.map((item) => item.id === id ? notice : item) })
}
export async function blockReadingAuthor(authorId) {
  if (isApiDemo) return demo.blockReadingAuthor(authorId)
  await request('/api/blocks/', { method: 'POST', json: { user_id: Number(authorId) } })
  update({ blockedAuthorIds: [...new Set([...state.blockedAuthorIds, authorId])] })
}
export async function reportReadingDiary({ diaryId, reason, details, blockAuthor }) {
  if (isApiDemo) return demo.reportReadingDiary({ diaryId, reason, details, blockAuthor })
  const reasons = ['abuse', 'sexual', 'personal_info', 'spam', 'etc']
  const code = reasons[READING_REPORT_REASONS.indexOf(reason)]
  if (!code || (code === 'etc' && !details.trim()) || details.length > 200) throw new Error('신고 사유와 내용(200자 이하)을 확인해주세요')
  const diary = state.diaries.find((item) => item.id === diaryId)
  const result = await request('/api/reports/', { method: 'POST', json: { target_type: 'diary', target_id: Number(diaryId), reason: code, detail: details.trim(), block_user: blockAuthor } })
  update({ hiddenDiaryIds: [...new Set([...state.hiddenDiaryIds, diaryId])], blockedAuthorIds: result.blocked && diary ? [...new Set([...state.blockedAuthorIds, diary.authorId])] : state.blockedAuthorIds })
  return result
}
