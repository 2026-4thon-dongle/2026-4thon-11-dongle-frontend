// 우표 고르고 보내기(4-6, 4-7)에 필요한 값을 서버에서 모은다: 내가 가진 우표, 출발·도착 지역, 도착까지 걸리는 시간.
import { fetchLetterEstimate } from './letterApi.js'
import { loadLetterMaterials } from './useLetterMaterials.js'
import { MOCK_ARRIVAL, MOCK_MY_REGION, MOCK_RECEIVER_REGION } from './data.js'
import { MOCK_OWNED_STAMPS } from '../../shared/mocks/stamps.js'

/** 소요 시간(분)을 "약 6시간", "약 1분"처럼 보여 준다. */
export function formatArrival(minutes) {
  if (minutes < 60) return `약 ${minutes}분`
  return `약 ${Math.round(minutes / 60)}시간`
}

// 서버 우표({code, number, name, kind})를 우표 선택 화면이 쓰는 모양({id, name, kind})으로 바꾼다.
// kind는 서버 achievement가 우표 컴포넌트의 basic(기본 우표)이고, decoration은 그대로이다.
const toStampItem = (stamp) => ({
  id: stamp.code,
  name: stamp.name,
  kind: stamp.kind === 'decoration' ? 'decoration' : 'basic',
  owned: true,
})

/**
 * 우표 고르고 보내기 시트에 넣을 값. 서버에서 못 받은 부분은 기존 mock으로 채우고 failed에 알린다
 * (서버 없이 화면만 볼 때도 열린다. 실제로 보낼 때는 서버가 막는다).
 * @param {{ diaryId: number|null, replyTo: number|null }} target 첫 편지면 diaryId, 답장이면 replyTo
 * @returns {Promise<{ stamps: object[], from: string, to: string, arrival: string, failed: Error|null }>}
 */
export async function loadSendInfo({ diaryId, replyTo }) {
  const [materials, estimate] = await Promise.allSettled([
    loadLetterMaterials(),
    diaryId || replyTo ? fetchLetterEstimate({ diaryId, replyTo }) : Promise.reject(new Error('편지를 보낼 대상이 없어요.')),
  ])

  return {
    stamps: materials.status === 'fulfilled' ? materials.value.stamps.map(toStampItem) : MOCK_OWNED_STAMPS,
    from: estimate.status === 'fulfilled' ? estimate.value.from_region.full_name : MOCK_MY_REGION,
    to: estimate.status === 'fulfilled' ? estimate.value.to_region.full_name : MOCK_RECEIVER_REGION,
    arrival: estimate.status === 'fulfilled' ? formatArrival(estimate.value.duration_minutes) : MOCK_ARRIVAL,
    failed: materials.status === 'rejected' ? materials.reason : estimate.status === 'rejected' ? estimate.reason : null,
  }
}
