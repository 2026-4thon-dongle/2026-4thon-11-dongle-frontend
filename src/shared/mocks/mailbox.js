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
  chatting: [
    {
      id: 201,
      sender_nickname: '구름빵',
      sender_region: '강릉시',
      stamp: stamp('penpal-friend', '펜팔 친구'),
      travel_minutes: 480,
      arrived_at: '2026-11-02T10:30:00+09:00',
      is_read: false,
      subtitle: '이어지는 편지',
    },
    {
      id: 202,
      sender_nickname: '붕어빵',
      sender_region: '대구시',
      stamp: stamp('first-roundtrip', '첫 왕복'),
      travel_minutes: 300,
      arrived_at: '2026-10-30T16:00:00+09:00',
      is_read: true,
      subtitle: '이어지는 편지',
    },
  ],
  shipping: [
    {
      id: 301,
      sender_nickname: '바다소리',
      sender_region: '여수시',
      stamp: stamp('long-way', '먼 길 배달'),
      travel_minutes: 600,
      arrived_at: '2026-11-11T08:00:00+09:00',
      is_read: true,
      subtitle: '배송 중인 편지',
    },
    {
      id: 302,
      sender_nickname: '돌담길',
      sender_region: '안동시',
      stamp: stamp('first-letter', '첫 편지'),
      travel_minutes: 420,
      arrived_at: '2026-11-10T20:30:00+09:00',
      is_read: true,
      subtitle: '배송 중인 편지',
    },
  ],
  stored: [
    {
      id: 401,
      sender_nickname: '새벽안개',
      sender_region: '통영시',
      stamp: stamp('dawn-letter', '새벽 편지'),
      travel_minutes: 540,
      arrived_at: '2026-10-12T05:50:00+09:00',
      is_read: true,
      subtitle: '보관한 편지',
    },
  ],
}

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
 * @param {{ sort?: 'latest'|'oldest'|'unread' }} [options]
 */
export function getMockMailboxResponse(tab, { sort = 'latest' } = {}) {
  const letters = MOCK_LETTERS[tab] ?? []
  return {
    results: sortLetters(letters, sort),
    next_cursor: null,
    has_next: false,
  }
}
