import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import PenPalCard from '../../components/pen-pal/PenPalCard.jsx'
import { fetchPenPals } from '../../components/pen-pal/penPalApi.js'
import './PenPalPage.css'

/**
 * 5-14 펜팔 친구. 편지를 여러 번 주고받은 상대 목록. 친구를 누르면 5-15(/pen-pal/:friendId)로 간다.
 * 데이터는 mock이다(문서 레포에 편지·펜팔 API가 없다). 요청과 변환은 components/pen-pal에서 한다.
 * 가정:
 *  - 경로는 /pen-pal 이다. 마이(7-1)의 "펜팔 친구" 줄이 이 경로로 연결한다.
 *  - 펜팔 기준(3번 이상 주고받음이 편지 3통인지 왕복 3회인지)은 정해지지 않았다. mock에서는 편지 3통으로 두었다.
 *  - 친구가 없을 때 화면이 시안에 없어서 안내 문구만 보여 준다.
 * 개발 중 확인용: 주소 뒤에 ?mock=empty 를 붙이면 펜팔 친구가 없는 상태가 나온다.
 */
function PenPalPage() {
  const [searchParams] = useSearchParams()
  const forceEmpty = import.meta.env.DEV && searchParams.get('mock') === 'empty'
  const [friends, setFriends] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchPenPals({ empty: forceEmpty }).then((result) => {
      if (!cancelled) setFriends(result)
    })
    return () => {
      cancelled = true
    }
  }, [forceEmpty])

  return (
    <main className="pen-pal-page">
      <Header title="펜팔 친구" />

      <div className="pen-pal-page__body">
        <p className="pen-pal-page__notice">
          <Mascot pose="smile" size={44} />
          <span>
            편지를 3번 이상 주고받으면
            <br />
            펜팔 친구가 돼요
          </span>
        </p>

        {friends === null && (
          <ul className="pen-pal-page__list" aria-busy="true">
            {[0, 1, 2].map((n) => (
              <li key={n}>
                <Skeleton height={80} radius={24} />
              </li>
            ))}
          </ul>
        )}

        {friends !== null && friends.length > 0 && (
          <ul className="pen-pal-page__list">
            {friends.map((friend) => (
              <li key={friend.id}>
                <PenPalCard friend={friend} />
              </li>
            ))}
          </ul>
        )}

        {friends !== null && friends.length === 0 && (
          <p className="pen-pal-page__empty">아직 펜팔 친구가 없어요</p>
        )}
      </div>
    </main>
  )
}

export default PenPalPage
