import { useEffect } from 'react'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import { getLetterFontFamily, loadLetterFont } from '../../shared/fonts/letterFonts.js'
import Stamp from '../../shared/ui/Stamp.jsx'
import postmark from './assets/postmark.png'
import './LetterPaper.css'

// 서버가 스티커 크기(scale)를 아직 주지 않아(요청 1115_fe2be_sticker-scale) 편지 쓰기의 기본 크기(64px)로 그린다.
const STICKER_SIZE = 64

/**
 * 받은 편지를 읽기만 하는 편지지 카드(5-9). 보낸 사람, 지역, 걸린 시간, 우표와 소인, 본문, 서명을 보여 준다.
 * 채현님의 편지 쓰기 컴포넌트(components/letter-write)를 가져다 쓰지 않고 우체통 안에 따로 만든 것이다.
 * 편지지는 서버가 준 6종의 바탕색·글씨색만 맞춘다(letter-paper--{종류}). 줄·격자·고향이·달과 별·금박 같은 장식은 아직 그리지 않는다.
 * 글씨체는 서버 코드를 shared/fonts/letterFonts.js의 글씨체로 바꿔 쓴다(없는 글씨체는 나눔손글씨 펜).
 * 서명은 서버가 준 이미지 URL이고, 스티커는 서명 영역 기준 0~1 위치(x, y)와 기울기(rotation)로 얹는다. 스티커 크기(scale)는 서버가 아직 주지 않아 64px로 고정이다.
 * 나중에 shared로 올려 합칠 수 있다.
 * 소인은 점선 원 안에 보낸 날짜(MM.DD)와 보낸 사람 지역의 짧은 이름이 우표 위에 기울어져 겹친다(시안 4-10). 값이 없으면 글자를 숨긴다.
 * 열 때 한 번 "꽝" 찍는 연출이 있다: 도장이 앞에서 내려와 소인 자리를 누르고, 닿는 순간 소인이 나타난다.
 * 4-10(components/delivery/StampingScene)의 움직임을 참고해 따로 만든 가벼운 CSS 애니메이션이다(그 컴포넌트는 가져오지 않는다).
 * @param {object} letter letterReceiveMapper.toLetterView의 결과
 */
function LetterPaper({ letter }) {
  const {
    nickname, isFirstLetter, routeLabel, travelLabel, postmarkDate, postmarkPlace, stampId, stampName, body,
    signatureUrl, stickers, paperKind, fontId,
  } = letter

  useEffect(() => {
    loadLetterFont(fontId)
  }, [fontId])

  return (
    <article className={`letter-paper letter-paper--${paperKind}`}>
      {isFirstLetter && <span className="letter-paper__badge">첫 편지</span>}

      {stampId && (
        <>
          <span className="letter-paper__stamp">
            <Stamp id={stampId} size={58} alt={stampName} />
          </span>
          <span className="letter-paper__postmark-wrap" aria-hidden="true">
            <span className="letter-paper__ripple" />
            <img className="letter-paper__postmark" src={postmark} alt="" width={72} height={72} />
            {(postmarkDate || postmarkPlace) && (
              <span className="letter-paper__postmark-text">
                {postmarkDate && <span>{postmarkDate}</span>}
                {postmarkPlace && <span>{postmarkPlace}</span>}
              </span>
            )}
          </span>
          <span className="letter-paper__tool" aria-hidden="true">
            <span className="letter-paper__tool-knob" />
          </span>
        </>
      )}

      <h2 className="letter-paper__from">From. {nickname}</h2>
      <p className="letter-paper__route">{routeLabel}</p>
      {travelLabel && (
        <p className="letter-paper__travel">
          <Icon name="clock" size={16} />
          {travelLabel}
        </p>
      )}

      <p className="letter-paper__body" style={{ fontFamily: getLetterFontFamily(fontId) }}>{body}</p>
      {(signatureUrl || stickers.length > 0) && (
        <div className={`letter-paper__sign${signatureUrl ? '' : ' letter-paper__sign--empty'}`}>
          {signatureUrl && <img className="letter-paper__sign-img" src={signatureUrl} alt="보낸 사람의 서명" />}
          {stickers.map((sticker) => (
            <span
              key={sticker.key}
              className="letter-paper__sticker"
              style={{
                left: `${sticker.x * 100}%`,
                top: `${sticker.y * 100}%`,
                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
              }}
            >
              <Mascot pose={sticker.pose} size={STICKER_SIZE} />
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

export default LetterPaper
