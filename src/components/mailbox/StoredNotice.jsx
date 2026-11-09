import Mascot from '../../shared/ui/Mascot.jsx'
import './StoredNotice.css'

/** 보관 탭 맨 위 안내 박스(5-7). 고정 문구이다. */
function StoredNotice() {
  return (
    <aside className="stored-notice">
      <Mascot pose="sleepy" size={62} />
      <p className="stored-notice__text">
        넘긴 편지와 마무리된 대화가
        <br />
        여기에 조용히 모여요
      </p>
    </aside>
  )
}

export default StoredNotice
