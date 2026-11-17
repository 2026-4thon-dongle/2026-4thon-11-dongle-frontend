import { useEffect } from 'react'
import Loading from '../../shared/feedback/Loading.jsx'
import Button from '../../shared/ui/Button.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import { useNavigate } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import useReadingDiary from '../../shared/hooks/useReadingDiary.js'
import { isReadingDemo, markReadingNotification, loadReadingNotifications } from '../../shared/api/readingDiary.js'
import unreadDot from '../../shared/assets/reading/unread-dot.svg'
import './NotificationPage.css'

export default function NotificationPage() {
  const state = useReadingDiary()
  const { showToast } = useOverlay()
  useEffect(() => { loadReadingNotifications() }, [])
  const navigate = useNavigate()
  const items = state.notifications.filter((notice) => !state.blockedAuthorIds.includes(notice.authorId))
  // 읽음 처리 실패가 알림 대상 화면으로 가는 것을 막지 않도록 먼저 이동하고, 안 읽은 알림만 뒤에서 읽음으로 바꾼다.
  function open(notice) { if (notice.unread) markReadingNotification(notice.id).catch(() => {}); navigate(notice.to) }
  if (state.error) return <ErrorScreen description={state.error.message} hint="" onRetry={() => loadReadingNotifications()} />
  if (state.loading && !state.notifications.length) return <Loading />
  return <main className="reading-notifications"><Header title="알림" onBack={() => navigate('/home')} /><div className="reading-notification-body"><aside className="reading-notification-note"><Icon name="bell" /><p className="text-body-13">알림은 하루 한 번, 저녁 8시에 모아서 보내드려요</p></aside><ul className="reading-notification-list">{items.map((notice) => <li key={notice.id}><button type="button" onClick={() => open(notice)} aria-label={`${notice.title}${notice.unread ? ' (읽지 않음)' : ''}`}><span className={`reading-notification-icon reading-notification-icon--${notice.tone}`}><Icon name={notice.icon} /></span><span className="reading-notification-text"><strong>{notice.title}</strong><small>{notice.ago}</small></span>{notice.unread && <img className="reading-notification-unread" src={unreadDot} alt="읽지 않음" />}</button></li>)}</ul>{!items.length && <p className="text-body-13">아직 도착한 알림이 없어요</p>}{!isReadingDemo && state.notificationNext && <Button disabled={state.loading} onClick={() => loadReadingNotifications(state.notificationNext).catch((error) => showToast(error.message))}>더 보기</Button>}{isReadingDemo && <p className="reading-notification-demo text-caption-11">개발용 미리보기 · 실제 이메일은 발송하지 않아요</p>}</div></main>
}
