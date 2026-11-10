// Figma 03 섹션을 확인하는 개발용 데이터. 실사용자·실제 알림이 아니다.
export const MOCK_READING_PROFILE = {
  nickname: '다인',
  hometowns: [{ province: '충남', district: '천안' }, { province: '충남', district: '아산' }, { province: '대전', district: '' }],
  residence: { province: '서울', district: '성북' },
}

export const MOCK_READING_DIARIES = [
  { id: 'sky-lake', authorId: 'author-sky', nickname: '하늘빛', province: '충남', district: '천안', ago: '3시간 전', dateLabel: '10월 30일', postmarkDate: '10.30', stamp: { id: 'first-letter', label: '첫 편지', number: '03' }, photo: true, preview: '오늘 학교 앞 호수 색이\n유난히 예뻤다. 정문 붕어빵\n트럭도 다시 돌아왔어!', content: '오늘 학교 앞 호수 색이 유난히 예뻤다.\n산책하다 보니 정문 붕어빵 트럭이 다시\n돌아와 있었다. 팥 2개, 슈크림 1개.\n고향 친구들한테도 보여주고 싶은 하루.', deliveryLabel: '충남까지 약 6시간 걸려 도착해요', feed: 'hometown' },
  { id: 'star-walk', authorId: 'author-star', nickname: '별빛', province: '대전', district: '유성', ago: '5시간 전', dateLabel: '10월 30일', postmarkDate: '10.30', stamp: { id: 'dawn-letter', label: '새벽 편지', number: '06' }, photo: false, preview: '갑천 따라 걷는데 은행잎이 다 떨어졌네', content: '갑천 따라 걷는데 은행잎이 다 떨어졌네.\n바스락거리는 소리를 들으며 한참 걸었다.\n오늘은 고향 친구가 조금 보고 싶다.', deliveryLabel: '대전까지 약 6시간 걸려 도착해요', feed: 'hometown' },
  { id: 'asan-day', authorId: 'author-asan', nickname: '온양이', province: '충남', district: '아산', ago: '6시간 전', dateLabel: '10월 30일', postmarkDate: '10.30', stamp: { id: 'first-diary', label: '첫 일기', number: '02' }, photo: false, preview: '집 앞 골목에서\n따뜻한 하루를 만났어', content: '집 앞 골목에서 따뜻한 하루를 만났어.\n늘 지나치던 가게에서 인사를 건네주셨다.', deliveryLabel: '충남까지 약 6시간 걸려 도착해요', feed: 'hometown' },
  { id: 'jeju-waves', authorId: 'author-wave', nickname: '귤껍질', province: '제주', district: '제주', ago: '3시간 전', dateLabel: '10월 30일', postmarkDate: '10.30', stamp: { id: 'long-way', label: '먼 길 배달', number: '07' }, photo: false, preview: '귤밭 사이\n돌담길을 걸었다', content: '귤밭 사이 돌담길을 걸었다.\n바다에서 불어오는 바람이 기분 좋았다.', deliveryLabel: '제주까지 약 18시간 걸려 도착해요', feed: 'away' },
  { id: 'gangwon-snow', authorId: 'author-potato', nickname: '감자밭', province: '강원', district: '춘천', ago: '5시간 전', dateLabel: '10월 29일', postmarkDate: '10.29', stamp: { id: 'first-snow', label: '첫눈 편지', number: '09' }, photo: false, preview: '춘천 호숫가에\n첫눈이 왔어요', content: '춘천 호숫가에 첫눈이 왔어요.\n고향에 있는 친구에게 제일 먼저 알려주고 싶었다.', deliveryLabel: '강원까지 약 8시간 걸려 도착해요', feed: 'away' },
  { id: 'busan-stroll', authorId: 'author-gull', nickname: '갈매기', province: '부산', district: '수영', ago: '어제', dateLabel: '10월 29일', postmarkDate: '10.29', stamp: { id: 'first-roundtrip', label: '첫 왕복', number: '04' }, photo: false, preview: '광안리 새벽\n산책 다녀옴', content: '광안리 새벽 산책 다녀옴.\n파도 소리와 함께 하루를 시작했다.', deliveryLabel: '부산까지 약 12시간 걸려 도착해요', feed: 'away' },
  { id: 'suncheon-reeds', authorId: 'author-reeds', nickname: '순천만', province: '전남', district: '순천', ago: '어제', dateLabel: '10월 28일', postmarkDate: '10.28', stamp: { id: 'steady-letter', label: '꾸준한 편지', number: '10' }, photo: false, preview: '갈대숲이\n온통 금빛이야', content: '갈대숲이 온통 금빛이야.\n노을이 내려앉은 길을 천천히 걸었다.', deliveryLabel: '전남까지 약 12시간 걸려 도착해요', feed: 'away' },
]

export const MOCK_READING_NOTIFICATIONS = [
  { id: 'notice-letter', authorId: 'author-sky', icon: 'mail', tone: 'peach', title: '하늘빛님의 편지가 도착했어요', ago: '방금', unread: true, to: '/mailbox?tab=new' },
  { id: 'notice-delivery', icon: 'map', tone: 'sky', title: '편지가 경기 평택을 지나는 중이에요', ago: '12분 전', unread: false, to: '/delivery/demo-letter/map' },
  { id: 'notice-stamp', authorId: 'author-sky', icon: 'stamp', tone: 'cream', title: '첫 왕복 완료! 하늘빛님과 우표를 주고받았어요', ago: '1시간 전', unread: false, to: '/mypage/stamps' },
  { id: 'notice-question', icon: 'sparkle', tone: 'sage', title: '오늘의 동네 질문: 요즘 자주 먹는 건 뭐예요?', ago: '어제', unread: false, to: '/diary/write' },
  { id: 'notice-game', icon: 'game', tone: 'butter', title: '배달 게임으로 30분 빨리 도착했어요', ago: '어제', unread: false, to: '/delivery/demo-letter/map' },
]

export const READING_REPORT_REASONS = ['욕설 · 비하', '성적인 내용', '연락처 · 개인정보 요구', '광고 · 도배', '기타 (직접 입력)']
