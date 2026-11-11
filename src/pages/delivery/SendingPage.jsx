import { useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import StampingScene from '../../components/delivery/StampingScene.jsx'
import { MOCK_DELIVERY } from '../../components/delivery/data.js'

/**
 * 4-10 발송 연출: 도장 찍는 장면이 끝나면 발송 완료(4-11)로 넘어간다.
 * 우표는 우표 선택(4-7)에서 location state로 받는다. 직접 들어오면 기본 우표를 쓴다.
 * 소인 지역은 mock이다(편지 보내기 API가 정해지면 보낸 편지 정보에서 가져온다).
 */
function SendingPage() {
  const navigate = useNavigate()
  const { letterId } = useParams()
  const { state } = useLocation()

  const handleDone = useCallback(() => {
    navigate(`/delivery/${letterId}/done`, { replace: true })
  }, [navigate, letterId])

  return <StampingScene stampId={state?.stampId} place={MOCK_DELIVERY.from.split(' ')[0]} onDone={handleDone} />
}

export default SendingPage
