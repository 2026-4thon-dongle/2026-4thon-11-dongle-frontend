import { useRef, useState } from 'react'
import Button from './Button.jsx'
import Icon from './Icon.jsx'
import useLayerFocus from '../hooks/useLayerFocus.js'
import { REPORT_REASONS } from './reportReasons.js'
import './Safety.css'

/**
 * 신고 시트 내용(3-7). 일기 신고(3-7)와 편지 신고(5-9)가 함께 쓴다. 공용 Overlay의 openSheet 안에 넣는다.
 * 요청은 부르는 쪽이 onSubmit으로 한다. 실패하면 던진 오류의 message를 시트 안에 보여 준다.
 * @param {object} props
 * @param {string} props.nickname 함께 차단할 상대 닉네임 ("○○님 차단하기")
 * @param {import('react').ReactNode} props.description 사유 위 안내 문구
 * @param {(input: { reason: string, label: string, details: string, block: boolean }) => Promise<unknown>} props.onSubmit reason은 서버 코드, label은 화면 문구
 * @param {() => void} props.close 시트 닫기
 * @param {(result: unknown) => void} props.onDone 성공한 뒤(시트를 닫은 다음) onSubmit 결과를 받는다
 * @param {string} [props.demoNote] 개발용 목 모드 안내. 있으면 버튼 위에 보여 준다
 */
function ReportForm({ nickname, description, onSubmit, close, onDone, demoNote }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [block, setBlock] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const ref = useRef(null), submitting = useRef(false)
  useLayerFocus(ref)
  const selected = REPORT_REASONS.find((item) => item.code === reason)
  async function submit(event) {
    event.preventDefault()
    if (submitting.current || !selected) return
    submitting.current = true; setBusy(true); setError('')
    try { const result = await onSubmit({ reason: selected.code, label: selected.label, details, block }); close(); onDone(result) }
    catch (err) { setError(err.message) }
    finally { submitting.current = false; setBusy(false) }
  }
  return <form className="safety-report" ref={ref} onSubmit={submit}>
    <p className="safety-report-description text-caption-11">{description}</p>
    <fieldset><legend className="safety-sr-only">신고 사유</legend>{REPORT_REASONS.map((item) => <label className="safety-report-reason" key={item.code}><input type="radio" name="report-reason" value={item.code} checked={reason === item.code} onChange={() => { setReason(item.code); setError('') }} disabled={busy} /><span>{item.label}</span></label>)}</fieldset>
    {reason === 'etc' && <label className="safety-report-other"><span className="text-caption-11">신고 내용</span><textarea value={details} onChange={(event) => setDetails(event.target.value)} required maxLength={200} disabled={busy} placeholder="어떤 점이 불편했는지 알려주세요" /></label>}
    <label className="safety-report-block"><span className="safety-report-checkbox"><input type="checkbox" checked={block} onChange={(event) => setBlock(event.target.checked)} disabled={busy} />{block && <Icon name="check" size={18} />}</span><span><strong>{nickname}님 차단하기</strong><small>서로의 일기와 편지가 안 보이고, 상대에겐 알리지 않아요</small></span></label>
    {error && <p className="safety-action-error text-caption-11" role="alert">{error}</p>}
    {demoNote && <p className="safety-action-demo text-caption-11">{demoNote}</p>}
    <Button type="submit" disabled={busy || !reason || (reason === 'etc' && !details.trim())}>{busy ? '처리 중…' : '신고하기'}</Button>
  </form>
}

export default ReportForm
