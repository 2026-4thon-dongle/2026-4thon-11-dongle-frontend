import { useRef, useState } from 'react'
import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import { blockReadingAuthor, reportReadingDiary } from '../../shared/api/readingDiary.js'
import { READING_REPORT_REASONS } from '../../shared/mocks/readingDiary.js'
import useReadingLayerFocus from './useReadingLayerFocus.js'
import circle from '../../shared/assets/reading/block-circle.svg'
import './ReadingModeration.css'

/** @param {{diary: object, onReport: () => void, onBlock: () => void}} props */
export function DiaryMenu({ diary, onReport, onBlock }) {
  const ref = useRef(null)
  useReadingLayerFocus(ref)
  return <div className="reading-menu" ref={ref}><button type="button" onClick={onReport}><span className="reading-menu-icon reading-menu-icon--report"><Icon name="flag" /></span><span><strong>신고하기</strong><small>불편한 내용을 운영진에게 알려요</small></span></button><button type="button" onClick={onBlock}><span className="reading-menu-icon"><Icon name="ban" /></span><span><strong>차단하기</strong><small>서로의 일기와 편지가 보이지 않아요</small></span></button><span className="reading-sr-only">{diary.nickname}의 일기 메뉴</span></div>
}

/** @param {{diary: object, close: () => void, onDone: () => void}} props */
export function ReportDiaryForm({ diary, close, onDone }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [blockAuthor, setBlockAuthor] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const ref = useRef(null), submitting = useRef(false)
  useReadingLayerFocus(ref)
  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true; setBusy(true); setError('')
    try { await reportReadingDiary({ diaryId: diary.id, reason, details, blockAuthor }); close(); onDone() }
    catch (err) { setError(err.message) }
    finally { submitting.current = false; setBusy(false) }
  }
  return <form className="reading-report" ref={ref} onSubmit={submit}>
    <p className="reading-report-description text-caption-11">신고하면 내 화면에서 바로 숨겨지고, 3건이 쌓이면<br />모두에게 숨겨진 뒤 운영진이 확인해요</p>
    <fieldset><legend className="reading-sr-only">신고 사유</legend>{READING_REPORT_REASONS.map((label) => <label className="reading-report-reason" key={label}><input type="radio" name="report-reason" value={label} checked={reason === label} onChange={() => { setReason(label); setError('') }} disabled={busy} /><span>{label}</span></label>)}</fieldset>
    {reason === '기타 (직접 입력)' && <label className="reading-report-other"><span className="text-caption-11">신고 내용</span><textarea value={details} onChange={(event) => setDetails(event.target.value)} required disabled={busy} placeholder="어떤 점이 불편했는지 알려주세요" /></label>}
    <label className="reading-report-block"><span className="reading-report-checkbox"><input type="checkbox" checked={blockAuthor} onChange={(event) => setBlockAuthor(event.target.checked)} disabled={busy} />{blockAuthor && <Icon name="check" size={18} />}</span><span><strong>{diary.nickname}님 차단하기</strong><small>서로의 일기와 편지가 안 보이고, 상대에겐 알리지 않아요</small></span></label>
    {error && <p className="reading-action-error text-caption-11" role="alert">{error}</p>}
    <p className="reading-action-demo text-caption-11">개발용 미리보기 · 실제 운영진에게 전송되지 않아요</p>
    <Button type="submit" disabled={busy || !reason || (reason === '기타 (직접 입력)' && !details.trim())}>{busy ? '처리 중…' : '신고하기'}</Button>
  </form>
}

/** @param {{diary: object, close: () => void, onDone: () => void}} props */
export function BlockDiaryDialog({ diary, close, onDone }) {
  const ref = useRef(null), submitting = useRef(false)
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  useReadingLayerFocus(ref)
  async function block() {
    if (submitting.current) return
    submitting.current = true; setBusy(true)
    try { await blockReadingAuthor(diary.authorId); close(); onDone() }
    catch (err) { setError(err.message) }
    finally { submitting.current = false; setBusy(false) }
  }
  return <div className="reading-block-dialog" ref={ref}><div className="reading-block-scene"><img src={circle} alt="" /><Mascot pose="teary" size={70} alt="울먹이는 고향이" /></div><h2 className="text-title-20">{diary.nickname}님을 차단할까요?</h2><p className="text-body-13">서로의 일기와 편지가 보이지 않게 돼요.<br />차단한 사실은 상대에게 알리지 않아요.</p><p className="reading-block-hint text-caption-11">마이 &gt; 설정에서 언제든 풀 수 있어요</p>{error && <p role="alert" className="reading-action-error text-caption-11">{error}</p>}<p className="reading-action-demo text-caption-11">개발용 차단 · 서버에는 저장되지 않아요</p><div className="reading-block-actions"><Button variant="secondary" onClick={close} disabled={busy}>취소</Button><Button onClick={block} disabled={busy}>{busy ? '처리 중…' : '차단하기'}</Button></div></div>
}
