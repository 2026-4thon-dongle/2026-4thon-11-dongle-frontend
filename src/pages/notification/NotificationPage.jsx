import { useNavigate } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import useReadingDiary from '../../shared/hooks/useReadingDiary.js'
import { isReadingDemo, markReadingNotification } from '../../shared/api/readingDiary.js'
import unreadDot from '../../shared/assets/reading/unread-dot.svg'
import './NotificationPage.css'

export default function NotificationPage() {
  const state = useReadingDiary()
  const navigate = useNavigate()
  const items = state.notifications.filter((notice) => !state.blockedAuthorIds.includes(notice.authorId))
  async function open(notice) { await markReadingNotification(notice.id); navigate(notice.to) }
  if (!isReadingDemo) return <ErrorScreen title="알림 연결을 준비하고 있어요" description="알림 조회 API 연결이 필요해요" hint="" />
  return <main className="reading-notifications"><Header title="알림" onBack={() => navigate('/home')} /><div className="reading-notification-body"><aside className="reading-notification-note"><Icon name="bell" /><p className="text-body-13">알림은 하루 한 번, 저녁 8시에 모아서 보내드려요</p></aside><ul className="reading-notification-list">{items.map((notice) => <li key={notice.id}><button type="button" onClick={() => open(notice)} aria-label={`${notice.title}${notice.unread ? ' (읽지 않음)' : ''}`}><span className={`reading-notification-icon reading-notification-icon--${notice.tone}`}><Icon name={notice.icon} /></span><span className="reading-notification-text"><strong>{notice.title}</strong><small>{notice.ago}</small></span>{notice.unread && <img className="reading-notification-unread" src={unreadDot} alt="읽지 않음" />}</button></li>)}</ul>{!items.length && <p className="text-body-13">아직 도착한 알림이 없어요</p>}<p className="reading-notification-demo text-caption-11">개발용 미리보기 · 실제 이메일은 발송하지 않아요</p></div></main>
}
