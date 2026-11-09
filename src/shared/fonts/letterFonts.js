// 편지 글씨체 목록 (글씨체 고르기, 편지 쓰기 본문, 편지 열람에서 공용으로 사용)
// - 이름과 사용하는 글꼴은 시안 4-3(글씨체 목록)을 따른다. 글꼴은 모두 구글 폰트이다.
// - 폰트 파일은 목록에 있다고 바로 받지 않는다. 필요한 화면에서 loadLetterFont(id)를 호출할 때만 받는다.

export const LETTER_FONT_SAMPLE = '고향의 하루를 편지로'

const googleFont = (name) =>
  `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}&display=swap`

// chipLabel: 칩에 줄여 쓰는 이름 (시안 4-8). sampleSize: 목록 미리보기 글자 크기(px, 시안 값).
export const LETTER_FONTS = [
  { id: 'nanum-pen', name: '나눔손글씨 펜', chipLabel: '나눔펜', family: "'Nanum Pen Script'", source: googleFont('Nanum Pen Script'), sampleSize: 18 },
  { id: 'nanum-brush', name: '나눔손글씨 붓', chipLabel: '나눔붓', family: "'Nanum Brush Script'", source: googleFont('Nanum Brush Script'), sampleSize: 20 },
  { id: 'mini', name: '미니 손글씨', chipLabel: '개구', family: "'Gaegu'", source: googleFont('Gaegu'), sampleSize: 18 },
  { id: 'tasty', name: '맛있는체', chipLabel: '맛있는체', family: "'Gamja Flower'", source: googleFont('Gamja Flower'), sampleSize: 18 },
  { id: 'meaningful', name: '의미있는 한글', chipLabel: '의미있는', family: "'Poor Story'", source: googleFont('Poor Story'), sampleSize: 18 },
  { id: 'sparkle-star', name: '반짝반짝 별', chipLabel: '하이멜로디', family: "'Hi Melody'", source: googleFont('Hi Melody'), sampleSize: 18 },
  { id: 'nineteen', name: '열아홉의 반짝임', chipLabel: '열아홉', family: "'Single Day'", source: googleFont('Single Day'), sampleSize: 18 },
  { id: 'mom-love', name: '엄마사랑', chipLabel: '엄마사랑', family: "'Yeon Sung'", source: googleFont('Yeon Sung'), sampleSize: 18 },
]

// 잠긴 글씨체. 해제 조건은 우표 개수이며, 실제 해제 여부는 우표 데이터와 연결할 때 정한다.
export const LOCKED_LETTER_FONTS = [
  {
    id: 'mom-letter',
    name: '엄마의 손편지',
    unlockCondition: { type: 'stamps', count: 10 },
  },
]

export const DEFAULT_LETTER_FONT_ID = 'nanum-pen'

const FALLBACK = 'cursive'
const loaded = new Set()

export function getLetterFont(id) {
  return LETTER_FONTS.find((font) => font.id === id) ?? LETTER_FONTS[0]
}

// CSS font-family 값. 폰트 로딩 전에는 fallback으로 보인다.
export function getLetterFontFamily(id) {
  return `${getLetterFont(id).family}, ${FALLBACK}`
}

// 해당 글씨체의 폰트 파일을 한 번만 불러온다.
export function loadLetterFont(id) {
  const font = getLetterFont(id)
  if (!font.source || loaded.has(font.id)) return
  loaded.add(font.id)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = font.source
  document.head.appendChild(link)
}
