import Icon from '../../shared/ui/Icon.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import postmark from './assets/postmark.png'
import './LetterPaper.css'

/**
 * 받은 편지를 읽기만 하는 편지지 카드(5-9). 보낸 사람, 지역, 걸린 시간, 우표와 소인, 본문, 서명을 보여 준다.
 * 채현님의 편지 쓰기 컴포넌트(components/letter-write)를 가져다 쓰지 않고 우체통 안에 따로 만든 것이다.
 * 편지지는 한 가지(기본)로만 그리고, 글씨체는 편지 글씨체(Nanum Pen) 하나만 쓴다. 서명은 손글씨 문구로 대신한다(mock).
 * 나중에 shared로 올려 합칠 수 있다.
 * 소인은 점선 원 안에 보낸 날짜(MM.DD)와 보낸 사람 지역의 짧은 이름이 우표 위에 기울어져 겹친다(시안 4-10). 값이 없으면 글자를 숨긴다.
 * 열 때 한 번 "꽝" 찍는 연출이 있다: 도장이 앞에서 내려와 소인 자리를 누르고, 닿는 순간 소인이 나타난다.
 * 4-10(components/delivery/StampingScene)의 움직임을 참고해 따로 만든 가벼운 CSS 애니메이션이다(그 컴포넌트는 가져오지 않는다).
 * @param {object} letter letterReceiveMapper.toLetterView의 결과
 */
function LetterPaper({ letter }) {
  const { nickname, isFirstLetter, routeLabel, travelLabel, postmarkDate, postmarkPlace, stampId, stampName, body, signature } = letter

  return (
    <article className="letter-paper">
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

      <p className="letter-paper__body">{body}</p>
      {signature && <p className="letter-paper__signature">{signature}</p>}
    </article>
  )
}

export default LetterPaper
