import { Fragment, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import { getMockMailboxResponse } from '../../shared/mocks/mailbox.js'
import { MOCK_MAP_DELIVERY, MOCK_TOWNS } from '../../components/delivery/data.js'
import { pickMapTheme } from '../../components/delivery/mapThemes.js'
import { ROUTE_POINTS, pointAt, toPolyline, traveledPoints } from '../../components/delivery/mapRoute.js'
import useArrivalCountdown, { formatRemaining } from '../../components/delivery/useArrivalCountdown.js'
import './MapPage.css'

// 시안 지도의 크기(px). 위쪽 상태바 자리 44px는 잘라 낸다.
const MAP_WIDTH = 360
const STATUS_BAR = 44
const MAP_HEIGHT_VISIBLE = 470 - STATUS_BAR

// 위아래로 이만큼(px) 이상 끌면 시트가 접히거나 펼쳐진다. 이보다 적게 움직이면 누른 것으로 본다.
const SWIPE_PX = 30

// 받침이 있으면 "을", 없으면 "를"
const objectJosa = (word) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code % 28 !== 0 ? '을' : '를'
}

// 시안 좌표(x, y)를 지도 영역 안의 위치로. 지도는 화면에 맞게 커지지만(--map-scale) 글자와 표시는 커지지 않는다.
const at = (x, y) => ({
  left: `calc(var(--map-x) + ${x}px * var(--map-scale))`,
  top: `calc(${y - STATUS_BAR}px * var(--map-scale))`,
})

// 위와 같지만 화면 가장자리에서 8px 안쪽에 머물게 한다. 지도가 커져서 양옆이 잘릴 때도 글자가 잘리지 않는다.
// halfWidth: 글자·이름표 폭의 절반(px). 가운데 기준(center)이면 그 폭만큼 안쪽으로 막는다.
const atInside = (x, y, halfWidth, center) => ({
  left: `clamp(${8 + (center ? halfWidth : 0)}px, calc(var(--map-x) + ${x}px * var(--map-scale)), calc(100% - ${8 + halfWidth * (center ? 1 : 2)}px))`,
  top: `calc(${y - STATUS_BAR}px * var(--map-scale))`,
})

/**
 * 4-12 실시간 배송 지도: 지도 위에 편지가 지나온 길과 지금 위치를 보여주고, 아래 시트에 도착 시간과 동네 소식을 보여준다.
 * 시트는 손잡이를 위아래로 끌거나 눌러서 접고 펼 수 있다. 접으면 지도가 더 넓게 보인다.
 */
