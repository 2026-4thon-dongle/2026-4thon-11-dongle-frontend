// 개발용 UI 어댑터. 운영 환경에서는 인증을 우회하지 않는다.
// 실제 서버 연동 시 이 모듈의 요청·검증·가입 함수를 교체한다.
export const isAuthDemo = import.meta.env.DEV
export const DEMO_CODE = '472913'
// 학교 메일(ac.kr)이 아니어도 가입·로그인할 수 있는 실제 메일 발송 시연용 주소.
// 백엔드 배포 서버 환경변수 EXTRA_ALLOWED_EMAILS와 같은 목록으로 맞춘다.
const EXTRA_ALLOWED_EMAILS = ['dongledongle4thon@gmail.com', 'minho0805@gmail.com']
export const isSchoolEmail = (email) => {
  const value = email.trim()
  return /^[^\s@]+@(?:[a-z0-9-]+\.)+ac\.kr$/i.test(value) || EXTRA_ALLOWED_EMAILS.includes(value.toLowerCase())
}
const challenges = new Map()

export async function requestCode(email, purpose) {
  if (!isSchoolEmail(email)) throw new Error('학교 이메일(ac.kr)을 입력해주세요')
  if (!isAuthDemo) throw new Error('아직 인증 서버가 연결되지 않았어요. 잠시 후 다시 이용해주세요.')
  const key = `${purpose}:${email.trim().toLowerCase()}`
  const previous = challenges.get(key)
  if (previous && previous.resendAt > Date.now()) throw new Error('코드는 30초 후 다시 받을 수 있어요')
  const challenge = { key, email: email.trim(), purpose, expiresAt: Date.now() + 300_000, resendAt: Date.now() + 30_000, attempts: 5, verified: false }
  challenges.set(key, challenge)
  return { ...challenge }
}

export async function verifyCode(key, code) {
  const challenge = challenges.get(key)
  if (!isAuthDemo || !challenge) throw new Error('이메일 단계에서 코드를 다시 받아주세요')
  if (Date.now() >= challenge.expiresAt) throw new Error('코드가 만료됐어요. 새 코드를 받아주세요')
  if (challenge.attempts <= 0) throw new Error('인증 시도를 모두 사용했어요. 새 코드를 받아주세요')
  if (code !== DEMO_CODE) {
    challenge.attempts -= 1
    throw new Error(`코드가 맞지 않아요. 다시 확인해주세요 (남은 시도 ${challenge.attempts}회)`)
  }
  challenge.verified = true
  return { email: challenge.email, demo: true }
}

export async function completeSignup({ challengeKey, nickname, hometowns, residence, agreements }) {
  const challenge = challenges.get(challengeKey)
  if (!isAuthDemo || !challenge?.verified) throw new Error('학교 이메일 인증을 먼저 완료해주세요')
  if (!agreements.slice(0, 3).every(Boolean) || nickname.trim().length < 2 || nickname.trim().length > 10 || !hometowns.length || hometowns.length > 3 || !residence) throw new Error('가입 정보를 다시 확인해주세요')
  // 서버 계정이나 로그인 세션을 생성하지 않는 UI 데모 결과.
  return { nickname: nickname.trim(), hometowns, residence, demo: true }
}
