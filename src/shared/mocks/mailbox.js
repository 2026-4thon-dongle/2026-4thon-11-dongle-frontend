// 우체통(5-1) 목 데이터(mock).
// mock, 문서 레포 API 확정 전, Notion 초안 참고.
//   - 문서 레포 `api/`에는 편지(letters) 문서가 아직 없다. 백엔드가 Notion에 올린 초안의 "내용"만 참고했고,
//     필드 이름은 문서 레포 컨벤션(snake_case)을 따랐다.
//   - 탭마다 API가 따로 있다는 초안에 맞춰 mock도 탭별로 나눴다. (new / chatting / shipping / stored)
//   - 응답 모양: { results, next_cursor, has_next } (Notion 초안). 문서 레포 공통 규칙의 목록 형식
//     ({count, next, previous, results})과 다르므로 확정되면 mailboxMapper.js만 고친다.
//   - 화면은 이 데이터를 직접 쓰지 않고 components/mailbox/mailboxMapper.js의 변환 함수를 거친다.
//
// 카드 필드 (Notion 초안 내용):
//   id               편지 id
//   sender_nickname  보낸 사람 닉네임 ("From. "은 화면에서 붙인다)
//   sender_region    보낸 사람 지역
//   stamp            { code, name, image_url } 우표. image_url은 초안에서 이미지 URL로 온다.
//                    우리 Stamp 컴포넌트는 code(assets/stamp 파일 이름)로 그린다. shared/mocks/stamps.js의 id와 같다.
//   travel_minutes   배송에 걸린 시간(분)
//   arrived_at       도착 시각 (ISO 8601, 한국 시간)
//   is_read          읽음 여부
//   subtitle         ※ mock 전용. Notion 초안에 없는 필드라 시안의 "첫 편지 · 일기 답장" 문구를 보여 주려고 넣었다.
//                    실제 API에 없으면 카드에서 이 줄이 사라진다.

export const MAILBOX_TABS = ['new', 'chatting', 'shipping', 'stored']

export const MAILBOX_SORTS = ['latest', 'oldest', 'unread']

const stamp = (code, name) => ({ code, name, image_url: null })

