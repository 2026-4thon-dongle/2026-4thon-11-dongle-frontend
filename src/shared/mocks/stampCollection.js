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

// 수집 보상(우표를 모은 개수에 따라 받는 것). mock 전용.
//   threshold  필요한 우표 개수
//   name       보상 이름 ("받은 보상: …"에 쓴다)
//   next_text  "다음 보상 · …"에 쓰는 문구. 없으면 `${threshold}개: ${name}`으로 만든다.
//              시안 7-4는 "10개 「우표 수집가」 우표"처럼 콜론이 없어서 그 보상만 문구를 따로 두었다.
// 7-8(수집 보상)에는 보상이 4개 있고 그중 네 번째(한정 편지지 「금박 엽서」)의 필요 개수는 아직 읽지 않았다. 묶음 3에서 채운다.
export const MOCK_STAMP_REWARDS = [
  { id: 'face-sticker', threshold: 3, name: '고향이 표정 스티커' },
  { id: 'night-sky-paper', threshold: 5, name: '편지지 「밤하늘」' },
  { id: 'collector', threshold: 10, name: '「우표 수집가」 우표', next_text: '10개 「우표 수집가」 우표' },
]
