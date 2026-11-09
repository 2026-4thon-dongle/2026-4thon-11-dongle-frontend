// 우표 목 데이터(mock). API가 정해지면 실제 응답으로 바꾼다.
// id는 shared/assets/stamp 아래(basic, decoration 폴더) 파일 이름과 같다. 우표첩(마이페이지), 우표 선택(편지 쓰기), 우표 만들기가 같은 형태를 쓴다.
//
// kind: 'basic'      기본 우표 (assets/stamp/basic)
//       'decoration' 꾸미기 우표 (assets/stamp/decoration)
// owned: 내가 가지고 있는지

export const MOCK_STAMPS = [
  { id: 'first-step', name: '첫 걸음', kind: 'basic', owned: true },
  { id: 'first-diary', name: '첫 일기', kind: 'basic', owned: true },
  { id: 'first-letter', name: '첫 편지', kind: 'basic', owned: true },
  { id: 'first-roundtrip', name: '첫 왕복', kind: 'basic', owned: false },
  { id: 'penpal-friend', name: '펜팔 친구', kind: 'basic', owned: false },
  { id: 'dawn-letter', name: '새벽 편지', kind: 'basic', owned: false },
  { id: 'long-way', name: '먼 길 배달', kind: 'basic', owned: false },
  { id: 'handwriting-master', name: '손글씨 장인', kind: 'basic', owned: false },
  { id: 'first-snow', name: '첫눈 편지', kind: 'basic', owned: false },
  { id: 'steady-letter', name: '꾸준한 편지', kind: 'basic', owned: false },
  { id: 'stamp-collector', name: '우표 수집가', kind: 'basic', owned: false },
  { id: 'hometown-birthday', name: '고향이 생일', kind: 'basic', owned: false },
  { id: 'strawberry-cat', name: '딸기 고양이', kind: 'decoration', owned: true },
  { id: 'cloud-bread', name: '구름빵', kind: 'decoration', owned: true },
  { id: 'star-candy', name: '별사탕', kind: 'decoration', owned: false },
  { id: 'tulip', name: '튤립', kind: 'decoration', owned: false },
  { id: 'little-whale', name: '꼬마 고래', kind: 'decoration', owned: false },
  { id: 'tangerine', name: '제철 귤', kind: 'decoration', owned: false },
  { id: 'bungeoppang', name: '붕어빵', kind: 'decoration', owned: false },
  { id: 'rainbow-letter', name: '무지개 편지', kind: 'decoration', owned: false },
]

export const MOCK_OWNED_STAMPS = MOCK_STAMPS.filter((stamp) => stamp.owned)
