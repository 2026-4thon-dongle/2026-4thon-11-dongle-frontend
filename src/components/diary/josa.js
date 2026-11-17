// 지역 이름 뒤에 붙는 조사를 받침 유무로 고른다. 예: 서울이·부산이 / 대구가·제주가
// 한글이 아닌 끝 글자(숫자·영문)는 받침이 있는 쪽으로 본다.
function hasFinalConsonant(word) {
  const last = String(word).trim().slice(-1)
  const code = last.charCodeAt(0) - 0xac00
  if (code < 0 || code > 11171) return true
  return code % 28 !== 0
}

/** '이/가' 조사를 붙인다. */
export function withSubjectJosa(word) {
  return `${word}${hasFinalConsonant(word) ? '이' : '가'}`
}
