// 우체통 mock 상태 저장소. mock 모드(VITE_API_MOCK=true, 개발 전용)에서만 쓴다. (서버 모드에서는 쓰이지 않는다)
// 화면을 오가도 읽음·답장·넘김 상태가 유지되게 한다. 이번 접속의 메모리에만 있고 새로고침하면 처음으로 돌아간다.
//
// 서버 모드에서는 읽음·넘김을 서버가 저장하고 우체통 목록 응답에 반영해 준다.
// 이 파일을 쓰는 곳: mailboxDemo.js(목록 합치기), letterReceiveDemo.js(읽음·답장·넘기기)
// mock 모드가 필요 없어지면 mailboxDemo.js, letterReceiveDemo.js, penPalDemo.js와 함께 지운다.

/** 봉투를 열어 읽은 편지 id. 읽음 → 새 편지 탭에 남되 빨간 점만 사라진다. */
export const readIds = new Set()

/** 답장한 편지 id. 새 편지 탭에서 빠지고 대화 중 탭에 나타난다. */
export const repliedIds = new Set()

/** 넘긴 편지 id → 넘긴 시각(ISO). 새 편지 탭에서 빠지고 보관 탭에 나타난다. */
export const passedAt = new Map()

// 대화·편지 상대의 mock 대화 id. 우체통 mock(shared/mocks/mailbox.js)에는 대화 id가 없어서 닉네임으로 이었다. (서버 모드는 응답의 대화 id를 쓴다)
// 1~3은 shared/mocks/penPal.js의 친구, 4는 마무리된 대화(penPalDemo.js의 mock 전용 친구)이다.
const MOCK_FRIEND_IDS = { 하늘빛: 1, 갈매기: 2, 귤껍질: 3, 감자왕: 4 }

export function friendIdOf(nickname) {
  return MOCK_FRIEND_IDS[nickname] ?? null
}
