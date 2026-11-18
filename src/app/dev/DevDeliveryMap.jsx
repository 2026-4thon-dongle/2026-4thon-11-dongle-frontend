// 개발·QA용 확인 화면 — 실시간 배송 지도(4-12)를 서버 없이 상태별로 본다.
// /preview/delivery-map 에서 고르고, /preview/delivery-map?case=이름 으로 바로 열 수도 있다.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapView } from '../../pages/delivery/MapPage.jsx'

const MINUTE = 60_000

// 제주 → 인천: 시·도 단위로 다섯 동네를 지난다(전남, 광주, 전북, 충남, 인천).
const JEJU_TO_INCHEON = {
  from: '제주',
  to: '인천 중구',
  toSido: '인천',
  recipient: '하늘빛',
  direction: 'sent',
  mapTheme: 'sea',
  totalMinutes: 720,
  towns: [
    { id: 'jeonnam', name: '전남', sido: '전남', at: 0.2, news: '' },
    { id: 'gwangju', name: '광주', sido: '광주', at: 0.4, news: '' },
    { id: 'jeonbuk', name: '전북', sido: '전북', at: 0.55, news: '' },
    { id: 'chungnam', name: '충남', sido: '충남', at: 0.7, news: '' },
    { id: 'incheon', name: '인천', sido: '인천', at: 0.9, news: '' },
  ],
}

// 서울 → 충남: 경유지가 경기 하나뿐이라 지나고 나면 다음 동네가 없다.
const SEOUL_TO_CHUNGNAM = {
  from: '서울 성북',
  to: '충남 천안',
  toSido: '충남',
  recipient: '하늘빛',
  direction: 'sent',
  mapTheme: 'city',
  totalMinutes: 360,
  towns: [{ id: 'gyeonggi', name: '경기', sido: '경기', at: 0.45, news: '' }],
}

// 서울 → 서울: 같은 시·도끼리라 지나는 동네가 없다.
const SAME_SIDO = { ...SEOUL_TO_CHUNGNAM, to: '서울 강남', toSido: '서울', mapTheme: 'river', totalMinutes: 60, towns: [] }

// elapsed: 보낸 지 지난 분. 도착 상태는 도착 시각이 지나도록 크게 잡는다.
const CASES = {
  moving: { label: '이동 중 · 지금 지나는 동네와 다음 동네 카드 2장', base: JEJU_TO_INCHEON, elapsed: 360 },
  'last-town': { label: '마지막 동네를 지나는 중 · 다음 자리에 도착지 카드', base: JEJU_TO_INCHEON, elapsed: 640 },
  'one-town': { label: '경유지 1곳 · 지나면 다음 자리에 도착지 카드', base: SEOUL_TO_CHUNGNAM, elapsed: 160 },
  'same-sido': { label: '같은 시·도(서울 → 서울) · 도착지 카드 1장, 시트 낮음', base: SAME_SIDO, elapsed: 30 },
  arrived: { label: '도착 완료 · 4-12-1', base: JEJU_TO_INCHEON, elapsed: 800 },
  'arrived-incoming': { label: '받은 편지 도착 완료', base: { ...JEJU_TO_INCHEON, direction: 'incoming' }, elapsed: 800 },
}

// 보낸 시각과 도착 시각을 지금 기준으로 만든다. 화면을 연 순간부터 시간이 흐른다.
function buildInfo({ base, elapsed }) {
  const now = Date.now()
  const { totalMinutes, ...info } = base
  return {
    ...info,
    sentAt: new Date(now - elapsed * MINUTE).toISOString(),
    arrivesAt: new Date(now - elapsed * MINUTE + totalMinutes * MINUTE).toISOString(),
    grantedStamps: [],
  }
}

function MapCase({ name }) {
  const [info] = useState(() => buildInfo(CASES[name]))
  return <MapView info={info} letterId="preview" />
}

export default function DevDeliveryMap() {
  const [params] = useSearchParams()
  const name = params.get('case')
  if (name && CASES[name]) return <MapCase key={name} name={name} />
  return (
    <main style={{ display: 'grid', gap: 12, padding: 24 }}>
      <h1 className="text-title-20" style={{ margin: 0 }}>실시간 배송 지도 (확인용)</h1>
      <p className="text-body-13" style={{ margin: 0 }}>서버 없이 가짜 배송 정보로 4-12를 봅니다. 화면을 연 순간부터 시간이 흐릅니다.</p>
      <ul className="text-body-15" style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>
        {Object.entries(CASES).map(([key, item]) => (
          <li key={key}><Link to={`/preview/delivery-map?case=${key}`}>{item.label}</Link></li>
        ))}
      </ul>
    </main>
  )
}
