// 본문에 전화번호처럼 보이는 내용이 있는지 찾는다. 숫자가 9개 이상 이어지면(하이픈·점·공백은 무시) 해당한다.
// 경고만 보여주는 용도라서 정확하지 않아도 된다. 이메일 등 다른 개인정보는 아직 보지 않는다.
const PHONE_LIKE = /(?:\d[\s.-]?){9,}/

export default function hasPhoneNumber(text) {
  return PHONE_LIKE.test(text)
}
