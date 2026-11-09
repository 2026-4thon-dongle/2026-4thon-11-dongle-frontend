// 우표 목 데이터(mock). API가 정해지면 실제 응답으로 바꾼다.
// id는 shared/assets/stamp의 파일 이름과 같다. 우표첩(마이페이지), 우표 선택(편지 쓰기), 우표 만들기가 같은 형태를 쓴다.
//
// kind: 'achievement' 업적 우표 (조건을 달성하면 받는다)
// owned: 내가 가지고 있는지

export const MOCK_STAMPS = [
  { id: 'first-step', name: '첫 걸음', kind: 'achievement', owned: true },
  { id: 'first-diary', name: '첫 일기', kind: 'achievement', owned: true },
  { id: 'first-letter', name: '첫 편지', kind: 'achievement', owned: true },
  { id: 'first-roundtrip', name: '첫 왕복', kind: 'achievement', owned: false },
  { id: 'penpal-friend', name: '펜팔 친구', kind: 'achievement', owned: false },
  { id: 'dawn-letter', name: '새벽 편지', kind: 'achievement', owned: false },
  { id: 'long-way', name: '먼 길 배달', kind: 'achievement', owned: false },
  { id: 'handwriting-master', name: '손글씨 장인', kind: 'achievement', owned: false },
  { id: 'first-snow', name: '첫눈 편지', kind: 'achievement', owned: false },
  { id: 'steady-letter', name: '꾸준한 편지', kind: 'achievement', owned: false },
  { id: 'stamp-collector', name: '우표 수집가', kind: 'achievement', owned: false },
  { id: 'hometown-birthday', name: '고향이 생일', kind: 'achievement', owned: false },
]

export const MOCK_OWNED_STAMPS = MOCK_STAMPS.filter((stamp) => stamp.owned)
