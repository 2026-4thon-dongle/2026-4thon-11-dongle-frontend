import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import DraftCard from '../../components/mypage/DraftCard.jsx'
import LoadError from '../../components/mypage/LoadError.jsx'
import useLoad from '../../components/mypage/useLoad.js'
import { fetchDrafts, deleteDraft } from '../../components/mypage/mypageApi.js'
import './DraftsPage.css'

/**
 * 7-3 임시저장한 편지. 목록은 서버(GET /api/letters/drafts/)에서 오고 삭제는 DELETE /api/letters/drafts/{id}/이다. 삭제가 실패하면 목록은 그대로 두고 토스트로 알린다.
 * 가정: 시안에 삭제 확인과 빈 목록 화면이 없어서, 휴지통을 누르면 바로 지우고 토스트만 보여 준다. 비면 안내 박스만 남는다.
 */
function DraftsPage() {
  const { showToast } = useOverlay()
  const { data: drafts, error, reload, setData: setDrafts } = useLoad(fetchDrafts)

  const handleDelete = async (id) => {
    try {
      await deleteDraft(id)
    } catch (deleteError) {
      showToast(deleteError.message)
      return
    }
    setDrafts((current) => current.filter((draft) => draft.id !== id))
    showToast('임시저장한 편지를 삭제했어요')
  }

  if (error) return <LoadError error={error} onRetry={reload} />

  return (
    <main className="drafts-page">
      <Header title="임시저장한 편지" />

      <div className="drafts-page__body">
        <p className="drafts-page__notice">
          <Icon name="pencil" size={22} />
          쓰다가 멈춘 편지를 여기서 이어 쓸 수 있어요
        </p>

        <ul className="drafts-page__list" aria-busy={drafts === null}>
          {drafts === null
            ? [0, 1].map((n) => (
                <li key={n}>
                  <Skeleton height={160} radius={22} />
                </li>
              ))
            : drafts.map((draft) => (
                <li key={draft.id}>
                  <DraftCard draft={draft} onDelete={handleDelete} />
                </li>
              ))}
        </ul>
      </div>
    </main>
  )
}

export default DraftsPage
