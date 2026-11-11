// 펜팔 요청(5-14, 5-15). mock, 문서 레포 API 확정 전. 문서 레포 `api/`에 편지·펜팔 API가 없어 요청 주소를 정하지 않았다.
// 지금은 shared/mocks/penPal.js를 돌려주고, API가 정해지면 이 함수 안에서 서버를 호출한다.
//   MAIL-08 펜팔 친구 목록 → fetchPenPals
//   MAIL-09 상대별 주고받은 편지 → fetchPenPalLetters
// 반환값은 항상 penPalMapper의 화면용 데이터이다.
import { MOCK_PEN_PALS, MOCK_PEN_PAL_LETTERS } from '../../shared/mocks/penPal.js'
import { toPenPalList, toPenPalLetters } from './penPalMapper.js'

/**
 * @param {{ empty?: boolean }} [options] empty: true면 펜팔 친구가 없는 상태(개발 확인용)
 */
export async function fetchPenPals({ empty = false } = {}) {
  return toPenPalList(empty ? { results: [] } : MOCK_PEN_PALS)
}

/** 없는 친구면 null. */
export async function fetchPenPalLetters(friendId) {
  const friend = MOCK_PEN_PALS.results.find((item) => String(item.id) === String(friendId))
  if (!friend) return null
  return toPenPalLetters(friend, MOCK_PEN_PAL_LETTERS[friend.id] ?? [])
}
