import lockedMascot from '../assets/auth/code-locked-mascot.svg'
import { useEffect, useRef, useState } from 'react'
import Button from './Button.jsx'
import AuthFrame, { AuthHeading } from './AuthFrame.jsx'
import { DEMO_CODE, isAuthDemo, requestCode, verifyCode } from '../api/auth.js'
import Icon from './Icon.jsx'
import './CodeVerification.css'

/**
 * @param {{challenge: {key: string, email: string, purpose: string, expiresAt: number, resendAt: number}, onChallenge: (challenge: object) => void, onBack: () => void, onVerified: (result: object) => void, login?: boolean}} props
 */
export default function CodeVerification({ challenge, onChallenge, onBack, onVerified, login = false }) {
  const [digits, setDigits] = useState(Array(6).fill(''))
  const [error, setError] = useState('')
  const [locked, setLocked] = useState(false)
  const [resendError, setResendError] = useState('')
  const [notice, setNotice] = useState('')
  const [now, setNow] = useState(Date.now)
  const [busy, setBusy] = useState(false)
  const inputs = useRef([])
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [])
  const seconds = Math.max(0, Math.ceil((challenge.expiresAt - now) / 1000))
  const cooldown = Math.max(0, Math.ceil((challenge.resendAt - now) / 1000))
  function update(index, value) {
    const numbers = value.replace(/\D/g, '').slice(0, 6 - index).split('')
    setDigits((current) => { const next = [...current]; next[index] = ''; numbers.forEach((digit, offset) => { next[index + offset] = digit }); return next })
    setError('')
    if (numbers.length) inputs.current[Math.min(index + numbers.length, 5)]?.focus()
  }
  async function submit(event) {
    event.preventDefault()
    if (busy || locked) return
    if (digits.some((digit) => !digit)) { setError('인증 코드 6자리를 모두 입력해주세요'); inputs.current[digits.findIndex((digit) => !digit)]?.focus(); return }
    setBusy(true)
    try { const result = await verifyCode(challenge.key, digits.join('')); onVerified(result) }
    catch (err) { setError(err.message); if (err.code === 'CODE_ATTEMPTS_EXCEEDED' || err.remaining_attempts === 0) setLocked(true) }
    finally { setBusy(false) }
  }
  async function resend() {
    if (busy || cooldown > 0) return
    setResendError('')
    setBusy(true)
    try { const next = await requestCode(challenge.email, challenge.purpose); onChallenge(next); setDigits(Array(6).fill('')); setLocked(false); setError(''); setNow(Date.now()); setNotice(isAuthDemo ? '개발용 코드를 갱신했어요' : '새 코드를 보냈어요'); inputs.current[0]?.focus() }
    catch (err) {
      if (err.retry_after_seconds !== undefined) onChallenge({ ...challenge, resendAt: Date.now() + err.retry_after_seconds * 1000 })
      setError(err.message); setResendError(err.message)
    }
    finally { setBusy(false) }
  }
  return <AuthFrame title={login ? '로그인' : '회원가입'} progress={login ? undefined : 40} onBack={onBack} className={locked ? 'code-page code-page--locked' : 'code-page'} footer={locked ? <div className="code-recovery-actions"><Button onClick={resend} disabled={busy || cooldown > 0}>{busy ? '받는 중…' : cooldown > 0 ? `새 코드 받기 (${cooldown}초)` : '새 코드 받기'}</Button><Button variant="ghost" disabled={busy} onClick={onBack}>이메일 다시 입력하기</Button></div> : <Button type="submit" form="code-form" disabled={busy || seconds === 0}>인증 완료</Button>}>
    <AuthHeading description={<span className="code-email">{challenge.email}</span>}>메일로 받은<br />인증 코드를 입력해주세요</AuthHeading>
    <form id="code-form" onSubmit={submit} noValidate>
      <fieldset className={`code-digits ${error || locked ? 'code-digits--error' : ''}`} aria-describedby="code-help code-error">
        <legend className="auth-sr-only">6자리 인증 코드</legend>
        {digits.map((digit, index) => <input key={index} ref={(element) => { inputs.current[index] = element }} aria-label={`인증 코드 ${index + 1}번째 자리`} aria-invalid={Boolean(error) || locked} disabled={locked} readOnly={busy} value={digit} type="text" inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} onChange={(event) => update(index, event.target.value)} onFocus={(event) => event.target.select()} onPaste={(event) => { event.preventDefault(); update(index, event.clipboardData.getData('text')) }} onKeyDown={(event) => { if (event.key === 'Backspace' && !digit && index > 0) { inputs.current[index - 1]?.focus() } if (event.key === 'ArrowLeft') inputs.current[index - 1]?.focus(); if (event.key === 'ArrowRight') inputs.current[index + 1]?.focus() }} />)}
      </fieldset>
      {!locked && <div className="code-tools"><span><Icon name="clock" size={16} />{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span><button type="button" className="auth-link-button" disabled={busy || cooldown > 0} onClick={resend}>코드 다시 받기{cooldown > 0 ? ` (${cooldown}초)` : ''}</button></div>}
      {locked && <h3 className="code-locked-title">이 코드는 잠겼어요</h3>}
      {!locked && <p id="code-help" className="auth-caption">메일이 안 왔다면 스팸함도 확인해주세요</p>}
      <p id="code-error" className="auth-caption auth-error" role="alert">{locked ? <>인증 시도 5회를 모두 사용했어요.<br />보안을 위해 새 코드를 받아주세요</> : error || (seconds === 0 ? '코드가 만료됐어요. 새 코드를 받아주세요' : '')}</p>
      {!locked && (error || seconds === 0) && <div className="code-expiry"><strong>코드 유효시간(5분)이 지났다면</strong><p>“코드 다시 받기”로 새 코드를 받아주세요</p></div>}
      {locked && <div className="code-locked-note"><div><strong>새 코드를 받으면 다시 5번 시도할 수 있어요</strong><p>메일 주소가 틀렸다면 이메일을 다시 입력해주세요</p></div><img src={lockedMascot} width={52} height={48} alt="" /></div>}
      {locked && resendError && <p className="auth-caption auth-error" role="alert">{resendError}</p>}
      {notice && <p className="auth-caption" role="status">{notice}</p>}
      {isAuthDemo && <p className="auth-demo">개발용 미리보기 · 실제 메일은 발송되지 않아요.<br />테스트 코드: <strong>{DEMO_CODE}</strong></p>}
    </form>
  </AuthFrame>
}
