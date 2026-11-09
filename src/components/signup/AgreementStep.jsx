import { useState } from 'react'
import Mascot from '../../shared/ui/Mascot.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import TermsDialog from './TermsDialog.jsx'
import { TERMS } from './terms.js'

const labels = TERMS.map((term) => term.label)

/** @param {{value: boolean[], onChange: (agreements: boolean[]) => void}} props */
export default function AgreementStep({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState(0)
  const all = value.every(Boolean)
  function showTerm(index) { setTerm(index); setOpen(true) }
  return <>
    <div className="signup-terms-heading"><h2 className="text-title-24">동글을 시작하기 전에<br />약관에 동의해주세요</h2><Mascot pose="smile" size={72} alt="웃는 고향이" /></div>
    <label className="signup-agree-all"><input type="checkbox" checked={all} onChange={() => onChange(value.map(() => !all))} /><span className={`signup-checkbox signup-checkbox--all ${all ? 'is-checked' : ''}`}>{all && <Icon name="check" size={20} />}</span><span className="text-title-17">전체 동의하기</span></label>
    <div className="signup-agreements">{labels.map((label, index) => <div className="signup-agreement-row" key={label}><label><input type="checkbox" checked={value[index]} onChange={() => onChange(value.map((checked, item) => item === index ? !checked : checked))} /><span className={`signup-checkbox ${value[index] ? 'is-checked' : ''}`}>{value[index] && <Icon name="check" size={18} />}</span><span>{label}</span></label>{<button type="button" aria-label={`${label} 보기`} onClick={() => showTerm(index)}><Icon name="chevron" size={20} /></button>}</div>)}</div>
    <p className="signup-email-note text-caption-11">학교 이메일은 대학생 인증·로그인에 쓰이고<br />다른 사람에게 절대 보이지 않아요</p>
    <TermsDialog open={open} term={TERMS[term]} onClose={() => setOpen(false)} />
  </>
}
