// 지역 API. 명세: 문서 레포 api/regions.md
//   GET /api/regions/  시·도와 시·군·구 트리. 인증이 필요 없고 페이지네이션이 없다.
// 지역은 거의 바뀌지 않아 한 번 받아 두고 같이 쓴다. 실패하면 다음에 다시 받는다.
import { request } from './client.js'

let cached = null
let pending = null

/**
 * 지역 트리를 받는다. 이미 받았으면 받아 둔 값을, 받는 중이면 같은 요청을 기다린다.
 * @returns {Promise<Array<{ id: number, name: string, short_name: string, is_metropolitan: boolean,
 *   can_be_hometown: boolean, can_be_residence: boolean,
 *   children: Array<{ id: number, name: string, can_be_hometown: boolean, can_be_residence: boolean }> }>>}
 */
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
