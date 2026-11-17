// 본문에서 연락처처럼 보이는 내용을 찾는다(SAFE-04, 경고만 하고 막지 않는다).
// 종류와 규칙은 api/safety.md 연락처 검사(phone·email·kakao·instagram)와 같게 맞춘다.
// 전화번호는 원래처럼 숫자가 9개 이상 이어지면(하이픈·점·공백은 무시) 해당한다. 경고용이라 정확하지 않아도 된다.
const CONTACT_PATTERNS = {
  phone: /(?:\d[\s.-]?){9,}/,
  email: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/,
  kakao: /open\.kakao\.com\/\S+|(?:카카오톡|카톡|kakao(?:talk)?)\s*(?:아이디|id)?\s*[:：]?\s*[A-Za-z0-9._-]{3,}/i,
  instagram: /instagram\.com\/\S+|(?:인스타그램|인스타|instagram|insta)\s*(?:아이디|id)?\s*[:：]?\s*@?[A-Za-z0-9._]{3,}/i,
}

/** @returns {Array<'phone'|'email'|'kakao'|'instagram'>} 찾은 연락처 종류 */
export function detectContactTypes(text) {
  return Object.keys(CONTACT_PATTERNS).filter((type) => CONTACT_PATTERNS[type].test(text))
}
