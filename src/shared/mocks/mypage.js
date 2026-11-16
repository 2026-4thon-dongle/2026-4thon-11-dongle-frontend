// 마이(7-1, 7-3, 7-11, 7-12) 목 데이터(mock). VITE_API_MOCK=true인 개발 환경에서만 쓴다(components/mypage/mypageDemo.js).
// 모든 값은 서버 응답 모양이다. 문서 레포 api/users.md, api/letters.md, api/safety.md를 따른다.
// 우표·보상 mock은 stampCollection.js에 있다.

// GET /api/users/me/ 응답.
// - 지역 id는 임의의 값이다(GET /api/regions/의 실제 id와 다를 수 있다).
// - stats.stamp_count는 mock에서 우표 mock 개수(stampCollection.js)와 맞춘다.
export const MOCK_ME = {
  id: 1,
  email: 'dain@sungshin.ac.kr',
  nickname: '다인',
  school_verified: true,
  school_name: '성신여대',
  hometowns: [
    { id: 148, name: '천안시', full_name: '충남 천안시' },
    { id: 149, name: '아산시', full_name: '충남 아산시' },
    { id: 31, name: '대전광역시', full_name: '대전광역시' },
  ],
  residence: { id: 19, name: '성북구', full_name: '서울 성북구' },
  first_diary_completed: true,
  avatar: 'cat-basic',
  stats: {
    diary_count: 12,
    letter_count: 8,
    stamp_count: 8,
    penpal_count: 3,
    draft_count: 2,
  },
}

// GET /api/users/me/settings/ 응답(6개 필드).
export const MOCK_SETTINGS = {
  letter_paused: false,
  push_enabled: true,
  daily_digest_enabled: true,
  weekly_prompt_enabled: true,
  letter_arrival_push_enabled: true,
  letter_departure_push_enabled: false,
}

// GET /api/letters/drafts/ 의 results[] 항목. kind: first(일기에 보내는 첫 편지) | reply(받은 편지에 답장)
export const MOCK_DRAFTS = [
  {
    id: 1,
    kind: 'first',
    diary_id: 12,
    reply_to: null,
    recipient: { id: 21, nickname: '하늘빛' },
    body_preview: '그 호수, 제가 고등학생 때 매일 지나던 곳이에요! 붕어빵 아저씨는 아직도 그 자리에 계실까요? 사진을 보니 갑자기 그 겨울이 떠올라서',
    body_length: 86,
    saved_at: '2026-11-06T21:30:00+09:00',
  },
  {
    id: 2,
    kind: 'reply',
    diary_id: null,
    reply_to: 102,
    recipient: { id: 22, nickname: '갈매기' },
    body_preview: '광안리 새벽 산책 사진 보고 바다가 너무 보고 싶어졌어요',
    body_length: 32,
    saved_at: '2026-11-04T23:10:00+09:00',
  },
]

// 닉네임 중복 확인(7-9) mock. 서버가 판단하는 일이라 개발 모드에서만 쓴다.
export const MOCK_TAKEN_NICKNAMES = ['하늘빛', '갈매기', '귤껍질', '감자왕', '별빛', '바람']

// GET /api/blocks/ 의 results[] 항목. residence는 상대의 거주 지역(없으면 null).
export const MOCK_BLOCKS = [
  { user: { id: 31, nickname: '별빛', residence: { id: 90, name: '경주시', full_name: '경북 경주시' } }, created_at: '2026-11-01T20:00:00+09:00' },
  { user: { id: 44, nickname: '바람', residence: { id: 120, name: '여수시', full_name: '전남 여수시' } }, created_at: '2026-10-20T09:30:00+09:00' },
]
