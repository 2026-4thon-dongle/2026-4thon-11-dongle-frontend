// 화면은 이 경계만 사용한다. 인증 명세와 서버가 준비되면 구현을 교체한다.
// 현재 동작은 shared/mocks의 개발용 UI 데모이며 운영 빌드에서는 요청을 거절한다.
export {
  isAuthDemo,
  DEMO_CODE,
  isSchoolEmail,
  requestCode,
  verifyCode,
  completeSignup,
} from '../mocks/auth.js'
