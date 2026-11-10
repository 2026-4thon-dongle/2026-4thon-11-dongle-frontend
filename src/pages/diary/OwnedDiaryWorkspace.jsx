import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import useOwnedDiaries from '../../shared/hooks/useOwnedDiaries.js'
import { isOwnedDiaryDemo } from '../../shared/api/ownedDiary.js'
import OwnedDiaryEditor from '../../components/diary/OwnedDiaryEditor.jsx'
import OwnedDiaryDetail from '../../components/diary/OwnedDiaryDetail.jsx'
import OwnedDiaryList from '../../components/diary/OwnedDiaryList.jsx'
import OwnedDiaryPublished from '../../components/diary/OwnedDiaryPublished.jsx'
import { OwnedDiaryMenu, OwnedVisibilitySheet, OwnedDeleteDialog } from '../../components/diary/OwnedDiaryLayers.jsx'
import './OwnedDiaryWorkspace.css'

export default function OwnedDiaryWorkspace() {
  const { pathname } = useLocation()
  const segment = decodeURI(pathname.slice('/diary/'.length))
  const navigate = useNavigate()
  const state = useOwnedDiaries()
  const { openSheet, openDialog, close, showToast } = useOverlay()
  const parts = segment.split('/')
  const id = parts[1]
  const diary = state.diaries.find((item) => item.id === id)
  useEffect(() => { window.scrollTo(0, 0); return () => close() }, [segment, close])
  function menu() {
    openSheet({ title: '내 일기', content: <OwnedDiaryMenu onEdit={() => { close(); navigate(`/diary/mine/${encodeURIComponent(id)}/edit`) }} onDelete={() => openDialog({ label: '일기 삭제 확인', content: ({ close: closeLayer }) => <OwnedDeleteDialog diary={diary} close={closeLayer} onDeleted={() => { navigate('/diary/mine', { replace: true }); showToast(<span className="owned-delete-toast"><Icon name="check" size={22} />일기를 삭제했어요</span>) }} /> })} onVisibility={() => openSheet({ title: '누구에게 보여줄까요?', content: ({ close: closeLayer }) => <OwnedVisibilitySheet diary={diary} close={closeLayer} onSaved={() => showToast('개발용 공개 범위를 저장했어요')} /> })} /> })
  }
  if (!isOwnedDiaryDemo) return <ErrorScreen title="일기 연결을 준비하고 있어요" description="사용자 정보와 일기 API 연결이 필요해요" hint="" />
  if (segment === 'write') return <OwnedDiaryEditor key="new-diary" profile={state.profile} onBack={() => navigate('/home')} onSaved={(saved) => navigate(`/diary/published/${encodeURIComponent(saved.id)}`, { replace: true })} />
  if (segment === 'mine') return <OwnedDiaryList diaries={state.diaries} profile={state.profile} onBack={() => navigate('/mypage')} />
  if ((parts[0] === 'mine' || parts[0] === 'published') && !diary) return <ErrorScreen title="이 일기를 찾을 수 없어요" description="삭제되었거나 새로고침으로 초기화된 개발용 일기예요" hint="" retryLabel="내 일기 목록" onRetry={() => navigate('/diary/mine')} />
  if (parts[0] === 'published' && diary) return <OwnedDiaryPublished diary={diary} />
  if (parts[0] === 'mine' && parts[2] === 'edit') return <OwnedDiaryEditor key={id} diary={diary} profile={state.profile} onBack={() => navigate(`/diary/mine/${encodeURIComponent(id)}`)} onSaved={(saved) => { navigate(`/diary/mine/${encodeURIComponent(saved.id)}`, { replace: true }); showToast('일기를 수정했어요') }} />
  if (parts[0] === 'mine' && diary) return <OwnedDiaryDetail diary={diary} onBack={() => navigate('/diary/mine')} onMenu={menu} />
  return <Navigate to="/diary/mine" replace />
}
