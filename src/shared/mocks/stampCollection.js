// 우표첩(7-4~7-8) 목 데이터(mock). VITE_API_MOCK=true인 개발 환경에서만 쓴다(components/mypage/mypageDemo.js).
// 서버 응답 모양이다(문서 레포 api/stamps.md). code·kind·grade는 문서의 우표 코드 표를 그대로 옮겼다.

const stamp = (number, code, name, description, kind, grade) => ({ code, number, name, description, kind, grade })

// 전체 우표 20종(업적 12 + 꾸미기 8)
export const MOCK_STAMP_CATALOG = [
  stamp(1, 'first-step', '첫 걸음', '동글에 가입했어요', 'achievement', 'common'),
  stamp(2, 'first-diary', '첫 일기', '첫 고향 일기를 썼어요', 'achievement', 'common'),
  stamp(3, 'first-letter', '첫 편지', '첫 편지를 보냈어요', 'achievement', 'common'),
  stamp(4, 'first-roundtrip', '첫 왕복', '같은 사람과 편지를 한 번 주고받았어요', 'achievement', 'rare'),
  stamp(5, 'penpal-friend', '펜팔 친구', '펜팔 친구가 생겼어요', 'achievement', 'rare'),
  stamp(6, 'dawn-letter', '새벽 편지', '밤 12시~새벽 5시에 편지를 보냈어요', 'achievement', 'rare'),
  stamp(7, 'long-delivery', '먼 길 배달', '가장 먼 지역까지 편지를 보냈어요', 'achievement', 'rare'),
  stamp(8, 'handwriting-master', '손글씨 장인', '손글씨 서명을 10번 남겼어요', 'achievement', 'rare'),
  stamp(9, 'first-snow', '첫눈 편지', '첫눈 오는 날 편지를 보냈어요', 'achievement', 'rare'),
  stamp(10, 'steady-letter', '꾸준한 편지', '4주 연속 편지를 보냈어요', 'achievement', 'common'),
  stamp(11, 'stamp-collector', '우표 수집가', '우표를 10개 모았어요', 'achievement', 'legendary'),
  stamp(12, 'cat-birthday', '고향이 생일', '고향이 생일 이벤트 (기간 한정)', 'achievement', 'legendary'),
  stamp(13, 'strawberry-cat', '딸기 고양이', '배달 게임·이벤트로 획득', 'decoration', 'common'),
  stamp(14, 'cloud-bread', '구름빵', '배달 게임·이벤트로 획득', 'decoration', 'common'),
  stamp(15, 'star-candy', '별사탕', '배달 게임·이벤트로 획득', 'decoration', 'common'),
  stamp(16, 'tulip', '튤립', '배달 게임·이벤트로 획득', 'decoration', 'common'),
  stamp(17, 'little-whale', '꼬마 고래', '배달 게임·이벤트로 획득', 'decoration', 'common'),
  stamp(18, 'tangerine', '제철 귤', '배달 게임·이벤트로 획득', 'decoration', 'common'),
  stamp(19, 'bungeoppang', '붕어빵', '배달 게임·이벤트로 획득', 'decoration', 'common'),
  stamp(20, 'rainbow-letter', '무지개 편지', '배달 게임·이벤트로 획득', 'decoration', 'common'),
]

// 보유 우표 code → { granted_at, granted_with }. 시안 7-4(업적 5개)·7-5(꾸미기 3개) 기준.
export const MOCK_OWNED_STAMPS = {
  'first-step': { granted_at: '2026-10-20T10:00:00+09:00', granted_with: null },
  'first-diary': { granted_at: '2026-10-21T10:00:00+09:00', granted_with: null },
  'first-letter': { granted_at: '2026-10-25T10:00:00+09:00', granted_with: null },
  'first-roundtrip': { granted_at: '2026-10-31T10:00:00+09:00', granted_with: { id: 21, nickname: '하늘빛' } },
  'penpal-friend': { granted_at: '2026-11-02T10:00:00+09:00', granted_with: { id: 22, nickname: '갈매기' } },
  'strawberry-cat': { granted_at: '2026-10-28T10:00:00+09:00', granted_with: null },
  'cloud-bread': { granted_at: '2026-10-29T10:00:00+09:00', granted_with: null },
  tangerine: { granted_at: '2026-11-01T10:00:00+09:00', granted_with: null },
}

// 수집 보상 4단계(GET /api/stamps/rewards/ 의 rewards[] 에서 unlocked·unlocked_at·seen을 뺀 정의)
export const MOCK_STAMP_REWARDS = [
  { code: 'stickers-cat', threshold: 3, name: '고향이 표정 스티커', description: '편지 서명 단계에서 스티커를 붙일 수 있어요', items: [{ type: 'sticker', code: 'cat-wink' }] },
  { code: 'stationery-night-sky', threshold: 5, name: '편지지 「밤하늘」', description: '밤하늘 편지지를 쓸 수 있어요', items: [{ type: 'stationery', code: 'night-sky' }] },
  { code: 'collector-and-font', threshold: 10, name: '「우표 수집가」 우표 + 글씨체', description: '전설 우표와 글씨체 「엄마의 손편지」', items: [{ type: 'stamp', code: 'stamp-collector' }, { type: 'font', code: 'mom-letter' }] },
  { code: 'stationery-gold-postcard', threshold: 15, name: '한정 편지지 「금박 엽서」', description: '한정 편지지를 쓸 수 있어요', items: [{ type: 'stationery', code: 'gold-postcard' }] },
]
