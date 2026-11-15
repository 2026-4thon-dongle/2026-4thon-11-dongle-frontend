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

// mock 전용: 우체통 대화 중 탭의 "마무리된 대화"(5-3, 감자왕)와 이어지는 상대. 7일 동안 답장이 없어 끝난 대화라 답장 버튼이 없다.
//   is_ended  대화가 끝났는지. 실제 API는 상대별 편지 기록(MAIL-09) 응답에 대화 상태를 담아 줘야 한다. (요청 필요)
// 펜팔 친구 목록(5-14)에는 넣지 않고 5-15 주소(/pen-pal/4)로만 열린다.
const MOCK_ENDED_FRIEND = {
  id: 4,
  nickname: '감자왕',
  region: '강원 춘천',
  letter_count: 3,
  last_letter_at: '2026-10-25T21:10:00+09:00',
  reply_letter_id: 104,
  is_ended: true,
}
const MOCK_ENDED_LETTERS = [
  { id: 'e1', kind: 'diary', at: '2026-10-20T09:00:00+09:00', preview: '소양강 노을을 보며 쓴 일기예요', stamp_code: 'first-diary' },
  { id: 'e2', kind: 'received', at: '2026-10-22T10:00:00+09:00', preview: '춘천 하늘이 정말 예뻤어요', stamp_code: 'first-letter' },
  { id: 'e3', kind: 'sent', at: '2026-10-23T20:30:00+09:00', preview: '노을 사진 잘 봤어요! 닭갈비 맛집이 궁금해요', stamp_code: 'first-roundtrip' },
  { id: 'e4', kind: 'received', at: '2026-10-25T21:10:00+09:00', preview: '답장 고마워요! 닭갈비 맛집은 다음 편지에 알려 줄게요', stamp_code: 'first-roundtrip' },
]

/** 없는 친구면 null. */
export async function fetchPenPalLetters(friendId) {
  const friend = [...MOCK_PEN_PALS.results, MOCK_ENDED_FRIEND].find((item) => String(item.id) === String(friendId))
  if (!friend) return null
  const entries = friend === MOCK_ENDED_FRIEND ? MOCK_ENDED_LETTERS : (MOCK_PEN_PAL_LETTERS[friend.id] ?? [])
  return toPenPalLetters(friend, entries)
}
