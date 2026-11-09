// 마이(7-1, 7-3) 목 데이터(mock). 문서 레포 API 확정 전이며 화면 확인용이다.
//
// 문서 레포에 명세가 있는 것은 그 필드 이름을 그대로 쓴다. (api/users.md, 2026-11-09 초안)
//   MOCK_ME        GET /api/users/me/            nickname, school_verified, hometowns[], residence, stats{...}
//   MOCK_SETTINGS  GET /api/users/me/settings/   letter_paused, push_enabled, daily_digest_enabled, weekly_prompt_enabled
// 명세에 없는 것은 "mock 전용"이라고 따로 표시했다. 서버가 주지 않으면 화면에서 그 부분이 사라지거나 비게 된다.

// GET /api/users/me/ 응답 모양.
// - 지역 id는 임의의 값이다(GET /api/regions/의 실제 id와 다를 수 있다).
// - stats의 letter_count, penpal_count, draft_count는 명세상 편지 앱이 연결되기 전까지 0이다. 시안(7-1)을 보여 주려고 mock에서만 0이 아닌 값을 넣었다.
export const MOCK_ME = {
  id: 1,
  email: 'dain@sungshin.ac.kr',
  nickname: '다인',
  school_verified: true,
  hometowns: [
    { id: 148, name: '천안시', full_name: '충남 천안시' },
    { id: 149, name: '아산시', full_name: '충남 아산시' },
    { id: 31, name: '대전광역시', full_name: '대전광역시' },
  ],
  residence: { id: 19, name: '성북구', full_name: '서울 성북구' },
  first_diary_completed: true,
  stats: {
    diary_count: 12,
    letter_count: 8,
    stamp_count: 5,
    penpal_count: 3,
    draft_count: 2,
  },
}

// mock 전용(명세에 없음):
//   school_name  "성신여대 인증 완료"에 쓰는 학교 이름. 명세에는 school_verified(bool)만 있다.
//   stamp_total  우표첩 줄의 "5 / 17"에서 17. 시안에서 17이 무엇의 개수인지 확인하지 못했다.
export const MOCK_ME_EXTRA = {
  school_name: '성신여대',
  stamp_total: 17,
}

// GET /api/users/me/settings/ 응답 모양 (기본값은 명세의 기본값과 다르게 daily_digest_enabled만 true로 두었다)
export const MOCK_SETTINGS = {
  letter_paused: false,
  push_enabled: true,
  daily_digest_enabled: true,
  weekly_prompt_enabled: true,
}

// 임시저장한 편지 목록(7-3). mock 전용 — 임시저장 저장 방식이 미정이고 문서 레포에 API도 없다.
//   kind        'first_letter'(일기에 보내는 첫 편지) | 'reply'(받은 편지에 대한 답장)
//   reply       이어 쓰기로 편지 쓰기에 넘길 값. docs/letter-write.md의 쿼리 규칙을 따른다.
//               first_letter: { diary_id, nickname, region } / reply: { letter_id, nickname, region }
//   content_preview, char_count, saved_at  목록에 보이는 미리보기·글자 수·저장 시각
export const MOCK_DRAFTS = [
  {
    id: 1,
    kind: 'first_letter',
    title: 'Re. 하늘빛님의 고향 일기',
    content_preview: '그 호수, 제가 고등학생 때 매일 지나던 곳이에요! 붕어빵 아저씨는 아직도 그 자리에 계실까요? 사진을 보니 갑자기 그 겨울이 떠올라서',
    char_count: 86,
    saved_at: '2026-11-06T21:30:00+09:00',
    reply: { diary_id: 12, nickname: '하늘빛', region: '충남 천안' },
  },
  {
    id: 2,
    kind: 'reply',
    title: 'Re. 갈매기님의 편지',
    content_preview: '광안리 새벽 산책 사진 보고 바다가 너무 보고 싶어졌어요',
    char_count: 32,
    saved_at: '2026-11-04T23:10:00+09:00',
    reply: { letter_id: 102, nickname: '갈매기', region: '부산 수영' },
  },
]
