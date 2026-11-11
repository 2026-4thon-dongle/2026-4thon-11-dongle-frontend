import { useEffect, useState } from 'react'
import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import DraftCard from '../../components/mypage/DraftCard.jsx'
import { fetchDrafts, deleteDraft } from '../../components/mypage/mypageApi.js'
import './DraftsPage.css'

/**
 * 7-3 임시저장한 편지. 목록은 mock이다(임시저장 저장 방식이 미정이고 문서 레포 API도 없다).
 * 가정: 시안에 삭제 확인과 빈 목록 화면이 없어서, 휴지통을 누르면 바로 지우고 토스트만 보여 준다. 비면 안내 박스만 남는다.
 */
function DraftsPage() {
  const { showToast } = useOverlay()
  const [drafts, setDrafts] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchDrafts().then((result) => {
      if (!cancelled) setDrafts(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async (id) => {
    await deleteDraft(id)
    setDrafts((current) => current.filter((draft) => draft.id !== id))
    showToast('임시저장한 편지를 삭제했어요')
  }

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
