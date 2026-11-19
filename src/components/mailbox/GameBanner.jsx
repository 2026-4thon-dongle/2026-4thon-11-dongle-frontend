import { Link } from 'react-router-dom'
import Icon from '../../shared/ui/Icon.jsx'
import './GameBanner.css'

/**
 * 배송 중 탭 아래 배달 게임 안내(5-5). 누르면 직접 배달하기 게임(다른 담당 화면)으로 간다.
 * 경로 /delivery-game 은 letterRoutes에 있는 임시 경로이다(가정).
 */
function GameBanner({ to = '/delivery-game' }) {
  return (
    <Link to={to} state={{ from: 'mailbox' }} className="game-banner">
      <Icon name="game" size={24} />
      <span className="game-banner__text">배달 게임으로 도착 시간을 줄여보세요</span>
    </Link>
  )
}

export default GameBanner
