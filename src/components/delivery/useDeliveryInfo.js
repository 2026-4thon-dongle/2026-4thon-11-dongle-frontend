import { useEffect, useState } from 'react'
import { METROPOLITAN } from '../../shared/region/regions.js'
import { fetchRegions } from '../../shared/api/regions.js'
import { fetchLetterRoute } from '../letter-write/letterApi.js'

// 배송 화면(4-11 발송 완료, 4-12 배송 지도)이 쓰는 배송 정보를 서버에서 받는다.
// 명세: api/letters.md의 POST /api/letters/ 응답, GET /api/letters/{id}/route/
//
// 정보 모양(화면용):
//   { from, to, recipient, sentAt, arrivesAt, direction, mapTheme, towns, grantedStamps }
//   - from, to: 출발·도착 지역 이름(시안처럼 줄여서 '서울 성북'). toSido: 도착 시·도 약칭('서울', 지도의 도착지 소식에 쓴다)
//   - recipient: 상대 닉네임
//   - sentAt, arrivesAt: 보낸·도착 시각(ISO 문자열). 남은 시간과 진행률은 이 값으로 화면이 계산한다
//   - direction: 'sent'(내가 보냄) / 'incoming'(나에게 옴)
//   - mapTheme: 'city' | 'sea' | 'mountain' | 'field' | 'river'. 없으면 null
//   - towns: 지나는 동네 [{ id, name, sido(시·도 약칭), at(0~1 진행률), news }]. 발송 직후 응답에는 없어 빈 배열이다
//   - grantedStamps: 이 편지로 새로 받은 우표 [{ code, number, name, description }]

// 서버 지역({ name, full_name, sido })을 시안의 화면 이름으로 줄인다(서울 성북구 → 서울 성북, 충남 천안시 → 충남 천안).
// 시·도 이름만 있는 지역(세종 등)은 full_name을 그대로 쓴다.
// 광역시는 구만 뗀다(성북구 → 성북, 군·두 글자 구는 그대로). 도는 시·군을 뗀다(천안시 → 천안). 떼고 한 글자가 남으면 그대로 둔다.
function regionName(region) {
  if (!region.sido || region.name === region.sido || !region.full_name.includes(' ')) return region.full_name
  const suffix = METROPOLITAN.includes(region.sido) ? /구$/ : /[시군]$/
  const stripped = region.name.replace(suffix, '')
  return `${region.sido} ${stripped.length >= 2 ? stripped : region.name}`
}

// 배송 지도(4-12)의 동네 이름. 경유지는 시·도 단위로 와서 이름이 길다(전라남도, 광주광역시).
// 지도에서는 시안처럼 줄임말(전남, 광주)을 쓰므로 지역 목록(GET /api/regions/)의 short_name으로 바꾼다.
// 지역 목록을 못 받았거나 시·도가 아니면 위의 regionName을 쓴다.
function townName(region, provinces) {
  const province = provinces?.find(
    (item) => item.id === region.id || item.name === region.name || item.name === region.full_name,
  )
  return province ? province.short_name : regionName(region)
}

// 방금 보낸 편지(POST /api/letters/ 응답)를 배송 정보로 바꾼다. 경유지는 없다.
function fromLetter(letter) {
  return {
    from: regionName(letter.from_region),
    to: regionName(letter.to_region),
    toSido: letter.to_region.sido ?? '',
    recipient: letter.recipient.nickname,
    sentAt: letter.sent_at,
    arrivesAt: letter.arrives_at,
    direction: 'sent',
    mapTheme: null,
    towns: [],
    grantedStamps: letter.granted_stamps ?? [],
  }
}

// 배송 경로 응답을 배송 정보로 바꾼다. 경유지의 일기 한 줄이 동네 소식이다.
function fromRoute(route, provinces) {
  return {
    from: regionName(route.from_region),
    to: regionName(route.to_region),
    toSido: route.to_region.sido ?? '',
    recipient: route.partner.nickname,
    sentAt: route.sent_at,
    arrivesAt: route.arrives_at,
    direction: route.direction,
    mapTheme: route.map_theme,
    towns: route.waypoints.map((waypoint) => ({
      id: String(waypoint.region.id),
      name: townName(waypoint.region, provinces),
      sido: waypoint.region.sido ?? '',
      at: waypoint.progress,
      news: waypoint.story?.body_preview ?? '',
    })),
    grantedStamps: [],
  }
}

/**
 * 배송 정보를 받는다.
 * - letter를 주면(방금 보낸 편지 응답) 서버에 묻지 않고 그 값으로 만든다. 경유지는 없다.
 * - 없으면 GET /api/letters/{id}/route/로 받는다.
 * - 받지 못하면 info는 null이고 error에 서버 에러(ApiError)가 담긴다. retry()로 다시 받는다.
 * @param {{ letterId: string, letter?: object }} options
 * @returns {{ info: object | null, error: Error | null, retry: () => void }} 받는 중에는 info와 error가 모두 null이다.
 */
export default function useDeliveryInfo({ letterId, letter }) {
  const [state, setState] = useState(() => ({ info: letter ? fromLetter(letter) : null, error: null }))
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (letter) return undefined
    let cancelled = false
    // 지역 목록은 동네 이름을 줄이는 데만 쓴다. 못 받아도 지도는 그려야 하므로 실패는 무시한다.
    Promise.all([fetchLetterRoute(letterId), fetchRegions().catch(() => null)])
      .then(([route, provinces]) => !cancelled && setState({ info: fromRoute(route, provinces), error: null }))
      .catch((error) => !cancelled && setState({ info: null, error }))
    return () => {
      cancelled = true
    }
  }, [letterId, letter, attempt])

  const retry = () => {
    setState({ info: null, error: null })
    setAttempt((value) => value + 1)
  }

  return { ...state, retry }
}
