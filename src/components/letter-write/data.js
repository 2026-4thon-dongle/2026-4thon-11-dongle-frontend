// 편지 쓰기 화면에서 쓰는 목록과 임시(mock) 값
import { MOCK_OWNED_STAMPS } from '../../shared/mocks/stamps.js'


// 편지지. lockedStamps가 있으면 우표가 그만큼 모여야 열린다. badge는 이름 아래 작은 표시.
export const PAPERS = [
  { id: 'basic', name: '기본' },
  { id: 'ruled', name: '줄노트' },
  { id: 'check', name: '체크' },
  { id: 'mascot', name: '고향이 테두리' },
  { id: 'night', name: '밤하늘', badge: 'NEW' },
  { id: 'gold', name: '금박 엽서', lockedStamps: 15 },
]

// 서명 색. token은 tokens.css의 색 변수 이름이다.
export const PEN_COLORS = [
  { id: 'brown', token: '--text-brown', label: '갈색' },
  { id: 'orange', token: '--brand-orange', label: '주황' },
  { id: 'sky', token: '--brand-sky', label: '하늘' },
  { id: 'sage', token: '--brand-sage', label: '연두' },
  { id: 'berry', token: '--brand-berry', label: '빨강' },
]

// 스티커. pose는 고향이(Mascot) 표정이다.
export const STICKERS = [
  { id: 'wink', pose: 'wink', label: '윙크' },
  { id: 'sparkle', pose: 'sparkle', label: '반짝' },
  { id: 'shy', pose: 'shy', label: '부끄' },
  { id: 'face', pose: 'face', label: '기본' },
  { id: 'smile', pose: 'smile', label: '웃음' },
]

export const MAX_CONTENT_LENGTH = 1000

// ── 임시(mock) 값: 백엔드·우표 데이터가 정해지면 실제 값으로 바꾼다. ──
// 내가 모은 우표 개수(shared/mocks의 우표 mock 기준). 잠긴 편지지를 열 수 있는지 판단할 때 쓴다.
export const MOCK_STAMP_COUNT = MOCK_OWNED_STAMPS.length
// 답장하는 일기의 앞부분. 일기 상세 데이터가 연결되면 일기에서 가져온다.
export const MOCK_DIARY_EXCERPT = '오늘 학교 앞 호수 색이 유난히…'
