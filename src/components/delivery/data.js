// 배송 화면(4-11 발송 완료, 4-12 배송 지도)에서 쓰는 임시(mock) 값.
// 편지 보내기·배송 API가 정해지면 편지 데이터(출발·도착 지역, 보낸 시각, 도착 예정 시각, 지나가는 동네)로 바꾼다.
export const MOCK_DELIVERY = {
  from: '서울 성북',
  to: '충남 천안',
  recipient: '하늘빛',
  totalMinutes: 360, // 도착까지 걸리는 전체 시간
  elapsedMinutes: 1, // 보낸 뒤 지난 시간
}

// 배송 지도(4-12)에서 보여줄 때는 길 중간쯤 가고 있는 편지로 둔다.
export const MOCK_MAP_DELIVERY = { ...MOCK_DELIVERY, elapsedMinutes: 160 }

// 편지가 지나가는 동네. at은 길 위의 위치(0 = 출발, 1 = 도착), news는 그 동네 소식이다.
export const MOCK_TOWNS = [
  { id: 'pyeongtaek', name: '경기 평택', at: 0.608, news: '송탄 시장에 올해 첫 호떡 트럭이 왔대요', icon: 'heart', tone: 'peach' },
  { id: 'asan', name: '충남 아산', at: 0.811, news: '곡교천 은행나무길이 노랗게 물들었어요', icon: 'pin', tone: 'sage' },
]

// 편지를 보내고 새로 받은 우표 (처음 편지를 보냈을 때). 우표 획득 API가 정해지면 응답으로 바꾼다.
export const MOCK_EARNED_STAMP_ID = 'first-letter'
