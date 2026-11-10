import { useEffect, useState } from 'react'
import Mascot from '../../shared/ui/Mascot.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import { MOCK_STAMPS } from '../../shared/mocks/stamps.js'
import foldLine from './assets/stamping-fold.svg'
import postmarkRing from './assets/stamping-postmark.png'
import './StampingScene.css'

// 연출이 끝난 뒤 문구를 잠깐 보여 주고 넘어가는 시간(ms)
const DONE_AFTER = 3400

/**
 * 발송 연출(시안 4-10): 봉투에 붙은 우표 위에 도장이 앞에서 다가와 쾅 찍힌다.
 * 도장이 닿는 순간 소인(점선 원 + 날짜·지역)이 나타나고 문구가 뜬다. 움직임은 모두 CSS 애니메이션이다.
 * 끝나면 onDone을 부른다. 처음부터 다시 보려면 바깥에서 key를 바꿔 새로 그린다.
 * 좌표는 시안(360 너비) 기준이라 가운데 360px 영역에 그린다.
 * @param {string} [stampId] 붙일 우표 id
 * @param {string} [place] 소인에 적을 지역 (예: '서울')
 * @param {Date} [date] 소인 날짜 (기본: 오늘)
 * @param {() => void} [onDone] 연출이 끝났을 때
 */
function StampingScene({ stampId = 'handwriting-master', place = '서울', date, onDone }) {
  const [today] = useState(() => new Date()) // 렌더링마다 바뀌지 않게 처음 한 번만 정한다.
  const stampedAt = date ?? today
  const monthDay = `${String(stampedAt.getMonth() + 1).padStart(2, '0')}.${String(stampedAt.getDate()).padStart(2, '0')}`

  const stampIndex = MOCK_STAMPS.findIndex((stamp) => stamp.id === stampId)
  const stampName = MOCK_STAMPS[stampIndex]?.name ?? ''
  const stampNumber = `No.${String(stampIndex + 1).padStart(2, '0')}`

  useEffect(() => {
    if (!onDone) return undefined
    const timer = setTimeout(onDone, DONE_AFTER)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="stamping">
      <div className="stamping__art">
        <div className="stamping__circle" />

        {/* 봉투와 우표: 도장이 찍힐 때 함께 눌린다 */}
        <div className="stamping__envelope">
          <div className="stamping__card-box">
            <div className="stamping__card" />
          </div>
          <img className="stamping__fold" src={foldLine} alt="" />
          <div className="stamping__stamp">
            <Stamp id={stampId} size={57.6} />
            <span className="stamping__stamp-band" />
            <span className="stamping__stamp-name">{stampName}</span>
            <span className="stamping__stamp-no">{stampNumber}</span>
            <span className="stamping__stamp-brand">동글</span>
          </div>
        </div>

        {/* 소인: 도장이 닿는 순간 나타난다 */}
        <div className="stamping__postmark">
          <span className="stamping__ripple" />
          <img className="stamping__ring" src={postmarkRing} alt="" width="96" height="96" />
        </div>
        <p className="stamping__date">
          <span>{monthDay}</span>
          <span>{place}</span>
        </p>

        {/* 도장: 화면 앞쪽에서 커진 채 다가와 우표 위를 쾅 누르고 다시 앞으로 빠진다.
            고무면은 소인과 같은 원이고, 손잡이만 살짝 위로 기울어져 옆면이 보인다. */}
        <div className="stamping__tool" aria-hidden="true">
          <span className="stamping__tool-disc">
            <span className="stamping__tool-neck" />
            <span className="stamping__tool-knob" />
          </span>
        </div>

        <div className="stamping__mascot">
          <Mascot pose="letter" size={88.9} />
        </div>

        <div className="stamping__mailbox">
          <span className="stamping__mailbox-head" />
          <span className="stamping__mailbox-slot" />
          <span className="stamping__mailbox-pole" />
        </div>

        <p className="stamping__caption">쾅! 우표에 소인을 찍었어요</p>
      </div>
    </div>
  )
}

export default StampingScene
