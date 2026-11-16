// 펜팔 mock 모드(VITE_API_MOCK=true, 개발 전용). 서버 호출은 penPalApi.js가 한다.
// shared/mocks/penPal.js의 옛 mock 모양을 서버 응답 모양(api/mailbox.md)으로 바꿔 mapper에 넘긴다.
// mock에서는 대화 id를 친구 id(1~4)와 같게 둔다. 우체통 대화 중 카드(mailboxDemo.js)가 같은 id로 /pen-pal/:id에 연결한다.
import { MOCK_PEN_PALS, MOCK_PEN_PAL_LETTERS } from '../../shared/mocks/penPal.js'
import { toPenPalList, toPenPalLetters } from './penPalMapper.js'

// 우체통 대화 중 탭의 "마무리된 대화"(감자왕)와 이어지는 상대. 7일 동안 답장이 없어 끝난 대화라 reply_to가 없다.
// 펜팔 친구 목록(5-14)에는 넣지 않고 5-15 주소(/pen-pal/4)로만 열린다.
const MOCK_ENDED_FRIEND = {
  id: 4,
  nickname: '감자왕',
  region: '강원 춘천',
  letter_count: 3,
  last_letter_at: '2026-10-25T21:10:00+09:00',
  reply_letter_id: null,
}
const MOCK_ENDED_LETTERS = [
  { id: 'e1', kind: 'diary', at: '2026-10-20T09:00:00+09:00', preview: '소양강 노을을 보며 쓴 일기예요', stamp_code: 'first-diary' },
  { id: 'e2', kind: 'received', at: '2026-10-22T10:00:00+09:00', preview: '춘천 하늘이 정말 예뻤어요', stamp_code: 'first-letter' },
  { id: 'e3', kind: 'sent', at: '2026-10-23T20:30:00+09:00', preview: '노을 사진 잘 봤어요! 닭갈비 맛집이 궁금해요', stamp_code: 'first-roundtrip' },
  { id: 'e4', kind: 'received', at: '2026-10-25T21:10:00+09:00', preview: '답장 고마워요! 닭갈비 맛집은 다음 편지에 알려 줄게요', stamp_code: 'first-roundtrip' },
]

const partnerOf = (friend) => ({ id: friend.id, nickname: friend.nickname, avatar: null, region: { full_name: friend.region } })

/** 펜팔 친구 목록 mock. 한 번에 다 주므로 다음 페이지는 없다. */
export async function fetchDemoPenPals({ empty = false } = {}) {
  const results = empty
    ? []
    : MOCK_PEN_PALS.results.map((friend) => ({
        partner: partnerOf(friend),
        conversation_id: friend.id,
        letter_count: friend.letter_count,
        last_letter_at: friend.last_letter_at,
      }))
  return toPenPalList({ count: results.length, next: null, previous: null, results })
}

/** 없는 대화면 null. */
export async function fetchDemoPenPalLetters(conversationId) {
  const friend = [...MOCK_PEN_PALS.results, MOCK_ENDED_FRIEND].find((item) => String(item.id) === String(conversationId))
  if (!friend) return null
  const ended = friend === MOCK_ENDED_FRIEND
  const entries = ended ? MOCK_ENDED_LETTERS : (MOCK_PEN_PAL_LETTERS[friend.id] ?? [])
  const diary = entries.find((entry) => entry.kind === 'diary')
  return toPenPalLetters({
    id: friend.id,
    partner: partnerOf(friend),
    status: ended ? 'closed' : 'my_turn',
    letter_count: friend.letter_count,
    diary: diary ? { id: diary.id, author: { id: 0, nickname: '나' }, body_preview: diary.preview, created_at: diary.at } : null,
    letters: entries
      .filter((entry) => entry.kind !== 'diary')
      .map((entry) => ({
        id: entry.id,
        direction: entry.kind,
        preview: entry.preview,
        stamp: { code: entry.stamp_code },
        sent_at: entry.at,
        arrived_at: entry.at,
      })),
    reply_to: friend.reply_letter_id,
  })
}
