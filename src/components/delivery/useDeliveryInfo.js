import { useEffect, useState } from 'react'
import { fetchLetterRoute } from '../letter-write/letterApi.js'

// 배송 화면(4-11 발송 완료, 4-12 배송 지도)이 쓰는 배송 정보를 서버에서 받는다.
// 명세: api/letters.md의 POST /api/letters/ 응답, GET /api/letters/{id}/route/
//
// 정보 모양(화면용):
//   { from, to, recipient, sentAt, arrivesAt, direction, mapTheme, towns, grantedStamps }
//   - from, to: 출발·도착 지역 이름(예: '서울 성북구')
//   - recipient: 상대 닉네임
//   - sentAt, arrivesAt: 보낸·도착 시각(ISO 문자열). 남은 시간과 진행률은 이 값으로 화면이 계산한다
//   - direction: 'sent'(내가 보냄) / 'incoming'(나에게 옴)
//   - mapTheme: 'city' | 'sea' | 'mountain' | 'field' | 'river'. 없으면 null
//   - towns: 지나는 동네 [{ id, name, at(0~1 진행률), news, icon, tone }]. 발송 직후 응답에는 없어 빈 배열이다
//   - grantedStamps: 이 편지로 새로 받은 우표 [{ code, number, name, description }]

// 방금 보낸 편지(POST /api/letters/ 응답)를 배송 정보로 바꾼다. 경유지는 없다.
function fromLetter(letter) {
  return {
    from: letter.from_region.full_name,
    to: letter.to_region.full_name,
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
function fromRoute(route) {
  return {
    from: route.from_region.full_name,
    to: route.to_region.full_name,
    recipient: route.partner.nickname,
    sentAt: route.sent_at,
    arrivesAt: route.arrives_at,
    direction: route.direction,
    mapTheme: route.map_theme,
    towns: route.waypoints.map((waypoint, index) => ({
      id: String(waypoint.region.id),
      name: waypoint.region.full_name,
      at: waypoint.progress,
      news: waypoint.story?.body_preview ?? '',
      icon: index % 2 === 0 ? 'heart' : 'pin',
      tone: index % 2 === 0 ? 'peach' : 'sage',
    })),
    grantedStamps: [],
  }
}

/**
 * 배송 정보를 받는다.
 * - letter를 주면(방금 보낸 편지 응답) 서버에 묻지 않고 그 값으로 만든다. 경유지는 없다.
 * - 없으면 GET /api/letters/{id}/route/로 받는다.
 * - 받지 못하면 fallback()의 mock 정보를 쓰고 error에 알린다(서버 없이 화면만 볼 때도 열린다).
 * @param {{ letterId: string, letter?: object, fallback: () => object }} options
 * @returns {{ info: object | null, error: Error | null }} 받는 중에는 info가 null이다.
 */
export default function useDeliveryInfo({ letterId, letter, fallback }) {
  const [state, setState] = useState(() => ({ info: letter ? fromLetter(letter) : null, error: null }))

  useEffect(() => {
    if (letter) return undefined
    let cancelled = false
    fetchLetterRoute(letterId)
      .then((route) => !cancelled && setState({ info: fromRoute(route), error: null }))
      .catch((error) => !cancelled && setState({ info: fallback(), error }))
    return () => {
      cancelled = true
    }
    // 편지가 바뀔 때만 다시 받는다. fallback은 렌더마다 새로 만들어지는 함수이다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letterId, letter])

  return state
}
