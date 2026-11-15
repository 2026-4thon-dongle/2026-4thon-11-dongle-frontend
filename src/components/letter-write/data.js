// 편지 쓰기 화면에서 쓰는 목록과 임시(mock) 값
import { MOCK_OWNED_STAMPS } from '../../shared/mocks/stamps.js'


// 편지지. lockedStamps가 있으면 우표가 그만큼 모여야 열린다. badge는 이름 아래 작은 표시.
// dark는 바탕이 어두운 편지지다(서명 펜 기본 색을 흰색으로 바꾼다).
// code는 서버 편지지 코드이다(api/letters.md). id는 화면의 CSS 클래스(paper--ruled)와 에셋 이름에 묶여 있어 그대로 두고,
// 서버와 주고받을 때만 paperCodeOf / paperIdOf로 바꾼다.
export const PAPERS = [
  { id: 'basic', code: 'basic', name: '기본' },
  { id: 'ruled', code: 'lined', name: '줄노트' },
  { id: 'check', code: 'grid', name: '체크' },
  { id: 'mascot', code: 'cat-border', name: '고향이 테두리' },
  { id: 'night', code: 'night-sky', name: '밤하늘', badge: 'NEW', dark: true },
  { id: 'gold', code: 'gold-postcard', name: '금박 엽서', lockedStamps: 15 },
]

/** 편지지 id → 서버 코드. 모르는 id는 기본 편지지('basic')로 본다. */
export const paperCodeOf = (paperId) => PAPERS.find((paper) => paper.id === paperId)?.code ?? 'basic'

/** 서버 편지지 코드 → 편지지 id. 모르는 코드는 기본 편지지('basic')로 본다. */
export const paperIdOf = (code) => PAPERS.find((paper) => paper.code === code)?.id ?? 'basic'

// 글씨체 id → 서버 코드. 다른 것은 id와 코드가 같고, '맛있는체'만 다르다(shared/fonts/letterFonts.js는 'tasty', 서버는 'delicious').
// shared의 id를 서버 코드로 바꾸면 이 표는 필요 없다.
const FONT_CODE_BY_ID = { tasty: 'delicious' }

/** 글씨체 id → 서버 코드 */
export const fontCodeOf = (fontId) => FONT_CODE_BY_ID[fontId] ?? fontId

/** 서버 글씨체 코드 → 글씨체 id */
export const fontIdOf = (code) => Object.keys(FONT_CODE_BY_ID).find((id) => FONT_CODE_BY_ID[id] === code) ?? code

/** 바탕이 어두운 편지지인지 */
export const isDarkPaper = (paperId) => PAPERS.some((paper) => paper.id === paperId && paper.dark)

// 서명 색. token은 tokens.css의 색 변수 이름이다. 흰색은 어두운 편지지에서만 고를 수 있다.
export const PEN_COLORS = [
  { id: 'white', token: '--white', label: '흰색', darkOnly: true },
  { id: 'brown', token: '--text-brown', label: '갈색' },
  { id: 'orange', token: '--brand-orange', label: '주황' },
  { id: 'sky', token: '--brand-sky', label: '하늘' },
  { id: 'sage', token: '--brand-sage', label: '연두' },
  { id: 'berry', token: '--brand-berry', label: '빨강' },
]

/** 편지지에서 고를 수 있는 펜 색. 어두운 편지지에만 흰색이 들어간다. */
export const penColorsFor = (paperId) =>
  PEN_COLORS.filter((color) => !color.darkOnly || isDarkPaper(paperId))

/** 편지지에 맞는 기본 펜 색 id. 어두운 편지지는 흰색, 나머지는 갈색이다. */
export const defaultPenColorId = (paperId) => (isDarkPaper(paperId) ? 'white' : 'brown')

// 붙인 스티커의 크기(px)와 기울기(도). 시안은 64px, 8도로 붙이고, 손잡이로 크기를 바꾸고 -180~180도까지 돌린다.
export const STICKER_SIZE = { min: 32, max: 160, step: 4, initial: 64 }
export const STICKER_TILT = { initial: 8 }

