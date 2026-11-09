import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import CodeVerification from '../../shared/ui/CodeVerification.jsx'
import AuthFrame from '../../shared/ui/AuthFrame.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import { isAuthDemo, isSchoolEmail, requestCode } from '../../shared/api/auth.js'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [challenge, setChallenge] = useState(null)
  const [busy, setBusy] = useState(false)
  const { '*': path = '' } = useParams()

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    if (!isSchoolEmail(email)) {
      setError('가입한 학교 이메일(ac.kr)을 입력해주세요')
      return
    }
    setError('')
    setBusy(true)
    try { setChallenge(await requestCode(email, 'login')); navigate('/login/code') }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  if (path === 'code') return challenge ? <CodeVerification login challenge={challenge} onChallenge={setChallenge} onBack={() => navigate('/login')} onVerified={() => { navigate('/login'); setNotice('개발용 로그인 확인 완료. 실제 로그인은 인증 서버 연동 후 가능') }} /> : <Navigate to="/login" replace />

  return (
    <AuthFrame title="로그인" onBack={() => navigate('/start')} className="login-page" footer={<div className="login-actions"><Button type="submit" form="login-form" className="login-submit" disabled={busy}>{busy ? '확인 중…' : '로그인 코드 받기'}</Button><Link className="login-signup text-label-15" to="/signup">처음이신가요?&nbsp; 회원가입</Link></div>}>
      <section className="login-welcome" aria-labelledby="login-title">
        <div className="login-illustration"><Mascot pose="wink" size={120} alt="반갑게 웃는 고향이" /></div>
        <h2 id="login-title" className="text-title-24">다시 만나서 반가워요!</h2>
        <p className="text-body-13">가입한 학교 메일로 로그인 코드를 보내드려요</p>
      </section>

      <form id="login-form" className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="login-field">
          <label className="login-sr-only" htmlFor="login-email">학교 이메일 (ac.kr)</label>
          <input id="login-email" type="email" name="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="학교 이메일 (ac.kr)" value={email} aria-invalid={Boolean(error)} aria-describedby={error ? 'login-error' : 'login-hint'} onChange={(event) => { setEmail(event.target.value); setError(''); setNotice('') }} />
          <p id="login-hint" className="login-hint text-caption-11">비밀번호 없이 메일 인증만으로 로그인해요</p>
          {error && <p id="login-error" className="login-error text-body-13" role="alert">{error}</p>}
          {notice && <p className="login-notice text-body-13" role="status">{notice}</p>}
          {isAuthDemo && <p className="auth-demo">개발용 미리보기 / 실제 메일은 발송되지 않음</p>}
        </div>
      </form>
    </AuthFrame>
  )
}

export default LoginPage
