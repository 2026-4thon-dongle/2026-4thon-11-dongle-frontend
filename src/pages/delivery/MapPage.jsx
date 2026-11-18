import { Fragment, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import LoadingPill from '../../shared/feedback/LoadingPill.jsx'
import { MAP_THEMES, pickMapTheme } from '../../components/delivery/mapThemes.js'
import { ROUTE_POINTS, pointAt, toPolyline, traveledPoints } from '../../components/delivery/mapRoute.js'
import useArrivalCountdown, { formatRemaining } from '../../components/delivery/useArrivalCountdown.js'
import useDeliveryInfo from '../../components/delivery/useDeliveryInfo.js'
import { pickRegionNews } from '../../components/delivery/regionNews.js'
import './MapPage.css'

// 시안 지도의 크기(px). 위쪽 상태바 자리 44px는 잘라 낸다.
const MAP_WIDTH = 360
const STATUS_BAR = 44
const MAP_HEIGHT_VISIBLE = 470 - STATUS_BAR
// 길(출발·도착 점과 지역 이름)이 좌우로 잘리지 않고 보이는 데 필요한 지도 폭(시안 좌표 px). 지도를 이보다 더 키우지 않는다.
const ROUTE_FIT_WIDTH = 340

// 위아래로 이만큼(px) 이상 끌면 시트가 접히거나 펼쳐진다. 이보다 적게 움직이면 누른 것으로 본다.
const SWIPE_PX = 30

// 도착한 뒤 고향이와 「○○ 도착!」 이름의 자리(시안 좌표). 고향이는 도착 점(300, 420)을 덮어서 도착한 곳에 선다.
// 원 아래쪽이 시트(y 440부터 지도를 덮는다)에 걸리지 않게 점보다 살짝 위쪽에 둔다. 이름은 고향이 왼쪽에서 끝난다.
// 시안 4-12-1은 고향이를 점 왼쪽(232, 404)에 두었는데, 도착한 곳에 더 가깝게 붙였다.
const ARRIVED_RIDER = [288, 406]
const ARRIVED_LABEL = [252, 397]

// 동네 이름표는 글자 너비에 맞춘다(11px 글자 + 좌우 여백 10px). 왼쪽에 놓을 때 위치 계산에 쓰는 어림값이다.
const townChipWidth = (name) => [...name].length * 11 + 20

// 지도에서는 시·도와 시가 같은 글자면 한 번만 쓴다(제주 제주 → 제주).
const mapName = (name) => {
  const [province, district] = name.split(' ')
  return district && province === district ? province : name
}

// 받침이 있으면 "을", 없으면 "를"
const objectJosa = (word) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code % 28 !== 0 ? '을' : '를'
}

// 시안 좌표(x, y)를 지도 영역 안의 위치로. 지도는 화면에 맞게 커지지만(--map-scale) 글자와 표시는 커지지 않는다.
const at = (x, y) => ({
  left: `calc(var(--map-x) + ${x}px * var(--map-scale))`,
  top: `calc(var(--map-y) + ${y - STATUS_BAR}px * var(--map-scale))`,
})

// 위와 같지만 화면 가장자리에서 8px 안쪽에 머물게 한다. 지도가 커져서 양옆이 잘릴 때도 글자가 잘리지 않는다.
// halfWidth: 글자·이름표 폭의 절반(px). 가운데 기준(center)이면 그 폭만큼 안쪽으로 막는다.
const atInside = (x, y, halfWidth, center) => ({
  left: `clamp(${8 + (center ? halfWidth : 0)}px, calc(var(--map-x) + ${x}px * var(--map-scale)), calc(100% - ${8 + halfWidth * (center ? 1 : 2)}px))`,
  top: `calc(var(--map-y) + ${y - STATUS_BAR}px * var(--map-scale))`,
})

/**
 * 4-12 실시간 배송 지도: 배송 경로 API(GET /api/letters/{id}/route/)로 받은 편지의 길을 보여 준다.
 * 받는 중에는 아무것도 그리지 않는다.
 */
function MapPage() {
  const { letterId } = useParams()
  const navigate = useNavigate()
  const { info, error, retry } = useDeliveryInfo({ letterId })
  // 없는 편지·볼 수 없는 편지(404·403)는 다시 시도해도 같으므로 우체통으로 보낸다.
  if (error && [403, 404].includes(error.status)) return <ErrorScreen title="편지를 찾을 수 없어요" description={error.message} hint="" retryLabel="우체통으로 가기" onRetry={() => navigate('/mailbox', { replace: true })} />
  if (error) return <ErrorScreen title="배송 정보를 불러오지 못했어요" description={error.message} hint="" onRetry={retry} />
  if (!info) return <LoadingPill fullScreen />
  return <MapView info={info} letterId={letterId} />
}

/**
 * 지도 위에 편지가 지나온 길과 지금 위치를 보여주고, 아래 시트에 도착 시간과 동네 소식을 보여준다.
 * 시트는 손잡이를 위아래로 끌거나 눌러서 접고 펼 수 있다. 접으면 지도가 더 넓게 보인다.
 */
