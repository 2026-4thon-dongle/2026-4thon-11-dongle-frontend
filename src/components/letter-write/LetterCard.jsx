import { useLayoutEffect, useRef } from 'react'
import Mascot from '../../shared/ui/Mascot.jsx'
import scrollCaretIntoView from './scrollCaretIntoView.js'
import nightSky from './assets/night-sky.svg'
import './Paper.css'
import './LetterCard.css'

/**
 * 편지 본문 카드(시안 4-2). 고른 편지지 위에 "To. 받는 사람"과 본문을 쓴다.
 * 편지지의 색·줄·테두리는 Paper.css(시안의 편지지 스펙)를 따르고, 장식은 편지지마다 다르다.
 * 본문이 길어지면 글상자 안이 스크롤되지 않고 편지지가 같이 길어져, 화면 전체가 스크롤된다.
 * @param {string} paperId 고른 편지지 id (PAPERS의 id)
 * @param {string} recipient 받는 사람 이름 (예: '하늘빛')
 * @param {string} value 본문
 * @param {(value: string) => void} onChange
 * @param {string} fontFamily 본문과 받는 사람에 쓸 CSS font-family
 * @param {number} maxLength 최대 글자 수
 */
function LetterCard({ paperId = 'basic', recipient, value, onChange, fontFamily, maxLength }) {
  const textRef = useRef(null)

  // 글상자 높이를 내용에 맞춘다(최소 높이는 CSS의 min-height). 글씨체 파일이 늦게 오면 줄 바꿈이 달라지므로 그때도 다시 맞춘다.
  // 높이를 잠깐 'auto'로 줄이면 문서가 짧아져 브라우저가 화면을 맨 위로 되돌리므로, 맞추는 동안 스크롤 위치를 지킨다.
  // 글을 쓰고 있으면(글상자에 포커스가 있으면) 커서가 화면 밖으로 나가지 않게 화면을 따라 내린다.
  useLayoutEffect(() => {
    const textarea = textRef.current
    const fit = () => {
      const { scrollX, scrollY } = window
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
      window.scrollTo(scrollX, scrollY)
      if (document.activeElement === textarea) scrollCaretIntoView(textarea)
    }
    fit()
    document.fonts?.addEventListener('loadingdone', fit)
    return () => document.fonts?.removeEventListener('loadingdone', fit)
  }, [value, fontFamily, paperId])

  return (
    <div className={`paper paper--${paperId} write-card write-card--${paperId}`} style={{ fontFamily }}>
      {paperId === 'mascot' && <Mascot pose="face" size={88} className="write-card__deco write-card__deco--cat" />}
      {paperId === 'night' && (
        <img className="write-card__deco write-card__deco--sky" src={nightSky} alt="" width="108" height="106" />
      )}
      <p className="write-card__to">To. {recipient}</p>
      <textarea
        ref={textRef}
        className="write-card__text"
        value={value}
        maxLength={maxLength}
        placeholder="하고 싶은 이야기를 적어보세요"
        aria-label="편지 본문"
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="write-card__count">
        {value.length} / {maxLength}
      </p>
    </div>
  )
}

export default LetterCard