function MapPage() {
  const navigate = useNavigate()
  const { letterId } = useParams()
  const { showToast } = useOverlay()
  // mock: 우체통 배송 중 편지(letterId)의 출발·도착 지역을 쓴다. 없는 편지(발송 직후 등)는 기본 mock을 쓴다.
  // 배송 API가 정해지면 편지 한 통의 응답에서 가져온다.
  const shipping = getMockMailboxResponse('shipping').results.find((letter) => String(letter.id) === letterId)
  const { recipient, totalMinutes, elapsedMinutes } = MOCK_MAP_DELIVERY
  const from = shipping?.from_region ?? MOCK_MAP_DELIVERY.from
  const to = shipping?.to_region ?? MOCK_MAP_DELIVERY.to
  const { remainingMinutes, progress } = useArrivalCountdown({ totalMinutes, elapsedMinutes })
  const theme = pickMapTheme(letterId)

  const [collapsed, setCollapsed] = useState(false)
  const dragStartY = useRef(null)

  // 지도 영역 크기에 맞춘 지도 배율(--map-scale)과 왼쪽 여백(--map-x).
  // 지도는 영역을 빈틈없이 채우도록 키우고(가로나 세로 중 더 많이 필요한 쪽 기준), 남는 쪽은 가운데를 맞춰 잘라 낸다.
  const stageRef = useRef(null)
  const [map, setMap] = useState({ scale: 1, x: 0 })
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const scale = Math.max(width / MAP_WIDTH, height / MAP_HEIGHT_VISIBLE)
      setMap({ scale, x: (width - MAP_WIDTH * scale) / 2 })
    })
    observer.observe(stageRef.current)
    return () => observer.disconnect()
  }, [])

  const handlePointerDown = (event) => {
    dragStartY.current = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerUp = (event) => {
    if (dragStartY.current === null) return
    const moved = event.clientY - dragStartY.current
    dragStartY.current = null
    if (moved > SWIPE_PX) setCollapsed(true)
    else if (moved < -SWIPE_PX) setCollapsed(false)
    else setCollapsed((value) => !value)
  }

  const [mascotX, mascotY] = pointAt(progress)
  const [startX, startY] = ROUTE_POINTS[0]
  const [endX, endY] = ROUTE_POINTS[ROUTE_POINTS.length - 1]

  // 지금 위치에서 가장 가까운 동네가 "지나고 있는" 동네, 그 다음 동네가 "곧 지나요"
  const currentIndex = MOCK_TOWNS.reduce(
    (best, town, index) =>
      Math.abs(town.at - progress) < Math.abs(MOCK_TOWNS[best].at - progress) ? index : best,
    0,
  )
  const current = MOCK_TOWNS[currentIndex]
  const next = MOCK_TOWNS[currentIndex + 1]

  return (
    <main className="map-page" style={{ '--map-scale': map.scale, '--map-x': `${map.x}px` }}>
      <div className="map-page__stage" ref={stageRef}>
        {/* 지도 그림과 길만 화면에 맞게 키운다. 시안 좌표(360×470) 기준이다. */}
        <div className="map-page__scaled">
          <img className="map-page__map" src={theme.src} alt="" width="360" height="470" />
          <svg className="map-page__route" viewBox="0 0 360 470" aria-hidden="true">
            <polyline className="map-page__route-rest" points={toPolyline(ROUTE_POINTS)} />
            <polyline className="map-page__route-done" points={toPolyline(traveledPoints(progress))} />
          </svg>
        </div>

        {/* 지도 위의 글자와 표시는 위치만 지도에 맞추고 크기는 그대로 둔다. */}
        <span className="map-page__place" style={atInside(startX - 6, startY - 36, 30, true)}>
          {from}
        </span>
        <span className="map-page__pin map-page__pin--from" style={at(startX, startY)} />
        <span className="map-page__place" style={atInside(endX - 24, endY - 40, 30, true)}>
          {to}
        </span>
        <span className="map-page__pin map-page__pin--to" style={at(endX, endY)} />

        {MOCK_TOWNS.map((town, index) => {
          const [x, y] = pointAt(town.at)
          return (
            <Fragment key={town.id}>
              <span
                className={`map-page__town-dot${index <= currentIndex ? ' is-passed' : ''}`}
                style={at(x, y)}
              />
              <span className="map-page__town-chip" style={atInside(x + 10, y - 12, 37, false)}>
                {town.name}
              </span>
            </Fragment>
          )
        })}

        {/* 지금 편지가 있는 곳 */}
        <span className="map-page__rider" style={at(mascotX, mascotY)}>
          <Mascot pose="face" size={48} />
        </span>

        {/* 직접 배달하기(→ 9-1, 보류): 자리만 두고 동작은 아직 연결하지 않는다. */}
        <button
          type="button"
          className="map-page__game"
          onClick={() => showToast('직접 배달하기는 준비 중이에요')}
        >
          <Icon name="game" size={24} />
          직접 배달하기
        </button>

        <button type="button" className="map-page__back" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <Icon name="back" size={24} />
        </button>
        <p className="map-page__title">{recipient}님에게 가는 편지</p>
      </div>

      <section className={`map-page__sheet${collapsed ? ' is-collapsed' : ''}`} aria-label="배송 현황">
        {/* 손잡이: 위아래로 끌거나 눌러서 접고 편다. 키보드는 Enter/Space로 눌러서 바꾼다. */}
        <button
          type="button"
          className="map-page__grab"
          aria-label={collapsed ? '동네 소식 펼치기' : '동네 소식 접기'}
          aria-expanded={!collapsed}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            dragStartY.current = null
          }}
          onClick={(event) => event.detail === 0 && setCollapsed((value) => !value)}
        >
          <span className="map-page__handle" />
        </button>
        <h1 className="map-page__remaining">도착까지 {formatRemaining(remainingMinutes)}</h1>
        <p className="map-page__now">
          지금 {current.name}
          {objectJosa(current.name)} 지나고 있어요
        </p>
        <div className="map-page__bar">
          <div className="map-page__bar-fill" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="map-page__more" aria-hidden={collapsed}>
          <div className="map-page__more-inner">
            <h2 className="map-page__news-title">편지가 지나가는 동네 소식</h2>
            <ul className="map-page__news">
              {[current, next].filter(Boolean).map((town) => (
                <li key={town.id} className="map-page__news-item">
                  <span className={`map-page__news-icon map-page__news-icon--${town.tone}`}>
                    <Icon name={town.icon} size={24} />
                  </span>
                  <span className="map-page__news-text">
                    <span className="map-page__news-name">
                      {town.name}
                      {town.id === next?.id && ' · 곧 지나요'}
                    </span>
                    <span className="map-page__news-desc">{town.news}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

export default MapPage
