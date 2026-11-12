import { useState } from 'react'
import Button from '../../shared/ui/Button.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import './StampSheet.css'

/**
 * 우표 고르고 편지 보내기(시안 4-6, 우표가 1장뿐이면 4-7). useOverlay().openSheet()의 content로 넣어 쓴다.
 * 시트 제목("편지를 보낼까요?")은 openSheet의 title로 넣는다.
 * 시트는 라우트 바깥(OverlayProvider)에 그려지므로, 작성 중 상태(useLetterDraft)는 쓰지 않고 props로 받는다.
 * @param {{id: string, name: string}[]} stamps 내가 가진 우표 (붙일 수 있는 우표)
 * @param {string} [selectedId] 처음 골라 둘 우표 id. 없으면 첫 번째 우표
 * @param {string} from 보내는 지역 (예: '서울 성북')
 * @param {string} to 받는 지역 (예: '충남 천안')
 * @param {string} arrival 도착까지 걸리는 시간 문구 (예: '약 6시간')
 * @param {(stampId: string) => void} onSend "보내기"를 눌렀을 때. 고른 우표 id를 넘긴다.
 * @param {() => void} onReview "다시 보기"를 눌렀을 때 (시트를 닫고 편지를 다시 본다)
 * @param {() => void} [onGame] "직접 배달하기"를 눌렀을 때 (9-1 보류라 아직 연결하지 않는다)
 * @param {() => void} [onAdd] 우표 추가(+) 칸을 눌렀을 때
 * @param {(stampId: string) => void} [onSelect] 우표를 골랐을 때(고를 때마다). 뒤의 편지에 우표를 바로 붙여 보여 줄 때 쓴다.
 */
function StampSheet({ stamps, selectedId, from, to, arrival, onSend, onReview, onGame, onAdd, onSelect }) {
  const [selected, setSelected] = useState(selectedId ?? stamps[0]?.id ?? null)
  const only = stamps.length === 1 ? stamps[0] : null

  return (
    <div className="stamp-sheet">
      {/* 배송 경로: 보내는 지역 → 받는 지역 */}
      <div className="stamp-sheet__route">
        <span className="stamp-sheet__dot" />
        <span className="stamp-sheet__line">
          <Mascot pose="face" size={40} />
        </span>
        <span className="stamp-sheet__dot" />
      </div>
      <div className="stamp-sheet__places">
        <span>{from}</span>
        <span>{to}</span>
      </div>
      <p className="stamp-sheet__arrival">도착까지 {arrival}</p>

      <p className="stamp-sheet__label">붙일 우표 · 내 우표첩</p>

      {only ? (
        // 4-7: 우표가 1장뿐이면 목록 대신 안내 카드
        <div className="stamp-sheet__only">
          <span className="stamp-sheet__cell is-selected">
            <Stamp id={only.id} size={52.5} />
          </span>
          <div className="stamp-sheet__only-text">
            <p className="stamp-sheet__only-title">가입 선물 「{only.name}」 우표</p>
            <p className="stamp-sheet__only-desc">
              아직 우표가 1장뿐이에요. 편지를 보내고
              <br />
              주고받을수록 특별한 우표가 생겨요!
            </p>
          </div>
        </div>
      ) : (
        <ul className="stamp-sheet__stamps">
          {stamps.map((stamp) => {
            const isSelected = stamp.id === selected
            return (
              <li key={stamp.id}>
                <button
                  type="button"
                  className={`stamp-sheet__cell${isSelected ? ' is-selected' : ''}`}
                  aria-label={stamp.name}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelected(stamp.id)
                    onSelect?.(stamp.id)
                  }}
                >
                  <Stamp id={stamp.id} size={54.4} />
                </button>
              </li>
            )
          })}
          <li>
            <button type="button" className="stamp-sheet__add" aria-label="우표 추가" onClick={onAdd}>
              <Icon name="plus" size={24} />
            </button>
          </li>
        </ul>
      )}

      {/* 직접 배달하기(→ 9-1, 보류): 자리만 두고 동작은 아직 연결하지 않는다. */}
      <button type="button" className="stamp-sheet__game" onClick={onGame}>
        <Icon name="game" size={24} className="stamp-sheet__game-icon" />
        <span className="stamp-sheet__game-text">
          <span className="stamp-sheet__game-title">고향이랑 직접 배달하기</span>
          <span className="stamp-sheet__game-desc">게임하면 최대 n시간 빨리 도착해요</span>
        </span>
        <Icon name="chevron" size={20} className="stamp-sheet__game-chevron" />
      </button>

      <div className="stamp-sheet__actions">
        <Button variant="secondary" onClick={onReview}>
          다시 보기
        </Button>
        <Button disabled={!selected} onClick={() => onSend(selected)}>
          보내기
        </Button>
      </div>
      <p className="stamp-sheet__caption">보낸 편지는 취소할 수 없어요</p>
    </div>
  )
}

export default StampSheet
