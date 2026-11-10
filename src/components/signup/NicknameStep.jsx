import stamp from '../../shared/assets/stamps/penpal.svg'

/** @param {{value: string, onChange: (nickname: string) => void}} props */
export default function NicknameStep({ value, onChange }) {
  return <>
    <div className="signup-letter"><div className="signup-letter-paper"><p>안녕하세요, 저는</p><span className="signup-letter-signature">From. {value.trim()}</span></div><div className="signup-letter-stamp"><img src={stamp} alt="" /><span className="signup-stamp-brand">동글</span><span className="signup-stamp-number">No.05</span><span className="signup-stamp-label">펜팔 친구</span></div></div>
    <label className="auth-field"><span className="auth-sr-only">편지에 적힐 닉네임</span><input className="auth-input" type="text" name="nickname" autoComplete="nickname" maxLength={10} placeholder="닉네임을 입력해주세요" value={value} onChange={(event) => onChange(event.target.value)} aria-describedby="nickname-help nickname-count" /></label>
    <div className="signup-nickname-hint"><p id="nickname-help" className="auth-caption">2~10자, 다른 사람과 겹치지 않게 지어주세요</p><span id="nickname-count" className="auth-caption">{value.length} / 10</span></div>
  </>
}
