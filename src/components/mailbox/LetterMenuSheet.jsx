import './LetterMenuSheet.css'

const ITEMS = [
  { key: 'report', label: '신고하기' },
  { key: 'block', label: '차단하기' },
]

/**
 * 편지 열람(5-9) 오른쪽 위 "…" 메뉴 시트의 내용. 신고·차단 진입이다.
 * 신고하기는 3-7 신고 시트, 차단하기는 3-8 차단 팝업(shared/ui의 ReportForm·BlockDialog)으로 이어진다. 여는 일은 LetterPage가 한다.
 * 열고 닫는 틀은 shared의 useOverlay().openSheet가 맡는다.
 * @param {(key: 'report' | 'block') => void} onSelect 항목을 눌렀을 때
 */
function LetterMenuSheet({ onSelect }) {
  return (
    <ul className="letter-menu">
      {ITEMS.map((item) => (
        <li key={item.key}>
          <button type="button" className="letter-menu__item" onClick={() => onSelect(item.key)}>
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  )
}

export default LetterMenuSheet
