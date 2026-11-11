import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import BlockedUserCard from '../../components/mypage/BlockedUserCard.jsx'
import { fetchBlocks, unblock } from '../../components/mypage/mypageApi.js'
import './BlocksPage.css'

/**
 * 7-12 차단 목록. 차단한 사람과 "해제" 버튼.
 * 데이터는 mock이다. 문서 레포 명세(api/safety.md GET /api/blocks/, DELETE /api/blocks/{user_id}/)의 응답 모양을 따르지만 실제 API는 부르지 않는다.
 * mock 전용: 지역("경북 경주") — 명세에 user{id, nickname}과 created_at만 있다.
 * 가정:
 *  - 설정 화면으로 들어오는 길이 시안에 없어서 /mypage/blocks 주소로 직접 연다.
 *  - 시안에 해제 확인이 없어서 "해제"를 누르면 바로 해제하고 토스트만 보여 준다. 토스트 문구도 시안에 없어서 정했다.
 *  - 차단한 사람이 없을 때 화면이 시안에 없다. 안내 문구만 남기고 목록은 비운다.
 * 개발 중 확인용: 주소 뒤에 ?mock=empty 를 붙이면 차단한 사람이 없는 상태가 나온다.
 */
function BlocksPage() {
  const { showToast } = useOverlay()
  const [searchParams] = useSearchParams()
  const forceEmpty = import.meta.env.DEV && searchParams.get('mock') === 'empty'
  const [users, setUsers] = useState(null)

  useEffect(() => {
    fetchBlocks({ empty: forceEmpty }).then(setUsers)
  }, [forceEmpty])

  const handleUnblock = async (userId) => {
    await unblock(userId)
    setUsers((current) => current.filter((user) => user.userId !== userId))
    showToast('차단을 해제했어요')
  }

  return (
    <main className="blocks-page">
      <Header title="차단 목록" />

      <div className="blocks-page__body">
        <p className="blocks-page__notice">
          <Icon name="ban" size={24} />
          차단을 해제해도 상대에게 알림이 가지 않아요
        </p>

        <ul className="blocks-page__list" aria-busy={users === null}>
          {users === null
            ? [0, 1].map((n) => (
                <li key={n}>
                  <Skeleton height={72} radius={22} />
                </li>
              ))
            : users.map((user) => (
                <li key={user.userId}>
                  <BlockedUserCard user={user} onUnblock={handleUnblock} />
                </li>
              ))}
        </ul>

        <p className="blocks-page__footnote">차단한 사람의 일기와 편지는 서로 보이지 않아요</p>
      </div>
    </main>
  )
}

export default BlocksPage
