import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import './StampGuide.css'

/** 꾸미기 우표 탭의 획득 방법 안내(7-5). 고정 문구이다. */
export function DecorationGuide() {
  return (
    <p className="stamp-guide stamp-guide--decoration">
      <Icon name="game" size={22} />
      배달 게임 · 시즌 이벤트에서 얻어요
    </p>
  )
}

/** 우표가 하나도 없을 때 아래에 나오는 안내(7-6). 고정 문구이다. */
export function FirstStampGuide() {
  return (
    <aside className="stamp-guide stamp-guide--first">
      <Mascot pose="letter" size={36} />
      <div className="stamp-guide__texts">
        <p className="stamp-guide__title">첫 일기를 쓰면 「첫 일기」 우표가 생겨요</p>
        <p className="stamp-guide__sub">편지를 보낼수록 우표가 하나씩 늘어나요</p>
      </div>
    </aside>
  )
}
