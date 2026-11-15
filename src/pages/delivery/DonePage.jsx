import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import { MOCK_DELIVERY, MOCK_EARNED_STAMP_ID } from '../../components/delivery/data.js'
import useArrivalCountdown, { formatRemaining } from '../../components/delivery/useArrivalCountdown.js'
import useDeliveryInfo from '../../components/delivery/useDeliveryInfo.js'
import './DonePage.css'

// 서버에서 받지 못했을 때(서버 없이 화면만 볼 때) 보여 주는 mock 배송 정보
function mockInfo() {
  const sentAt = Date.now() - MOCK_DELIVERY.elapsedMinutes * 60_000
  return {
    from: MOCK_DELIVERY.from,
    to: MOCK_DELIVERY.to,
    recipient: MOCK_DELIVERY.recipient,
    sentAt: new Date(sentAt).toISOString(),
    arrivesAt: new Date(sentAt + MOCK_DELIVERY.totalMinutes * 60_000).toISOString(),
    direction: 'sent',
    mapTheme: null,
    towns: [],
    grantedStamps: [{ code: MOCK_EARNED_STAMP_ID, name: '첫 편지' }],
  }
}

/**
 * 4-11 발송 완료: 편지가 출발했고 도착까지 얼마나 남았는지 보여준다.
 * 발송 직후에는 편지 보내기 응답(location state의 letter)으로, 새로고침 등으로 없으면 배송 경로 API로 보여 준다.
 */
function DonePage() {
  const { letterId } = useParams()
  const { state } = useLocation()
  const { info } = useDeliveryInfo({ letterId, letter: state?.letter, fallback: mockInfo })
  if (!info) return null
  return <DoneView info={info} letterId={letterId} />
}

function DoneView({ info, letterId }) {
  const navigate = useNavigate()
  const { showToast } = useOverlay()
  const { from, to, sentAt, arrivesAt } = info
  const { remainingMinutes, progress } = useArrivalCountdown({ sentAt, arrivesAt })
  // 새로 받은 우표: 첫 편지를 보내는 등 우표를 받았을 때만 알린다. 여러 장이면 첫 장을 보여 준다.
  const earned = info.grantedStamps[0]

  return (
    <main className="done-page">
      {/* 새로 받은 우표 알림: 잠깐 보였다가 사라진다. */}
      {earned && (
        <div className="done-page__earned" role="status">
          <Stamp id={earned.code} size={28} />
          <p className="done-page__earned-text">「{earned.name}」 우표를 받았어요!</p>
        </div>
      )}

      <div className="done-page__hero">
        <Mascot pose="greeting" size={138.67} />
      </div>
      <h1 className="done-page__title">편지가 출발했어요!</h1>

      <section className="done-page__card" aria-label="배송 현황">
        <div className="done-page__places">
          <span>{from}</span>
          <span>{to}</span>
        </div>
        <div className="done-page__track">
          <div className="done-page__fill" style={{ '--progress': progress }} />
          <span className="done-page__rider" style={{ '--progress': progress }}>
            <Mascot pose="face" size={34} />
          </span>
        </div>
        <p className="done-page__remaining">도착까지 {formatRemaining(remainingMinutes)}</p>
        <p className="done-page__notice">도착하면 알림으로 알려드려요</p>
      </section>

      {/* 직접 배달하기(→ 9-1, 보류): 자리만 두고 동작은 아직 연결하지 않는다. */}
      <button type="button" className="done-page__game" onClick={() => showToast('직접 배달하기는 준비 중이에요')}>
        <Mascot pose="face" size={54} />
        <span className="done-page__game-text">
          <span className="done-page__game-caption">기다리기 심심하다면?</span>
          <span className="done-page__game-title">고향이랑 직접 배달하기</span>
        </span>
        <Icon name="chevron" size={22} className="done-page__game-chevron" />
      </button>

      <div className="done-page__actions">
        <Button variant="ghost" onClick={() => navigate('/home')}>
          홈으로
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/delivery/${letterId}/map`)}>
          배송 지도 보기
        </Button>
      </div>
    </main>
  )
}

export default DonePage