// 스티커. pose는 고향이(Mascot) 표정이고, code는 서버가 정한 스티커 코드이다(api/letters.md, 가정).
export const STICKERS = [
  { id: 'wink', pose: 'wink', code: 'cat-wink', label: '윙크' },
  { id: 'sparkle', pose: 'sparkle', code: 'cat-sparkle', label: '반짝' },
  { id: 'shy', pose: 'shy', code: 'cat-shy', label: '부끄' },
  { id: 'face', pose: 'face', code: 'cat-basic', label: '기본' },
  { id: 'smile', pose: 'smile', code: 'cat-smile', label: '웃음' },
]

// ── 잠금 우표(4-6): 우표 고르기 줄 맨 오른쪽에 「다음에 받을 우표」가 잠금으로 보이고, 누르면 말풍선이 뜬다(시안 4-6-2). ──
// 말풍선 문구: 업적 우표 번호(number, 서버 우표 번호) → 문구. 시안 4-6-2의 「우표별 말풍선 문구」 표를 그대로 옮겼다.
// 01 첫 걸음은 가입하면 바로 받아서 잠금으로 나오지 않는다.
export const STAMP_LOCK_HINTS = {
  2: '첫 고향 일기를 쓰면 받을 수 있어요',
  3: '첫 편지를 보내면 받을 수 있어요',
  4: '편지를 주고받으면 받을 수 있어요',
  5: '펜팔 친구가 되면 받을 수 있어요',
  6: '밤 12시~새벽 5시에 편지를 쓰면 받을 수 있어요',
  7: '12시간 거리로 편지를 보내면 받을 수 있어요',
  8: '손글씨 서명을 10번 남기면 받을 수 있어요',
  9: '첫눈 오는 날 편지를 보내면 받을 수 있어요',
  10: '4주 연속 편지를 보내면 받을 수 있어요',
  11: '우표 10개를 모으면 받을 수 있어요',
  12: '고향이 생일 이벤트에서 받을 수 있어요',
}

// 시즌·기간 한정 업적 우표(09 첫눈 편지, 12 고향이 생일)는 기간이 아닐 때 건너뛰고 다음 번호를 보여 준다.
// 기간인지 알아낼 방법이 없어(서버가 운영자 지급으로 판정, spec/stamp.md) 지금은 항상 기간이 아닌 것으로 보고 건너뛴다.
export const SEASONAL_STAMP_NUMBERS = [9, 12]

// 서버 우표 코드와 우표 그림(shared/assets/stamp) 이름이 다른 우표: 서버 코드 → 그림 id
const STAMP_ART_ID_BY_CODE = { 'long-delivery': 'long-way', 'cat-birthday': 'hometown-birthday' }

/** 서버 우표 코드 → 우표 그림 id(Stamp 컴포넌트의 id) */
export const stampArtIdOf = (code) => STAMP_ART_ID_BY_CODE[code] ?? code

export const MAX_CONTENT_LENGTH = 1000

// ── 임시(mock) 값: 백엔드·우표 데이터가 정해지면 실제 값으로 바꾼다. ──
// 내가 모은 우표 개수(shared/mocks의 우표 mock 기준). 잠긴 편지지를 열 수 있는지 판단할 때 쓴다.
export const MOCK_STAMP_COUNT = MOCK_OWNED_STAMPS.length
// 답장하는 일기의 앞부분. 일기 상세 데이터가 연결되면 일기에서 가져온다.
export const MOCK_DIARY_EXCERPT = '오늘 학교 앞 호수 색이 유난히…'
// 우표 단계(4-6)에서 쓰는 임시 값: 내 거주 지역, 받는 지역을 모를 때의 지역, 도착 시간, 받은 편지 번호.
// 지역 데이터(shared/region)와 보내기 API가 정해지면 실제 값으로 바꾼다.
export const MOCK_MY_REGION = '서울 성북'
export const MOCK_RECEIVER_REGION = '충남 천안'
export const MOCK_ARRIVAL = '약 6시간'
export const MOCK_LETTER_ID = 'mock'
