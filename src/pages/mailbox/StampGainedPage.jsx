import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import CelebrationFrame from '../../components/mailbox/CelebrationFrame.jsx'
import StampGainScene from '../../components/mailbox/StampGainScene.jsx'
import { fetchStampGain } from '../../components/mailbox/stampRewardApi.js'
import './StampGainedPage.css'

// 꾸밈 점(시안 left, top, 지름, 색)
const DOTS = [
  { x: 46, y: 130, size: 12, color: 'var(--brand-orange)' },
  { x: 300, y: 150, size: 10, color: 'var(--brand-sage)' },
  { x: 64, y: 330, size: 14, color: 'var(--brand-sky)' },
  { x: 290, y: 360, size: 9, color: 'var(--brand-berry)' },
  { x: 170, y: 96, size: 16, color: 'var(--bg-peach)' },
  { x: 250, y: 280, size: 8, color: 'var(--brand-orange)' },
]

/**
 * 5-12 우표 획득. 편지를 주고받아 새 우표(예: 「첫 왕복」)를 받았을 때 보여 주는 화면이다.
 * 데이터는 mock이다(문서 레포에 우표·보상 API가 없다). 요청과 변환은 components/mailbox에서 한다.
 * 가정:
 *  - 언제 뜨는지가 정해지지 않았다(답장 발송 직후라는 흐름만 있고, 4-10, 4-11과의 순서는 채현님과 확인 전).
 *    그래서 어디서도 이 화면으로 보내지 않고, 주소(/mailbox/stamp-gained)로 직접 연다.
 *  - "우표첩 보기"는 /mypage/stamps 로, "확인"은 우체통(/mailbox)으로 간다.
 *    이번에 보상이 열렸으면 "확인"이 보상 해금(5-13)으로 이어진다.
 * 개발 중 확인용: 주소 뒤에 ?unlock=3 을 붙이면 "확인"이 5-13(/mailbox/reward-unlocked?threshold=3)으로 이어진다.
 */
function StampGainedPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const unlock = Number(searchParams.get('unlock'))
  const unlockThreshold = import.meta.env.DEV && Number.isFinite(unlock) && unlock > 0 ? unlock : null
  const [gain, setGain] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchStampGain({ unlockThreshold }).then((result) => {
      if (!cancelled) setGain(result)
    })
    return () => {
      cancelled = true
    }
  }, [unlockThreshold])

  if (!gain) {
    return (
      <main className="stamp-gained">
        <div className="stamp-gained__loading" aria-busy="true">
          <Skeleton height={40} width="60%" radius={12} />
          <Skeleton height={220} radius={24} />
        </div>
      </main>
    )
  }

  return (
    <main className="stamp-gained">
      <CelebrationFrame
        title={gain.title}
        titleTop={96}
        hill
        dots={DOTS}
        description={gain.descLines.map((line) => (
          <span key={line} className="stamp-gained__line">
            {line}
          </span>
        ))}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(gain.stampBookPath)}>
              우표첩 보기
            </Button>
            <Button onClick={() => navigate(gain.confirmPath)}>확인</Button>
          </>
        }
      >
        <StampGainScene stampId={gain.stampId} stampName={gain.stampName} progressLabel={gain.progressLabel} />
      </CelebrationFrame>
    </main>
  )
}

export default StampGainedPage
