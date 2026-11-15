import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import CelebrationFrame from '../../components/mailbox/CelebrationFrame.jsx'
import RewardPreview from '../../components/mailbox/RewardPreview.jsx'
import { fetchRewardUnlock, resolveTryTarget } from '../../components/mailbox/stampRewardApi.js'
import './RewardUnlockedPage.css'

// 시안 5-13은 우표 3개 보상이다. 주소에 threshold가 없으면 3으로 본다.
const DEFAULT_THRESHOLD = 3

// "스티커 써보기"를 눌렀을 때 토스트. 시안에 없어서 정한 문구이다.
const TRY_TOAST = '답장할 때 서명 단계에서 붙여보세요'

// 꾸밈 점(시안 left, top, 지름, 색). 5-13에는 배경 큰 원이 없다.
const DOTS = [
  { x: 40, y: 110, size: 12, color: 'var(--brand-orange)' },
  { x: 300, y: 140, size: 10, color: 'var(--brand-sage)' },
  { x: 70, y: 360, size: 14, color: 'var(--brand-sky)' },
  { x: 290, y: 380, size: 9, color: 'var(--brand-berry)' },
  { x: 170, y: 96, size: 16, color: 'var(--bg-peach)' },
]

/**
 * 5-13 보상 해금. 우표를 모은 개수가 기준(3, 5, 10, 15개)에 닿아 수집 보상이 열렸을 때 보여 주는 화면이다.
 * 데이터는 mock이다(문서 레포에 우표·보상 API가 없다). 요청과 변환은 components/mailbox에서 한다.
 * 가정:
 *  - 언제 뜨는지가 정해지지 않았다(5-12 다음이라는 흐름만 있다). 어디서도 이 화면으로 보내지 않고, 주소로 직접 연다.
 *    다만 5-12에서 보상이 열렸다고 하면(`?unlock=3`) "확인"이 이 화면으로 이어진다.
 *  - 보조 버튼("스티커 써보기")은 토스트("답장할 때 서명 단계에서 붙여보세요")를 보여 주고 5-1 새 편지 탭으로 간다.
 *    받은 새 편지가 없으면 3-1 홈(/home)으로 간다. 새 편지가 있는지는 mock 목록 기준이다(stampRewardApi.resolveTryTarget).
 *  - "확인"은 5-3 대화 중 탭(/mailbox, state.tab = 'chatting')으로 간다.
 * 개발 중 확인용 주소: /mailbox/reward-unlocked (3개), ?threshold=5, ?threshold=10, ?threshold=15
 */
function RewardUnlockedPage() {
  const navigate = useNavigate()
  const { showToast } = useOverlay()
  const [searchParams] = useSearchParams()
  const threshold = Number(searchParams.get('threshold')) || DEFAULT_THRESHOLD
  // undefined: 불러오는 중, null: 해당하는 보상 없음
  const [reward, setReward] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    fetchRewardUnlock(threshold).then((result) => {
      if (!cancelled) setReward(result)
    })
    return () => {
      cancelled = true
    }
  }, [threshold])

  const handleTry = async () => {
    const target = await resolveTryTarget()
    showToast(TRY_TOAST)
    navigate(target.path, { state: target.state })
  }

  if (reward === undefined) {
    return (
      <main className="reward-unlocked">
        <div className="reward-unlocked__loading" aria-busy="true">
          <Skeleton height={40} width="60%" radius={12} />
          <Skeleton height={200} radius={28} />
        </div>
      </main>
    )
  }

  if (reward === null) {
    return (
      <main className="reward-unlocked">
        <p className="reward-unlocked__missing">열린 보상을 찾을 수 없어요</p>
      </main>
    )
  }

  return (
    <main className="reward-unlocked">
      <CelebrationFrame
        title={reward.title}
        titleTop={104}
        dots={DOTS}
        description={reward.subtitle}
        actions={
          <>
            <Button variant="ghost" onClick={handleTry}>
              {reward.tryLabel}
            </Button>
            <Button onClick={() => navigate(reward.confirmTarget.path, { state: reward.confirmTarget.state })}>확인</Button>
          </>
        }
      >
        <div className="reward-unlocked__card">
          <RewardPreview kind={reward.rewardKind} name={reward.rewardName} />
        </div>
        <p className="reward-unlocked__pill">{reward.rewardLabel}</p>
        <p className="reward-unlocked__usage">{reward.usage}</p>

        {reward.next && (
          <div className="reward-unlocked__next">
            <div className="reward-unlocked__track">
              <div className="reward-unlocked__fill" style={{ width: `${reward.next.ratio * 100}%` }} />
            </div>
            <p className="reward-unlocked__next-label">{reward.next.label}</p>
          </div>
        )}
      </CelebrationFrame>
    </main>
  )
}

export default RewardUnlockedPage
