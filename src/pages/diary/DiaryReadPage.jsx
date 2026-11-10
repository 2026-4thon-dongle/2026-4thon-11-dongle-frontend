import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import { DiaryPhoto, PostcardStamp, Postmark } from '../../shared/ui/DiaryPostcardParts.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import useReadingDiary from '../../shared/hooks/useReadingDiary.js'
import { isReadingDemo, visibleReadingDiaries } from '../../shared/api/readingDiary.js'
import { diaryReplyUrl } from '../../shared/utils/readingDiaryRoutes.js'
import { DiaryMenu, ReportDiaryForm, BlockDiaryDialog } from '../../components/diary/ReadingModeration.jsx'
import './DiaryReadPage.css'

export default function DiaryReadPage() {
  const { diaryId } = useParams()
  const state = useReadingDiary()
  const { state: navigationState } = useLocation()
  const navigate = useNavigate()
  const { openSheet, openDialog, showToast, close } = useOverlay()
  const diary = visibleReadingDiaries(state).find((item) => item.id === diaryId)
  const from = typeof navigationState?.from === 'string' && /^\/home(?:\?|$)/.test(navigationState.from) ? navigationState.from : '/home'
  useEffect(() => { window.scrollTo(0, 0); return () => close() }, [diaryId, close])
  const done = (message) => { navigate(from, { replace: true }); showToast(message) }
  function report() { openSheet({ title: '어떤 점이 불편했나요?', content: ({ close: closeLayer }) => <ReportDiaryForm diary={diary} close={closeLayer} onDone={() => done('개발용 신고를 반영하고 일기를 숨겼어요')} /> }) }
  function block() { openDialog({ label: `${diary.nickname}님 차단 확인`, content: ({ close: closeLayer }) => <BlockDiaryDialog diary={diary} close={closeLayer} onDone={() => done('개발용 차단을 반영했어요')} /> }) }
  function menu() { openSheet({ title: `${diary.nickname}님의 일기`, content: <DiaryMenu diary={diary} onReport={report} onBlock={block} /> }) }
  if (!isReadingDemo || !diary) return <ErrorScreen title={isReadingDemo ? '이 일기를 볼 수 없어요' : '일기 연결을 준비하고 있어요'} description={isReadingDemo ? '삭제·신고·차단되었거나 존재하지 않는 일기예요' : '일기 조회 API 연결이 필요해요'} hint="" retryLabel="홈으로 돌아가기" onRetry={() => navigate('/home')} />
  return <main className="reading-detail"><Header title="고향 일기" onBack={() => navigate(from)} right={<button type="button" className="reading-more-button" aria-label="일기 메뉴" onClick={menu}><Icon name="more" /></button>} />
    <article className="reading-diary-paper" aria-label={`${diary.nickname}의 고향 일기`}><div className="reading-diary-airmail" aria-hidden="true" /><div className={`reading-diary-scene ${!diary.photo ? 'reading-diary-scene--no-photo' : ''}`}>{diary.photo && <DiaryPhoto large />}<div className="reading-diary-stamp"><PostcardStamp stamp={diary.stamp} size={58} /></div><div className="reading-diary-postmark"><Postmark province={diary.province} date={diary.postmarkDate} waves /></div></div><div className="reading-diary-author"><h2>From. {diary.nickname}</h2><p className="text-caption-11">{diary.province} {diary.district} · {diary.dateLabel}</p></div><p className="reading-diary-body">{diary.content}</p></article>
    <aside className="reading-reply-note"><Mascot pose="letter" size={64} /><div><h2 className="text-label-15">댓글 대신, 편지로 마음을 전해요</h2><p className="text-caption-11">{diary.deliveryLabel}</p></div></aside>
    <Link className="ui-button ui-button--primary reading-detail-reply" to={diaryReplyUrl(diary)}>편지로 답장하기</Link><p className="reading-detail-demo text-caption-11">개발용 미리보기 · 일기와 배송 시간은 예시예요</p>
  </main>
}
