import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import RewardCard from '../../components/mypage/RewardCard.jsx'
import { fetchStampRewards } from '../../components/mypage/mypageApi.js'
import './StampRewardsPage.css'

/**
 * 7-8 수집 보상. 우표를 모은 개수에 따라 받는 보상 4개와 받았는지·얼마나 모았는지를 보여 준다.
 * 데이터는 mock이다(문서 레포에 우표·보상 API가 없다). 요청과 변환은 components/mypage에서 한다.
 * 가정: 모은 우표 수는 7-4와 같은 기준(업적 우표 개수)이라 시안의 "6개"가 아니라 "5개"로 나온다.
 * 개발 중 확인용: 주소 뒤에 ?mock=empty 를 붙이면 우표가 0개인 상태가 나온다.
 */
function StampRewardsPage() {
  const [searchParams] = useSearchParams()
  const forceEmpty = import.meta.env.DEV && searchParams.get('mock') === 'empty'
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchStampRewards({ empty: forceEmpty }).then((result) => {
      if (!cancelled) setData(result)
    })
    return () => {
      cancelled = true
    }
  }, [forceEmpty])

  return (
    <main className="stamp-rewards">
      <Header title="수집 보상" />

      <div className="stamp-rewards__body">
        {data ? (
          <>
            <div className="stamp-rewards__summary">
              <h2 className="stamp-rewards__title">{data.title}</h2>
              {data.nextLabel && <p className="stamp-rewards__next">{data.nextLabel}</p>}
            </div>
            <ul className="stamp-rewards__list">
              {data.rewards.map((reward) => (
                <li key={reward.id}>
                  <RewardCard reward={reward} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <ul className="stamp-rewards__list" aria-busy="true">
            {[0, 1, 2, 3].map((n) => (
              <li key={n}>
                <Skeleton height={120} radius={22} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

export default StampRewardsPage