function MapView({ info, letterId }) {
  const navigate = useNavigate()
  const { recipient, towns, sentAt, arrivesAt } = info
  const from = mapName(info.from)
  const to = mapName(info.to)
  const { remainingMinutes, progress } = useArrivalCountdown({ sentAt, arrivesAt })
  // 지도 배경은 서버가 편지마다 정해 준다. 없으면 편지 번호로 고른다.
  const theme = MAP_THEMES.find((item) => item.id === info.mapTheme) ?? pickMapTheme(letterId)

  const [collapsed, setCollapsed] = useState(false)
  const dragStartY = useRef(null)

  // 지도 영역 크기에 맞춘 배율. 배경 그림과 길·표시를 따로 맞춘다.
  //   배경(--bg-scale, --bg-x): 영역을 빈틈없이 채우도록 키운다(가로나 세로 중 더 많이 필요한 쪽 기준). 남는 쪽은 가운데를 맞춰 잘라 낸다.
  //   길·표시(--map-scale, --map-x, --map-y): 길이 좌우로 잘리지 않을 만큼만 키운다. 시트를 접어 영역이 세로로 길어져도
  //   배경만 더 커지고 길과 고향이는 그대로이며, 위아래 남는 곳은 가운데에 둔다.
  const stageRef = useRef(null)
  const [map, setMap] = useState({ scale: 1, x: 0, y: 0, bgScale: 1, bgX: 0 })
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const cover = Math.max(width / MAP_WIDTH, height / MAP_HEIGHT_VISIBLE)
      const scale = Math.min(cover, Math.max(width / ROUTE_FIT_WIDTH, width / MAP_WIDTH))
      setMap({
        scale,
        x: (width - MAP_WIDTH * scale) / 2,
        y: Math.max((height - MAP_HEIGHT_VISIBLE * scale) / 2, 0),
        bgScale: cover,
        bgX: (width - MAP_WIDTH * cover) / 2,
      })
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

  // 도착했으면(진행률 1) 시안 4-12-1 모습: 고향이는 웃고, 길은 끝까지 지나왔고, 시트는 도착 안내와 우체통 버튼을 보여 준다.
  const arrived = progress >= 1
  const [mascotX, mascotY] = arrived ? ARRIVED_RIDER : pointAt(progress)
  const [startX, startY] = ROUTE_POINTS[0]
  const [endX, endY] = ROUTE_POINTS[ROUTE_POINTS.length - 1]

  // 지금 위치에서 가장 가까운 동네가 "지나고 있는" 동네, 그 다음 동네가 "곧 지나요". 지나는 동네가 없으면(같은 지역끼리 등) 둘 다 없다.
  const currentIndex = towns.reduce(
    (best, town, index) => (Math.abs(town.at - progress) < Math.abs(towns[best].at - progress) ? index : best),
    0,
  )
  const current = towns[currentIndex]
  const next = towns[currentIndex + 1]
  // 시트의 동네 소식 카드(시안 메모 「4-12 동네 소식 카드 규칙」): 지금 지나는 동네 1장 + 다음 자리 1장.
  // 경유지가 시·도 단위라 다음 동네가 없는 경우가 많으므로, 그 자리에는 도착 지역(「○○ · 곧 도착해요」)을 넣어 카드를 거의 항상 두 장으로 둔다.
  // 서울 → 서울처럼 같은 시·도끼리라 지나는 동네가 없을 때만 도착 지역 카드 1장이고, 그때는 시트도 카드 한 장만큼 낮아진다.
  // 소식은 서버가 준 그 지역의 일기 한 줄이 있으면 그것을, 없으면 시·도별 소식 2개 중 하나를 쓴다(같은 편지에서는 늘 같은 것).
  const newsOf = (sido, serverNews) => serverNews || pickRegionNews(letterId, sido)
  const destinationCard = { id: 'destination', name: to, news: newsOf(info.toSido), destination: true }
  const newsCards = towns.length
    ? [
        { ...current, news: newsOf(current.sido, current.news) },
        next ? { ...next, news: newsOf(next.sido, next.news) } : destinationCard,
      ]
    : [destinationCard]

  return (
    <main className="map-page" style={{
        '--map-scale': map.scale, '--map-x': `${map.x}px`, '--map-y': `${map.y}px`,
        '--bg-scale': map.bgScale, '--bg-x': `${map.bgX}px`,
      }}>
      <div className="map-page__stage" ref={stageRef}>
        {/* 배경 그림과 길은 따로 화면에 맞게 키운다. 시안 좌표(360×470) 기준이다. */}
        <div className="map-page__bg">
          <img className="map-page__map" src={theme.src} alt="" width="360" height="470" />
        </div>
        <div className="map-page__scaled">
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
        {arrived ? (
          <span className="map-page__place map-page__place--arrived" style={at(...ARRIVED_LABEL)}>
            {to} 도착!
          </span>
        ) : (
          <span className="map-page__place" style={atInside(endX, endY - 40, 30, true)}>
            {to}
          </span>
        )}
        <span className="map-page__pin map-page__pin--to" style={at(endX, endY)} />

        {towns.map((town, index) => {
          const [x, y] = pointAt(town.at)
          // 마지막으로 지나는 동네의 이름표는 항상 점 왼쪽에 둔다. 오른쪽에 두면 바로 뒤의 도착 지역 이름과 겹친다.
          const chipWidth = townChipWidth(town.name)
          const onLeft = index === towns.length - 1
          return (
            <Fragment key={town.id}>
              <span
                className={`map-page__town-dot${arrived || town.at <= progress ? ' is-passed' : ''}`}
                style={at(x, y)}
              />
              <span
                className="map-page__town-chip"
                style={atInside(onLeft ? x - 10 - chipWidth : x + 10, y - 12, chipWidth / 2, false)}
              >
                {town.name}
              </span>
            </Fragment>
          )
        })}

        {/* 지금 편지가 있는 곳 */}
        <span className="map-page__rider" style={at(mascotX, mascotY)}>
          <Mascot pose={arrived ? 'smile' : 'face'} size={48} />
        </span>

        {/* 직접 배달하기(→ 9-1 배달 게임). 도착한 뒤에는 시안(4-12-1)에 없고 「○○ 도착!」을 가리므로 숨긴다. */}
        {!arrived && (
          <button
            type="button"
            className="map-page__game"
            onClick={() => navigate(`/delivery-game?letterId=${letterId}`)}
          >
            <Icon name="game" size={24} />
            직접 배달하기
          </button>
        )}

        <button type="button" className="map-page__back" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <Icon name="back" size={24} />
        </button>
        <p className="map-page__title">
          {info.direction === 'incoming' ? `${recipient}님이 보낸 편지` : `${recipient}님에게 가는 편지`}
        </p>
      </div>

      <section className={`map-page__sheet${collapsed ? ' is-collapsed' : ''}`} aria-label="배송 현황">
        {/* 손잡이: 위아래로 끌거나 눌러서 접고 편다. 키보드는 Enter/Space로 눌러서 바꾼다. */}
        <button
          type="button"
          className="map-page__grab"
          aria-label={collapsed ? '배송 현황 펼치기' : '배송 현황 접기'}
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
        <h1 className="map-page__remaining">
          {arrived ? '편지가 도착했어요!' : `도착까지 ${formatRemaining(remainingMinutes)}`}
        </h1>
        {arrived ? (
          <p className="map-page__now">
            {info.direction === 'incoming' ? '내 우체통에 쏙 들어갔어요' : `${recipient}님의 우체통에 쏙 들어갔어요`}
          </p>
        ) : (
          current && (
            <p className="map-page__now">
              지금 {current.name}
              {objectJosa(current.name)} 지나고 있어요
            </p>
          )
        )}
        <div className="map-page__bar">
          <div className="map-page__bar-fill" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="map-page__more" aria-hidden={collapsed}>
          <div className="map-page__more-inner">
            {arrived ? (
              <>
                {/* 보낸 편지만 답장 안내를 보여 준다. 받은 편지는 내 우체통으로 바로 간다. */}
                {info.direction !== 'incoming' && (
                  <div className="map-page__arrived-note">
                    <Mascot pose="smile" size={40} />
                    <p>
                      답장이 오면 우체통에서 알려드릴게요.
                      <br />
                      고향이는 잠깐 쉬러 갈게요!
                    </p>
                  </div>
                )}
                <Button className="map-page__arrived-button" onClick={() => navigate('/mailbox')}>
                  우체통으로 가기
                </Button>
              </>
            ) : (
              <>
                <h2 className="map-page__news-title">편지가 지나가는 동네 소식</h2>
                <ul className="map-page__news">
                  {/* 아이콘은 동네가 아니라 카드 자리가 정한다: 지금 지나는 동네(첫 카드)는 하트, 다음 자리와 도착 지역은 핀.
                      동네를 지나가면 글자만 바뀐다. */}
                  {newsCards.map((town, position) => {
                    const pin = town.destination || position === 1
                    return (
                      <li key={position} className="map-page__news-item">
                        <span className={`map-page__news-icon map-page__news-icon--${pin ? 'sage' : 'peach'}`}>
                          <Icon name={pin ? 'pin' : 'heart'} size={24} />
                        </span>
                        <span className="map-page__news-text">
                          <span className="map-page__news-name">
                            {town.destination ? `${town.name} · 곧 도착해요` : town.name}
                            {town.id === next?.id && ' · 곧 지나요'}
                          </span>
                          <span className="map-page__news-desc">{town.news || '아직 올라온 일기가 없어요'}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

// 개발용 확인 화면(/preview/delivery-map)이 서버 없이 같은 화면을 그리려고 내보낸다.
export { MapView }
export default MapPage
