import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import CelebrationFrame from '../../components/mailbox/CelebrationFrame.jsx'
import RewardPreview from '../../components/mailbox/RewardPreview.jsx'
import useRewardUnlock from '../../components/mailbox/useRewardUnlock.js'
import { markRewardSeen, resolveTryTarget } from '../../components/mailbox/stampRewardApi.js'
import { CHATTING_TARGET, safeReturnTo } from '../../components/mailbox/stampRewardMapper.js'
import './RewardUnlockedPage.css'

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
 * 서버 연동: GET /api/stamps/rewards/ 로 보상을 받고, 확인하면 POST /api/stamps/rewards/{code}/seen/ 을 보낸다(api/stamps.md). 요청과 변환은 components/mailbox에서 한다.
 * 받는 입력(주소 쿼리):
 *  - `?code=stickers-cat` 보상 code. 가장 정확하다.
 *  - `?threshold=3` 기준 개수(3, 5, 10, 15). 5-12의 "확인"이 이 값으로 넘긴다.
 *  - 둘 다 없으면 서버에서 열렸고 아직 확인하지 않은(unlocked && !seen) 첫 보상을 보여 준다. 없으면 "새로 열린 보상이 없어요"를 보여 준다.
 * 가정:
 *  - 이 화면으로 오는 길은 둘이다: 5-12의 "확인"(발송 응답에 unlocked_rewards가 있을 때, ?code=)과 마이 수집 보상(7-8)에서 이미 열린 보상을 누를 때(?code=). 앱을 열 때 자동으로 조회하지는 않는다.
 *  - "확인"과 보조 버튼("스티커 써보기")은 둘 다 화면을 떠나므로 아직 확인 전이면 seen을 먼저 보낸다. seen이 실패하면 이동하지 않고 토스트를 보여 준다.
 *  - 보조 버튼은 토스트("답장할 때 서명 단계에서 붙여보세요")를 보여 주고 5-1 새 편지 탭으로 간다. 받은 새 편지가 없으면 3-1 홈(/home)으로 간다. 새 편지가 있는지는 GET /api/mailbox/summary/의 new_count로 본다.
 *  - "확인"은 5-3 대화 중 탭(/mailbox, state.tab = 'chatting')으로 간다.
 * 개발 중 확인용(VITE_API_MOCK=true): /mailbox/reward-unlocked, ?threshold=5, ?threshold=10, ?threshold=15
 */
function RewardUnlockedPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // 5-12에서 returnTo를 받았으면 "확인"은 읽던 편지로 돌아간다(5-9 봉투 열기에서 온 경우). 없으면 5-3.
  const returnTo = safeReturnTo(location.state?.returnTo)
  const { showToast } = useOverlay()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const threshold = Number(searchParams.get('threshold')) || null
  const { loading, reward, error, reload } = useRewardUnlock({ code, threshold })
  const [busy, setBusy] = useState(false)

  // 화면을 떠나기 전에 아직 확인 전인 보상이면 seen을 보낸다. 실패하면 이동하지 않고 토스트를 보여 준다.
  const leave = async (resolveTarget, toast) => {
    if (busy) return
    setBusy(true)
    try {
      if (reward.needsSeen) await markRewardSeen(reward.code)
      const target = await resolveTarget()
      if (toast) showToast(toast)
      navigate(target.path, { state: target.state, replace: target.replace })
    } catch (reason) {
      showToast(reason?.message ?? '잠시 후 다시 시도해 주세요')
      setBusy(false)
    }
  }

  const handleTry = () => leave(resolveTryTarget, TRY_TOAST)
  const handleConfirm = () => leave(async () => (returnTo ? { path: returnTo, replace: true } : reward.confirmTarget))

  if (error) {
    return <ErrorScreen description={error.message} hint="" onRetry={reload} />
  }

  if (loading) {
    return (
      <main className="reward-unlocked">
        <div className="reward-unlocked__loading" aria-busy="true">
          <Skeleton height={40} width="60%" radius={12} />
          <Skeleton height={200} radius={28} />
        </div>
      </main>
    )
  }

  if (!reward) {
    return (
      <main className="reward-unlocked">
        <p className="reward-unlocked__missing">새로 열린 보상이 없어요</p>
        <Button variant="ghost" onClick={() => navigate(CHATTING_TARGET.path, { state: CHATTING_TARGET.state })}>
          우체통으로
        </Button>
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
            <Button variant="ghost" onClick={handleTry} disabled={busy}>
              {reward.tryLabel}
            </Button>
            <Button onClick={handleConfirm} disabled={busy}>
              확인
            </Button>
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
