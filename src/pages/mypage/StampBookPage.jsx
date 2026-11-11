import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Button from '../../shared/ui/Button.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import StampTabs from '../../components/mypage/StampTabs.jsx'
import StampGrid from '../../components/mypage/StampGrid.jsx'
import NextRewardCard from '../../components/mypage/NextRewardCard.jsx'
import StampDetailSheet from '../../components/mypage/StampDetailSheet.jsx'
import { DecorationGuide, FirstStampGuide } from '../../components/mypage/StampGuide.jsx'
import { fetchStampCollection } from '../../components/mypage/mypageApi.js'
import { MYPAGE_PATHS } from '../../components/mypage/mypagePaths.js'
import './StampBookPage.css'

const TAB_OPTIONS = [
  { id: 'achievement', label: '업적 우표' },
  { id: 'decoration', label: '꾸미기 우표' },
]

/**
 * 7-4 업적 우표 · 7-5 꾸미기 우표 · 7-6 우표 0개. 탭으로 업적/꾸미기를 바꿔 본다.
 * 데이터는 mock이다(문서 레포에 우표 목록·보상 API가 없다). 요청과 변환은 components/mypage에서 한다.
 * 가정:
 *  - 탭은 화면 상태로만 두고 주소에는 넣지 않았다.
 *  - 꾸미기 탭의 아래 버튼은 시안이 없어서, 업적 탭과 같은 "보상 모아보기"로 두었다.
 *  - 가진 우표를 누르면 바텀시트(7-7)가 열린다. 가지지 못한 우표는 누를 수 없다. (시안에 잠긴 우표를 눌렀을 때 화면이 없다)
 *  - 시트의 "이 우표 붙여서 편지 쓰기"는 /letter-write?stampId=… 로 이동한다. stampId 쿼리는 채현님과 합의 전이다.
 * 개발 중 확인용: 주소 뒤에 ?mock=empty 를 붙이면 우표가 0개인 7-6 화면이 나온다.
 */
function StampBookPage() {
  const navigate = useNavigate()
  const { openSheet } = useOverlay()
  const [searchParams] = useSearchParams()
  const forceEmpty = import.meta.env.DEV && searchParams.get('mock') === 'empty'

  const [tab, setTab] = useState('achievement')
  const [collection, setCollection] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchStampCollection({ empty: forceEmpty }).then((result) => {
      if (!cancelled) setCollection(result)
    })
    return () => {
      cancelled = true
    }
  }, [forceEmpty])

  const achievement = collection?.achievement
  // 시트의 "(5 / 10)" 문구에 쓰는 수집 보상 진행
  const rewardProgress = achievement?.nextReward
    ? { current: achievement.nextReward.current, target: achievement.nextReward.target }
    : null

  const openStampDetail = (stampId) => {
    openSheet({
      content: ({ close }) => (
        <StampDetailSheet
          stampId={stampId}
          progress={rewardProgress}
          onWriteLetter={(path) => {
            close()
            navigate(path)
          }}
        />
      ),
    })
  }
  const decoration = collection?.decoration
  const showFirstStampGuide = tab === 'achievement' && achievement?.isEmpty

  return (
    <main className="stamp-book">
      <Header title="우표첩" />

      <div className="stamp-book__body">
        <StampTabs options={TAB_OPTIONS} value={tab} onChange={setTab} />

        {!collection && (
          <div className="stamp-book__loading" aria-busy="true">
            <Skeleton height={27} width="40%" radius={8} />
            <Skeleton height={64} radius={20} />
            <Skeleton height={290} radius={20} />
          </div>
        )}

        {achievement && tab === 'achievement' && (
          <>
            <h2 className="stamp-book__title">{achievement.title}</h2>
            <p className="stamp-book__subtitle">{achievement.subtitle}</p>
            {achievement.nextReward && (
              <div className="stamp-book__card">
                <NextRewardCard reward={achievement.nextReward} />
              </div>
            )}
            <div className="stamp-book__grid stamp-book__grid--achievement">
              <StampGrid stamps={achievement.stamps} spacing="compact" onSelect={openStampDetail} />
            </div>
            {achievement.receivedLabel && <p className="stamp-book__note">{achievement.receivedLabel}</p>}
          </>
        )}

        {decoration && tab === 'decoration' && (
          <>
            <h2 className="stamp-book__title">{decoration.title}</h2>
            <p className="stamp-book__subtitle">{decoration.subtitle}</p>
            <div className="stamp-book__card">
              <DecorationGuide />
            </div>
            <div className="stamp-book__grid stamp-book__grid--decoration">
              <StampGrid stamps={decoration.stamps} spacing="roomy" onSelect={openStampDetail} />
            </div>
            <p className="stamp-book__note stamp-book__note--far">꾸미기 우표도 수집 보상 개수에 포함돼요</p>
          </>
        )}

        {showFirstStampGuide && (
          <div className="stamp-book__first">
            <FirstStampGuide />
          </div>
        )}
      </div>

      <footer className="stamp-book__footer">
        {showFirstStampGuide ? (
          <Button onClick={() => navigate(MYPAGE_PATHS.diaryWrite)}>첫 일기 쓰러 가기</Button>
        ) : (
          <Button variant="secondary" onClick={() => navigate(MYPAGE_PATHS.stampRewards)}>
            보상 모아보기
          </Button>
        )}
      </footer>
    </main>
  )
}

export default StampBookPage