const MOCK_LETTERS = {
  new: [
    {
      id: 101,
      sender_nickname: '하늘빛',
      sender_region: '전주시',
      stamp: stamp('steady-letter', '꾸준한 편지'),
      travel_minutes: 360,
      arrived_at: '2026-10-31T14:20:00+09:00',
      is_read: false,
      subtitle: '첫 편지 · 일기 답장',
    },
    {
      id: 102,
      sender_nickname: '갈매기',
      sender_region: '부산시',
      stamp: stamp('first-diary', '첫 일기'),
      travel_minutes: 720,
      arrived_at: '2026-10-29T09:05:00+09:00',
      is_read: false,
      subtitle: '첫 편지 · 일기 답장',
    },
    {
      id: 103,
      sender_nickname: '귤껍질',
      sender_region: '제주시',
      stamp: stamp('first-letter', '첫 편지'),
      travel_minutes: 720,
      arrived_at: '2026-10-27T18:40:00+09:00',
      is_read: true,
      subtitle: '첫 편지 · 일기 답장',
    },
    {
      id: 104,
      sender_nickname: '감자왕',
      sender_region: '춘천시',
      stamp: stamp('first-roundtrip', '첫 왕복'),
      travel_minutes: 360,
      arrived_at: '2026-10-25T21:10:00+09:00',
      is_read: true,
      subtitle: '첫 편지 · 일기 답장',
    },
  ],
  // 대화 중(5-3): Notion 초안에 없는 필드가 많다. 시안을 보여 주려고 mock에만 아래 필드를 넣었다. (API 확정 시 요청 필요)
  //   status                'my_turn'(내 차례) | 'waiting_reply'(답장 기다리는 중) | 'in_transit'(배송 중) | 'ended'(7일간 답장 없어 마무리)
  //   last_message_preview  상대가 보낸 마지막 편지 한 줄 (my_turn일 때 보여 준다)
  //   round_trip_count      주고받은 왕복 횟수
  //   arrived_at            (waiting_reply) 내가 보낸 편지의 도착 시각
  //   remaining_minutes     (in_transit) 도착까지 남은 시간(분)
  chatting: [
    {
      id: 500,
      sender_nickname: '하늘빛',
      sender_region: '충남 천안',
      status: 'my_turn',
      last_message_preview: '성북 동네 이야기도 더 들려줘요!',
      round_trip_count: 2,
    },
    {
      id: 501,
      sender_nickname: '갈매기',
      sender_region: '부산 수영',
      status: 'waiting_reply',
      arrived_at: '2026-11-03T12:00:00+09:00',
      round_trip_count: 1,
    },
    {
      id: 502,
      sender_nickname: '귤껍질',
      sender_region: '제주 서귀포',
      status: 'in_transit',
      remaining_minutes: 660,
      round_trip_count: 1,
    },
    {
      id: 503,
      sender_nickname: '감자왕',
      sender_region: '강원 춘천',
      status: 'ended',
      round_trip_count: 0,
    },
  ],
  // 배송 중(5-5): Notion 초안에 없는 필드를 시안에 맞춰 mock에만 넣었다. (API 확정 시 요청 필요)
  //   direction          'sent'(내가 보냄, "To.") | 'received'(나에게 오는 중, "From.")
  //   counterpart_nickname  상대 닉네임
  //   from_region / to_region  출발·도착 지역
  //   travel_minutes     배송에 걸리는 전체 시간(분), remaining_minutes 남은 시간(분) → 진행률을 여기서 계산한다
  shipping: [
    {
      id: 601,
      direction: 'sent',
      counterpart_nickname: '하늘빛',
      from_region: '서울',
      to_region: '충남',
      stamp: stamp('dawn-letter', '새벽 편지'),
      travel_minutes: 400,
      remaining_minutes: 341,
    },
    {
      id: 602,
      direction: 'received',
      counterpart_nickname: '갈매기',
      from_region: '부산',
      to_region: '서울',
      stamp: stamp('long-way', '먼 길 배달'),
      travel_minutes: 1220,
      remaining_minutes: 672,
    },
    {
      id: 603,
      direction: 'sent',
      counterpart_nickname: '귤껍질',
      from_region: '서울',
      to_region: '제주',
      stamp: stamp('handwriting-master', '손글씨 장인'),
      travel_minutes: 884,
      remaining_minutes: 663,
    },
  ],
  // 보관(5-7): 역시 Notion 초안에 없는 필드를 mock에 넣었다.
  //   kind       'passed_letter'(넘긴 편지) | 'ended_chat'(마무리된 대화)
  //   stored_at  보관된 날짜
  stored: [
    {
      id: 701,
      kind: 'passed_letter',
      sender_nickname: '별빛',
      sender_region: '경북 경주',
      stamp: stamp('penpal-friend', '펜팔 친구'),
      stored_at: '2026-11-01T10:00:00+09:00',
    },
    {
      id: 702,
      kind: 'ended_chat',
      sender_nickname: '감자왕',
      sender_region: '강원 춘천',
      stamp: stamp('dawn-letter', '새벽 편지'),
      stored_at: '2026-10-25T10:00:00+09:00',
    },
    {
      id: 703,
      kind: 'passed_letter',
      sender_nickname: '바람',
      sender_region: '전남 여수',
      stamp: stamp('long-way', '먼 길 배달'),
      stored_at: '2026-10-20T10:00:00+09:00',
    },
  ],
}

// 정렬은 새 편지 탭(5-1의 칩)에서만 쓴다. 다른 탭은 서버가 준 순서 그대로 보여 준다.
function sortLetters(letters, sort) {
  const byLatest = (a, b) => new Date(b.arrived_at) - new Date(a.arrived_at)
  const copied = [...letters]
  if (sort === 'oldest') return copied.sort((a, b) => -byLatest(a, b))
  if (sort === 'unread') {
    return copied.sort((a, b) => Number(a.is_read) - Number(b.is_read) || byLatest(a, b))
  }
  return copied.sort(byLatest)
}

/**
 * 탭별 목록 응답을 흉내 낸다. 실제 API가 정해지면 이 함수 대신 서버 요청을 쓴다.
 * 커서 페이지네이션은 mock에서 한 번에 다 내려 주므로 항상 다음 페이지가 없다.
 * @param {'new'|'chatting'|'shipping'|'stored'} tab
 * @param {{ sort?: 'latest'|'oldest'|'unread', empty?: boolean }} [options] empty: true면 비었을 때 화면(5-2, 5-4) 확인용으로 빈 목록을 준다.
 */
export function getMockMailboxResponse(tab, { sort = 'latest', empty = false } = {}) {
  const letters = empty ? [] : (MOCK_LETTERS[tab] ?? [])
  return {
    results: tab === 'new' ? sortLetters(letters, sort) : letters,
    next_cursor: null,
    has_next: false,
  }
}
