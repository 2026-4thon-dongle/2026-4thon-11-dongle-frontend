// 지역 API. 명세: 문서 레포 api/regions.md
//   GET /api/regions/  시·도와 시·군·구 트리. 인증이 필요 없고 페이지네이션이 없다.
// 지역은 거의 바뀌지 않아 한 번 받아 두고 같이 쓴다. 실패하면 다음에 다시 받는다.
import { request } from './client.js'

let cached = null
let pending = null

/** 지역 트리를 받는다. 이미 받았으면 받아 둔 값을, 받는 중이면 같은 요청을 기다린다. */
export function fetchRegions() {
  if (cached) return Promise.resolve(cached)
  if (!pending) {
    pending = request('/api/regions/', { auth: false })
      .then((regions) => {
        cached = regions
        return regions
      })
      .finally(() => {
        pending = null
      })
  }
  return pending
}

// 가입·프로필 쪽이 쓰는 이름. 같은 캐시를 쓴다.
export const getRegions = fetchRegions

export async function resolveRegion(region, mode) {
  if (Number.isInteger(region?.id)) return region.id
  const parents = await getRegions()
  const parent = parents.find((item) => item.short_name === region.province || item.name === region.province)
  const normalize = (name) => name.replace(/[시군구]$/, '')
  const selected = !region.district || region.district === '세종 전체' ? parent : parent?.children.find((item) => normalize(item.name) === normalize(region.district))
  if (!selected?.[`can_be_${mode}`]) throw new Error('지역 목록에서 지역을 다시 선택해주세요')
  return selected.id
}
