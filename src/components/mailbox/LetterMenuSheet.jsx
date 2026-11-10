import './LetterMenuSheet.css'

/**
 * 편지 열람(5-9) 오른쪽 위 "…" 메뉴 시트의 내용. 신고·차단 진입이다.
 * 신고·차단 화면은 효령님(3-6~3-8) 담당이라 아직 연결하지 않았다. 항목을 누르면 닫고 토스트만 보여 준다. (가정)
 * 열고 닫는 틀은 shared의 useOverlay().openSheet가 맡는다.
 * @param {(label: string) => void} onSelect 항목을 눌렀을 때 (항목 이름을 넘겨 준다)
 */
function LetterMenuSheet({ onSelect }) {
  const items = ['신고하기', '차단하기']
  return (
    <ul className="letter-menu">
      {items.map((label) => (
        <li key={label}>
          <button type="button" className="letter-menu__item" onClick={() => onSelect(label)}>
            {label}
          </button>
        </li>
      ))}
    </ul>
  )
}

export default LetterMenuSheet
