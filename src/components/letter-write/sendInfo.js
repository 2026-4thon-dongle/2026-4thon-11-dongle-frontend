// 우표 고르고 보내기(4-6, 4-7)에 필요한 값을 서버에서 모은다: 내가 가진 우표, 출발·도착 지역, 도착까지 걸리는 시간.
import { fetchLetterEstimate, fetchStampList } from './letterApi.js'
import { loadLetterMaterials } from './useLetterMaterials.js'
import {
  MOCK_ARRIVAL,
  MOCK_MY_REGION,
  MOCK_RECEIVER_REGION,
  SEASONAL_STAMP_NUMBERS,
  STAMP_LOCK_HINTS,
  stampArtIdOf,
} from './data.js'
import { MOCK_OWNED_STAMPS } from '../../shared/mocks/stamps.js'

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

// 서버에서 못 받았을 때(서버 없이 화면만 볼 때) 보여 주는 mock 잠금 우표
const MOCK_LOCKED_STAMP = { id: 'first-roundtrip', art: 'first-roundtrip', name: '첫 왕복', hint: STAMP_LOCK_HINTS[4] }

/**
 * 우표 고르고 보내기 시트에 넣을 값. 서버에서 못 받은 부분은 기존 mock으로 채우고 failed에 알린다
 * (서버 없이 화면만 볼 때도 열린다. 실제로 보낼 때는 서버가 막는다).
 * @param {{ diaryId: number|null, replyTo: number|null }} target 첫 편지면 diaryId, 답장이면 replyTo
 * @returns {Promise<{ stamps: object[], lockedStamp: object|null, from: string, to: string, arrival: string, failed: Error|null }>}
 *   lockedStamp: 다음에 받을 우표 { id, art, name, hint }. 없으면 null
 */
export async function loadSendInfo({ diaryId, replyTo }) {
  const [materials, estimate, stampList] = await Promise.allSettled([
    loadLetterMaterials(),
    diaryId || replyTo ? fetchLetterEstimate({ diaryId, replyTo }) : Promise.reject(new Error('편지를 보낼 대상이 없어요.')),
    fetchStampList('achievement'),
  ])

  return {
    stamps: materials.status === 'fulfilled' ? materials.value.stamps.map(toStampItem) : MOCK_OWNED_STAMPS,
    lockedStamp: stampList.status === 'fulfilled' ? findLockedStamp(stampList.value.stamps) : MOCK_LOCKED_STAMP,
    from: estimate.status === 'fulfilled' ? estimate.value.from_region.full_name : MOCK_MY_REGION,
    to: estimate.status === 'fulfilled' ? estimate.value.to_region.full_name : MOCK_RECEIVER_REGION,
    arrival: estimate.status === 'fulfilled' ? formatArrival(estimate.value.duration_minutes) : MOCK_ARRIVAL,
    failed: materials.status === 'rejected' ? materials.reason : estimate.status === 'rejected' ? estimate.reason : null,
  }
}
