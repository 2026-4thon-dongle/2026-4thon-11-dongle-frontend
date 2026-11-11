// 우표첩(7-4~7-6) 목 데이터(mock). 문서 레포 API 확정 전이며 화면 확인용이다.
//
// 문서 레포에는 우표 목록·보유 상태·보상 API가 없다(api/ 문서에는 가입·일기 응답의 granted_stamps만 있다).
// 그래서 이 파일의 보유 상태와 보상 정의는 모두 mock 전용이다.
//
// 우표의 이름·종류(기본/꾸미기)는 shared/mocks/stamps.js(MOCK_STAMPS)를 읽기만 하고, 그 파일의 owned 값은 쓰지 않는다.
// 그 파일의 owned 값은 시안과 다르기 때문에, 시안 기준 보유 상태를 여기서 따로 정의한다.
//   시안 7-4: 기본 우표 12개 중 5개 보유 (첫 걸음·첫 일기·첫 편지·첫 왕복·펜팔 친구)
//   시안 7-5: 꾸미기 우표 8개 중 3개 보유 (딸기 고양이·구름빵·제철 귤)

export const MOCK_OWNED_STAMP_CODES = [
  'first-step',
  'first-diary',
  'first-letter',
  'first-roundtrip',
  'penpal-friend',
  'strawberry-cat',
  'cloud-bread',
  'tangerine',
]

// 수집 보상(우표를 모은 개수에 따라 받는 것). mock 전용. 시안 7-8의 4개를 그대로 옮겼다.
//   threshold  필요한 우표 개수
//   name       보상 이름 ("받은 보상: …", 7-8 카드 제목에 쓴다)
//   kind       7-8 카드의 미리보기 그림 종류 ('sticker' | 'paper' | 'collector' | 'postcard')
//   next_text  "다음 보상 · …"에 쓰는 문구. 없으면 `${threshold}개: ${name}`으로 만든다.
//              시안 7-4는 "10개 「우표 수집가」 우표"처럼 콜론이 없어서 그 보상만 문구를 따로 두었다.
// 시안 7-7, 7-8은 "모은 우표 6개"인데 7-4는 5개라서 시안 안에서 숫자가 맞지 않는다. 여기서는 7-4의 5개를 기준으로 센다.
export const MOCK_STAMP_REWARDS = [
  { id: 'face-sticker', threshold: 3, name: '고향이 표정 스티커', kind: 'sticker' },
  { id: 'night-sky-paper', threshold: 5, name: '편지지 「밤하늘」', kind: 'paper' },
  {
    id: 'collector',
    threshold: 10,
    name: '「우표 수집가」 + 글씨체',
    kind: 'collector',
    next_text: '10개 「우표 수집가」 우표',
  },
  { id: 'gold-postcard', threshold: 15, name: '한정 편지지 「금박 엽서」', kind: 'postcard' },
]

// 우표 상세(7-7) 정보. mock 전용 — 문서 레포에 우표 상세 API가 없다.
//   number       우표 번호(No.04). 꾸미기 우표는 번호가 없다.
//   grade        등급: 일반 / 희귀 / 전설 / 꾸미기. 시안 우표 컴포넌트 설명("희귀 · 편지를 한 번 주고받았어요")에서 가져왔다.
//   description  우표 설명. 첫 왕복만 시안 7-7의 문구이고, 나머지는 우표 컴포넌트 설명을 그대로 썼다.
//   obtained     받은 날짜와 계기. 첫 왕복만 시안 문구("10월 31일 · 하늘빛님과의 편지로 받음")이고,
//                나머지 날짜와 문구는 화면 확인용으로 지어낸 값이다. 가지지 못한 우표는 없다.
export const MOCK_STAMP_DETAILS = {
  'first-step': { number: 1, grade: '일반', description: '가입하고 첫 발을 뗐어요', obtained: { at: '2026-10-20', from: '가입하고 받음' } },
  'first-diary': { number: 2, grade: '일반', description: '첫 고향 일기를 썼어요', obtained: { at: '2026-10-21', from: '첫 고향 일기로 받음' } },
  'first-letter': { number: 3, grade: '일반', description: '첫 편지를 보냈어요', obtained: { at: '2026-10-25', from: '첫 편지로 받음' } },
  'first-roundtrip': {
    number: 4,
    grade: '희귀',
    description: '같은 사람과 편지를 한 번 주고받았어요',
    obtained: { at: '2026-10-31', from: '하늘빛님과의 편지로 받음' },
  },
  'penpal-friend': { number: 5, grade: '희귀', description: '펜팔 친구가 생겼어요', obtained: { at: '2026-11-02', from: '갈매기님과의 편지로 받음' } },
  'dawn-letter': { number: 6, grade: '희귀', description: '새벽에 편지를 썼어요' },
  'long-way': { number: 7, grade: '희귀', description: '가장 먼 지역까지 편지를 보냈어요' },
  'handwriting-master': { number: 8, grade: '희귀', description: '손글씨 서명을 10번 남겼어요' },
  'first-snow': { number: 9, grade: '희귀', description: '첫눈 오는 날 편지를 보냈어요 (시즌 한정)' },
  'steady-letter': { number: 10, grade: '일반', description: '4주 연속 편지를 보냈어요' },
  'stamp-collector': { number: 11, grade: '전설', description: '우표를 10개 모았어요' },
  'hometown-birthday': { number: 12, grade: '전설', description: '고향이 생일 이벤트 (기간 한정)' },
  'strawberry-cat': { grade: '꾸미기', description: '배달 게임·이벤트로 획득', obtained: { at: '2026-10-28', from: '배달 게임으로 받음' } },
  'cloud-bread': { grade: '꾸미기', description: '배달 게임·이벤트로 획득', obtained: { at: '2026-10-29', from: '배달 게임으로 받음' } },
  tangerine: { grade: '꾸미기', description: '배달 게임·이벤트로 획득', obtained: { at: '2026-11-01', from: '시즌 이벤트로 받음' } },
  'star-candy': { grade: '꾸미기', description: '배달 게임·이벤트로 획득' },
  tulip: { grade: '꾸미기', description: '배달 게임·이벤트로 획득' },
  'little-whale': { grade: '꾸미기', description: '배달 게임·이벤트로 획득' },
  bungeoppang: { grade: '꾸미기', description: '배달 게임·이벤트로 획득' },
  'rainbow-letter': { grade: '꾸미기', description: '배달 게임·이벤트로 획득' },
}
