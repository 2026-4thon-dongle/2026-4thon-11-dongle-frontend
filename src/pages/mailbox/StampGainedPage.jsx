import { useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { isApiDemo } from '../../shared/api/client.js'
import Button from '../../shared/ui/Button.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import CelebrationFrame from '../../components/mailbox/CelebrationFrame.jsx'
import StampGainScene from '../../components/mailbox/StampGainScene.jsx'
import useStampGain from '../../components/mailbox/useStampGain.js'
import { demoStampGainInput } from '../../components/mailbox/stampRewardApi.js'
import { CHATTING_TARGET } from '../../components/mailbox/stampRewardMapper.js'
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
 * 5-12 우표 획득. 편지를 보내거나 주고받아 새 우표(예: 「첫 왕복」)를 받았을 때 보여 주는 화면이다.
 * 받는 입력(라우터 state): 발송 응답(POST /api/letters/)의 값을 그대로 옮긴다.
 *   navigate('/mailbox/stamp-gained', { state: { grantedStamps: letter.granted_stamps, unlockedRewards: letter.unlocked_rewards } })
 *   - grantedStamps   [{ code, number, name, description }] 새로 받은 우표. 비면 아무것도 보여 줄 게 없다.
 *   - returnTo        선택. 읽던 화면 경로(예: /mailbox/12). 있으면 "확인"이 5-3 대신 그곳으로 돌아온다(보상이 열렸으면 5-13의 "확인"이 돌아온다). 5-9 봉투 열기에서 「첫 왕복」을 받을 때 쓴다.
 *   - unlockedRewards [{ code, ... }] 새로 열린 수집 보상. 있으면 "확인"이 5-13(/mailbox/reward-unlocked?code=)으로 이어진다.
 *   모은 우표 개수("모은 우표 6개 · 보상까지 4개")만 GET /api/stamps/ 로 받는다. 요청과 변환은 components/mailbox에서 한다.
 * 서버가 실패하면 오류 화면과 "다시 시도"를 보여 준다. 입력이 없으면(주소로 직접 연 경우) 안내와 우체통 버튼을 보여 준다.
 * 가정:
 *  - 이 화면을 여는 곳(DonePage 등 편지 쓰기 쪽)은 채현님 영역이라 이 PR에서는 연결하지 않았다. 위 계약대로 열면 된다.
 *  - "우표첩 보기"(흰 버튼)는 /mypage/stamps 로, "확인"은 보상이 열렸으면 5-13, 아니면 5-3 대화 중 탭(/mailbox, state.tab = 'chatting')으로 간다. 5-13의 "확인"이 5-3으로 간다.
 * 개발 중 확인용(VITE_API_MOCK=true, state 없이 주소로 열 때만): /mailbox/stamp-gained, ?unlock=3 을 붙이면 "확인"이 5-13으로 이어진다.
 */
function StampGainedPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const unlock = Number(searchParams.get('unlock')) || null
  // 같은 입력이면 같은 객체여야 다시 요청하지 않는다. state는 이동할 때마다 한 번 만들어진 객체이다.
  const input = useMemo(() => state ?? (isApiDemo ? demoStampGainInput(unlock) : null), [state, unlock])
  const { loading, gain, error, reload } = useStampGain(input)

  if (error) {
    return <ErrorScreen description={error.message} hint="" onRetry={reload} />
  }

  if (loading) {
    return (
      <main className="stamp-gained">
        <div className="stamp-gained__loading" aria-busy="true">
          <Skeleton height={40} width="60%" radius={12} />
          <Skeleton height={220} radius={24} />
        </div>
      </main>
    )
  }

  if (!gain) {
    return (
      <main className="stamp-gained">
        <p className="stamp-gained__missing">새로 받은 우표가 없어요</p>
        <div className="stamp-gained__back">
          <Button variant="ghost" onClick={() => navigate(CHATTING_TARGET.path, { state: CHATTING_TARGET.state })}>
            우체통으로
          </Button>
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
            <Button variant="ghost" onClick={() => navigate(gain.stampBookTarget.path)}>
              우표첩 보기
            </Button>
            <Button onClick={() => navigate(gain.confirmTarget.path, { state: gain.confirmTarget.state, replace: gain.confirmTarget.replace })}>
              확인</Button>
          </>
        }
      >
        <StampGainScene stampId={gain.stampId} stampName={gain.stampName} progressLabel={gain.progressLabel} />
      </CelebrationFrame>
    </main>
  )
}

export default StampGainedPage
