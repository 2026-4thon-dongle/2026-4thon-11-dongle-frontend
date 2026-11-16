// 서버 우표 code → 우표 그림 id(shared/assets/stamp 파일 이름, Stamp 컴포넌트의 id). 05 우체통·펜팔·07 마이가 함께 쓰는 하나의 표이다.
// 서버 code(api/stamps.md 코드 표)와 그림 파일 이름이 다른 우표는 두 개뿐이다. 나머지는 code가 곧 그림 id이다.
// 위치 가정: 세 기능 폴더(mailbox, pen-pal, mypage)가 모두 내 담당이라 components/mailbox에 두고 나머지가 가져다 쓴다.
// letter-write/data.js의 stampArtIdOf(채현님)와 DonePage는 이 표를 쓰지 않고 따로 가진다(shared 이동은 협의 사항).
export const STAMP_ART_ID_BY_CODE = {
  'long-delivery': 'long-way',
  'cat-birthday': 'hometown-birthday',
}

/** 서버 우표 code → 우표 그림 id. code가 없으면 null, 표에 없으면 code 그대로. */
export function toStampArtId(code) {
  return code ? (STAMP_ART_ID_BY_CODE[code] ?? code) : null
}
