import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import { MOCK_STAMPS } from '../../shared/mocks/stamps.js'
import { MOCK_DELIVERY, MOCK_EARNED_STAMP_ID } from '../../components/delivery/data.js'
import useArrivalCountdown, { formatRemaining } from '../../components/delivery/useArrivalCountdown.js'
import './DonePage.css'

/** 4-11 발송 완료: 편지가 출발했고 도착까지 얼마나 남았는지 보여준다. */
function DonePage() {
  const navigate = useNavigate()
  const { letterId } = useParams()
  const { showToast } = useOverlay()
  const { from, to, totalMinutes, elapsedMinutes } = MOCK_DELIVERY
  const { remainingMinutes, progress } = useArrivalCountdown({ totalMinutes, elapsedMinutes })
  const earned = MOCK_STAMPS.find((stamp) => stamp.id === MOCK_EARNED_STAMP_ID)

  return (
    <main className="done-page">
      {/* 새로 받은 우표 알림: 잠깐 보였다가 사라진다. mock: 획득 API가 정해지면 받은 우표가 있을 때만 보여준다. */}
      {earned && (
        <div className="done-page__earned" role="status">
          <Stamp id={earned.id} size={28} />
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
