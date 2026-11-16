import { useState } from 'react'
import { saveSignupProfile } from '../../shared/api/profile.js'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import AuthFrame, { AuthHeading } from '../../shared/ui/AuthFrame.jsx'
import Button from '../../shared/ui/Button.jsx'
import CodeVerification from '../../shared/ui/CodeVerification.jsx'
import RegionPicker from '../../shared/region/RegionPicker.jsx'
import { completeSignup, isAuthDemo, isSchoolEmail, requestCode, checkNickname } from '../../shared/api/auth.js'
import AgreementStep from '../../components/signup/AgreementStep.jsx'
import NicknameStep from '../../components/signup/NicknameStep.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import './SignupPage.css'

const STEPS = ['terms', 'email', 'code', 'nickname', 'hometown', 'residence', 'complete']

export default function SignupPage() {
  const navigate = useNavigate()
  const { '*': path = '' } = useParams()
  const step = path || 'terms'
  const index = STEPS.indexOf(step)
  const [agreements, setAgreements] = useState([false, false, false, false])
  const [email, setEmail] = useState('')
  const [challenge, setChallenge] = useState(null)
  const [verified, setVerified] = useState(false)
  const [nickname, setNickname] = useState('')
  const [hometowns, setHometowns] = useState([])
  const [residence, setResidence] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState('')
  const [busy, setBusy] = useState(false)
  const termsValid = agreements.slice(0, 3).every(Boolean)
  const nicknameValid = nickname.trim().length >= 2 && nickname.trim().length <= 10
  const go = (next) => { setError(''); setErrorCode(''); navigate(`/signup/${next}`) }

  if (index < 0) return <Navigate to="/signup" replace />
  if (index > 0 && !termsValid) return <Navigate to="/signup" replace />
  if (index > 1 && !challenge) return <Navigate to="/signup/email" replace />
  if (index > 2 && !verified) return <Navigate to="/signup/code" replace />
  if (index > 3 && !nicknameValid) return <Navigate to="/signup/nickname" replace />
  if (index > 4 && !hometowns.length) return <Navigate to="/signup/hometown" replace />
  if (index > 5 && !result) return <Navigate to="/signup/residence" replace />

  async function next(event) {
    event?.preventDefault()
    setError(''); setErrorCode('')
    if (step === 'email') {
      setBusy(true)
      try { const nextChallenge = await requestCode(email, 'signup'); setChallenge(nextChallenge); setVerified(false); go('code') }
      catch (err) { setError(err.message); setErrorCode(err.code || '') }
      finally { setBusy(false) }
    } else if (step === 'nickname' && !isAuthDemo) {
      setBusy(true)
      try { const result = await checkNickname(nickname); if (!result.available) throw new Error(result.code === 'NICKNAME_TAKEN' ? '이미 사용 중인 닉네임이에요' : '닉네임을 2~10자로 입력해주세요'); go('hometown') }
      catch (err) { setError(err.message); setErrorCode(err.code || '') }
      finally { setBusy(false) }
    } else if (step === 'residence') {
      setBusy(true)
      try { const profile = saveSignupProfile(await completeSignup({ challengeKey: challenge.key, nickname, hometowns, residence: residence[0], agreements })); setResult(profile); navigate('/signup/complete', { state: { profile } }) }
      catch (err) { setError(err.message); setErrorCode(err.code || '') }
      finally { setBusy(false) }
    } else go(STEPS[index + 1])
  }

  if (step === 'code') return <CodeVerification challenge={challenge} onChallenge={setChallenge} onBack={() => go('email')} onVerified={() => { setVerified(true); go('nickname') }} />
  if (step === 'complete') return <AuthFrame title={isAuthDemo ? "가입 미리보기 완료" : "가입 완료"} onBack={() => go('residence')} footer={<Link className="signup-complete-link text-label-15" to="/start">시작 화면으로 돌아가기</Link>}><div className="signup-complete"><Mascot pose="face" size={60} alt="고향이" /><h2 className="text-title-24">{result.nickname}님,<br />동글에서 만나요!</h2><p>{isAuthDemo ? <>모든 가입 화면을 확인했어요.<br />실제 계정 생성은 진행되지 않았어요.</> : <>가입이 완료됐어요.<br />첫 일기를 남겨주세요.</>}</p><p className="text-body-13">본가: {result.hometowns.map((item) => [item.province, item.district].filter(Boolean).join(' ')).join(' · ')}<br />거주: {result.residence.province} {result.residence.district}</p></div></AuthFrame>

  const registeredEmail = step === 'email' && errorCode === 'EMAIL_ALREADY_REGISTERED'
  async function loginWithEmail() {
    if (busy) return
    setBusy(true)
    try {
      const challenge = await requestCode(email, 'login')
      navigate('/login/code', { state: { challenge, email } })
    } catch (err) { setError(err.message); setErrorCode(err.code || '') }
    finally { setBusy(false) }
  }
  function resetEmail() { setEmail(''); setError(''); setErrorCode(''); document.querySelector('input[name="email"]')?.focus() }
  const disabled = busy || (step === 'terms' && !termsValid) || (step === 'email' && !isSchoolEmail(email)) || (step === 'nickname' && !nicknameValid) || (step === 'hometown' && !hometowns.length) || (step === 'residence' && !residence.length)
  const regionStep = step === 'hometown' || step === 'residence'
  return <AuthFrame title={regionStep ? '지역 설정' : '회원가입'} progress={step === 'terms' ? undefined : { email: 20, nickname: 60, hometown: 80, residence: 100 }[step]} onBack={() => index ? go(STEPS[index - 1]) : navigate('/start')} className={`signup-page signup-page--${step}`} footer={registeredEmail ? <div className="signup-recovery-actions"><Button disabled={busy} onClick={loginWithEmail}>{busy ? '확인 중…' : '이 메일로 로그인하기'}</Button><Button variant="ghost" disabled={busy} onClick={resetEmail}>다른 메일로 가입하기</Button></div> : <Button type="submit" form="signup-form" disabled={disabled}>{busy ? '확인 중…' : step === 'terms' ? '동의하고 시작하기' : step === 'email' ? '인증 코드 받기' : '다음'}</Button>}>
    <form id="signup-form" onSubmit={next} noValidate>
      {step === 'terms' && <AgreementStep value={agreements} onChange={setAgreements} />}
      {step === 'email' && <><AuthHeading description="ac.kr 학교 메일로 대학생 인증을 해요">학교 이메일을<br />알려주세요</AuthHeading><label className="auth-field signup-email-field"><span className="auth-sr-only">학교 이메일</span><input className="auth-input" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="학교 이메일 (ac.kr)" value={email} aria-invalid={registeredEmail || Boolean(email && !isSchoolEmail(email))} aria-describedby="signup-email-help" onChange={(event) => { setEmail(event.target.value); setVerified(false); setError(''); setErrorCode('') }} />{isSchoolEmail(email) && !registeredEmail && <Icon name="check" size={20} />}</label><p id="signup-email-help" className={`auth-caption ${registeredEmail ? 'auth-error' : isSchoolEmail(email) ? 'auth-success' : email ? 'auth-error' : ''}`}>{registeredEmail ? '이미 동글에 가입된 메일이에요' : isSchoolEmail(email) ? '인증 가능한 학교 메일이에요' : email ? 'ac.kr로 끝나는 학교 이메일을 입력해주세요' : '가입에 사용할 학교 이메일을 입력해주세요'}</p><div className="signup-privacy"><Mascot pose="face" size={60} /><p className="text-body-13">{registeredEmail ? <>혹시 전에 가입하셨나요?<br />메일 코드로 바로 로그인할 수 있어요</> : <>메일 주소는 다른 사람에게<br />절대 보이지 않아요</>}</p></div>{isAuthDemo && <p className="auth-demo">개발용 미리보기 · 실제 메일 발송과 계정 생성은 진행되지 않음.</p>}</>}
      {step === 'nickname' && <><AuthHeading description="From. 뒤에 붙는 이름이에요. 실명은 안 돼요!">편지에 적힐<br />이름을 정해주세요</AuthHeading><NicknameStep value={nickname} onChange={setNickname} />{isAuthDemo && <p className="auth-demo">닉네임 중복 확인은 서버 연동 후 가능</p>}</>}
      {step === 'hometown' && <><AuthHeading description="자주 오가던 곳까지 최대 3곳 골라주세요">본가는 어디인가요?</AuthHeading><RegionPicker server mode="hometown" value={hometowns} onChange={setHometowns} /></>}
      {step === 'residence' && <><AuthHeading description="고향 일기의 작성 지역으로 표시돼요">지금은 어디에 살고 있나요?</AuthHeading><RegionPicker server mode="residence" value={residence} onChange={setResidence} hometowns={hometowns} /></>}
      {error && !registeredEmail && <p className="auth-caption auth-error" role="alert">{error}</p>}
    </form>
  </AuthFrame>
}
