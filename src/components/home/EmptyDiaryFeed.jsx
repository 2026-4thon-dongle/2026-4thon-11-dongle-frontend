import { Link } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import circle from '../../shared/assets/reading/empty-circle.svg'

/** @param {{region: string, onAll: () => void}} props */
export default function EmptyDiaryFeed({ region, onAll }) {
  return <section className="reading-empty" aria-label="일기가 없는 피드"><div className="reading-empty-scene"><img src={circle} alt="" /><Mascot pose="sleepy" size={120} alt="잠시 쉬고 있는 고향이" /></div><h2 className="text-title-20">아직 {region}에서 온 일기가 없어요</h2><p className="text-body-13">내 동네 일기를 먼저 써보면<br />고향 사람들도 하나둘 찾아올 거예요</p><div className="reading-empty-actions"><Button variant="secondary" onClick={onAll}>전체 타지 일기 보기</Button><Link className="ui-button ui-button--primary" to="/diary/write">내 동네 일기 쓰기</Link></div></section>
}
