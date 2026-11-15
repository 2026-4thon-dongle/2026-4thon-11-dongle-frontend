// 우체통 mock 상태 저장소. mock 전용 파일이다. (서버가 없어서 화면을 오가도 읽음·답장·넘김 상태가 유지되게 한다)
// 이번 접속의 메모리에만 있다. 새로고침하면 처음으로 돌아간다.
//
// 실제 API로 바꿀 때: 이 파일은 통째로 지운다.
//   - 읽음·답장·넘김은 서버가 상태를 갖고, 우체통 목록 응답(새 편지·대화 중·보관)에 이미 반영돼 온다.
//   - 이 파일을 쓰는 곳: mailboxApi.js(목록 합치기), letterReceiveApi.js(읽음·답장·넘기기 요청)

/** 봉투를 열어 읽은 편지 id. 읽음 → 새 편지 탭에 남되 빨간 점만 사라진다. */
export const readIds = new Set()

/** 답장한 편지 id. 새 편지 탭에서 빠지고 대화 중 탭에 나타난다. */
export const repliedIds = new Set()

/** 넘긴 편지 id → 넘긴 시각(ISO). 새 편지 탭에서 빠지고 보관 탭에 나타난다. */
export const passedAt = new Map()

// 대화·편지 상대의 펜팔 친구 id. 우체통 mock(shared/mocks/mailbox.js)에는 친구 id가 없어서 닉네임으로 이었다.
// 실제 API는 대화 카드 응답에 친구(대화 상대) id를 담아 줘야 한다. (요청 필요)
// 1~3은 shared/mocks/penPal.js의 친구, 4는 마무리된 대화(penPalApi.js의 mock 전용 친구)이다.
const MOCK_FRIEND_IDS = { 하늘빛: 1, 갈매기: 2, 귤껍질: 3, 감자왕: 4 }

export function friendIdOf(nickname) {
  return MOCK_FRIEND_IDS[nickname] ?? null
}
