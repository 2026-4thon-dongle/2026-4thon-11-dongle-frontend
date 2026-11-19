import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Button from '../../shared/ui/Button.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import './StampSheet.css'

/**
 * 우표 고르고 편지 보내기(시안 4-6, 우표가 1장뿐이면 4-7). useOverlay().openSheet()의 content로 넣어 쓴다.
 * 시트 제목("편지를 보낼까요?")은 openSheet의 title로 넣는다.
 * 시트는 라우트 바깥(OverlayProvider)에 그려지므로, 작성 중 상태(useLetterDraft)는 쓰지 않고 props로 받는다.
 * @param {{id: string, name: string, art?: string}[]} stamps 내가 가진 우표 (붙일 수 있는 우표). art는 우표 그림 id로, 없으면 id를 쓴다.
 * @param {{id: string, art: string, name: string, hint: string} | null} [lockedStamp] 다음에 받을 우표. 있으면 우표 줄 맨 오른쪽에
 *   잠금으로 보이고, 누르면 hint(받는 방법)가 말풍선으로 뜬다(시안 4-6-2). 붙일 수는 없다. 없으면 잠금 칸을 보여 주지 않는다.
 * @param {string} [selectedId] 처음 골라 둘 우표 id. 없으면 첫 번째 우표
 * @param {string} from 보내는 지역 (예: '서울 성북')
 * @param {string} to 받는 지역 (예: '충남 천안')
 * @param {string} arrival 도착까지 걸리는 시간 문구 (예: '약 6시간')
 * @param {(stampId: string) => void} onSend "보내기"를 눌렀을 때. 고른 우표 id를 넘긴다.
 * @param {() => void} onReview "다시 보기"를 눌렀을 때 (시트를 닫고 편지를 다시 본다)
 * @param {(stampId: string) => void} [onSelect] 우표를 골랐을 때(고를 때마다). 뒤의 편지에 우표를 바로 붙여 보여 줄 때 쓴다.
 */
function StampSheet({ stamps, selectedId, from, to, arrival, lockedStamp = null, onSend, onReview, onSelect }) {
  const [selected, setSelected] = useState(selectedId ?? stamps[0]?.id ?? null)
  const only = stamps.length === 1 ? stamps[0] : null

  // 잠금 우표 말풍선. x, y는 말풍선이 가리키는 잠금 우표 그림 위쪽 가운데(이 시트 내용의 왼쪽 위 기준 px).
  // left, tailX는 말풍선이 시트 밖으로 나가지 않게 잰 뒤에 채운다(잴 때까지는 숨겨 둔다).
  const rootRef = useRef(null)
  const tipRef = useRef(null)
  const [tip, setTip] = useState(null)

  const toggleTip = (event) => {
    if (tip) {
      setTip(null)
      return
    }
    const root = rootRef.current.getBoundingClientRect()
    // 우표 그림이 없으면(그림 파일이 없는 우표) 칸 전체를 기준으로 한다.
    const art = (event.currentTarget.querySelector('.ui-stamp') ?? event.currentTarget).getBoundingClientRect()
    setTip({ x: art.left + art.width / 2 - root.left, y: art.top - root.top })
  }

  // 말풍선 위치: 우표 위 가운데에 두되, 시트 양쪽 끝에서 12px 안쪽으로 막고 꼬리는 우표를 가리킨다.
  useLayoutEffect(() => {
    if (!tip || tip.left !== undefined) return
    const width = tipRef.current.offsetWidth
    const rootWidth = rootRef.current.clientWidth
    const left = Math.min(Math.max(tip.x - width / 2, -12), rootWidth + 12 - width)
    setTip({ ...tip, left, tailX: Math.min(Math.max(tip.x - left, 14), width - 14) })
  }, [tip])

  // 말풍선 밖을 누르면 닫힌다(화면 이동 없이 말풍선만 뜬다).
  useEffect(() => {
    if (!tip) return undefined
    const closeOutside = (event) => {
      if (!event.target.closest('.stamp-sheet__locked, .stamp-sheet__tip')) setTip(null)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [tip])

  return (
    <div className="stamp-sheet" ref={rootRef}>
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
        <ul className="stamp-sheet__stamps" onScroll={() => tip && setTip(null)}>
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
                  <Stamp id={stamp.art ?? stamp.id} size={54.4} />
                </button>
              </li>
            )
          })}
          {/* 다음에 받을 우표: 흐리게 보이고 자물쇠가 올라간다. 붙일 수 없고, 누르면 받는 방법이 말풍선으로 뜬다. */}
          {lockedStamp && (
            <li>
              <button
                type="button"
                className="stamp-sheet__cell stamp-sheet__locked"
                aria-label={`잠긴 우표 ${lockedStamp.name}. 누르면 받는 방법이 나와요`}
                aria-expanded={Boolean(tip)}
                aria-describedby={tip ? 'stamp-lock-tip' : undefined}
                onClick={toggleTip}
              >
                <span className="stamp-sheet__locked-art">
                  <Stamp id={lockedStamp.art} size={54.4} />
                </span>
                <span className="stamp-sheet__lock">
                  <Icon name="lock" size={20} />
                </span>
              </button>
            </li>
          )}
        </ul>
      )}

      {tip && lockedStamp && (
        <div
          ref={tipRef}
          id="stamp-lock-tip"
          role="status"
          className="stamp-sheet__tip"
          style={{
            left: tip.left ?? 0,
            top: tip.y,
            visibility: tip.left === undefined ? 'hidden' : 'visible',
            '--tail-x': `${tip.tailX ?? 0}px`,
          }}
        >
          <span className="stamp-sheet__tip-bubble">{lockedStamp.hint}</span>
          <span className="stamp-sheet__tip-tail" />
        </div>
      )}

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
