// 우표 고르고 보내기(4-6, 4-7)에 필요한 값을 서버에서 모은다: 내가 가진 우표, 출발·도착 지역, 도착까지 걸리는 시간.
import { fetchLetterEstimate, fetchStampList } from './letterApi.js'
import { loadLetterMaterials } from './useLetterMaterials.js'
import { SEASONAL_STAMP_NUMBERS, STAMP_LOCK_HINTS, stampArtIdOf } from './data.js'

/** 소요 시간(분)을 "약 6시간", "약 1분"처럼 보여 준다. */
export function formatArrival(minutes) {
  if (minutes < 60) return `약 ${minutes}분`
  return `약 ${Math.round(minutes / 60)}시간`
}

// 서버 우표({code, number, name, kind})를 우표 선택 화면이 쓰는 모양({id, art, name, kind})으로 바꾼다.
// id는 서버 코드(보낼 때 쓴다), art는 우표 그림 id이다. kind는 서버 achievement가 우표 컴포넌트의 basic(기본 우표)이고, decoration은 그대로이다.
const toStampItem = (stamp) => ({
  id: stamp.code,
  art: stampArtIdOf(stamp.code),
  name: stamp.name,
  kind: stamp.kind === 'decoration' ? 'decoration' : 'basic',
  owned: true,
})

// 「다음에 받을 우표」: 아직 못 받은 업적 우표 중 번호가 가장 빠른 것 1개. 시즌·기간 한정 우표는 건너뛴다(시안 4-6-2).
// 다 모았으면 null이라 잠금 칸을 보여 주지 않는다.
function findLockedStamp(stamps) {
  const next = stamps
    .filter((stamp) => !stamp.owned && !SEASONAL_STAMP_NUMBERS.includes(stamp.number) && STAMP_LOCK_HINTS[stamp.number])
    .sort((a, b) => a.number - b.number)[0]
  if (!next) return null
  return { id: next.code, art: stampArtIdOf(next.code), name: next.name, hint: STAMP_LOCK_HINTS[next.number] }
}

/**
 * 우표 고르고 보내기 시트에 넣을 값. 우표(materials)와 도착 정보(estimate)는 꼭 필요해서 못 받으면 에러를 던진다.
 * 「다음에 받을 우표」(우표 목록)만 못 받아도 시트는 열리고, 잠금 칸만 보이지 않는다.
 * @param {{ diaryId: number|null, replyTo: number|null }} target 첫 편지면 diaryId, 답장이면 replyTo
 * @returns {Promise<{ stamps: object[], lockedStamp: object|null, from: string, to: string, arrival: string }>}
 *   lockedStamp: 다음에 받을 우표 { id, art, name, hint }. 없으면 null
 * @throws {Error} 우표나 도착 정보를 받지 못했을 때(서버 에러 그대로)
 */
export async function loadSendInfo({ diaryId, replyTo }) {
  if (!diaryId && !replyTo) throw new Error('편지를 보낼 대상이 없어요.')
  const [materials, estimate, stampList] = await Promise.allSettled([
    loadLetterMaterials(),
    fetchLetterEstimate({ diaryId, replyTo }),
    fetchStampList('achievement'),
  ])
  if (materials.status === 'rejected') throw materials.reason
  if (estimate.status === 'rejected') throw estimate.reason

  return {
    stamps: materials.value.stamps.map(toStampItem),
    lockedStamp: stampList.status === 'fulfilled' ? findLockedStamp(stampList.value.stamps) : null,
    from: estimate.value.from_region.full_name,
    to: estimate.value.to_region.full_name,
    arrival: formatArrival(estimate.value.duration_minutes),
  }
}
