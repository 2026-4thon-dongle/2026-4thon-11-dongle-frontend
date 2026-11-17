import { useRef, useState } from 'react'
import Button from './Button.jsx'
import Mascot from './Mascot.jsx'
import useLayerFocus from '../hooks/useLayerFocus.js'
import circle from '../assets/reading/block-circle.svg'
import './Safety.css'

/**
 * 차단 확인 팝업 내용(3-8). 일기 차단(3-8)과 편지 차단(5-9)이 함께 쓴다. 공용 Overlay의 openDialog 안에 넣는다.
 * 요청은 부르는 쪽이 onConfirm으로 한다. 실패하면 던진 오류의 message를 팝업 안에 보여 준다.
 * @param {object} props
 * @param {string} props.nickname 차단할 상대 닉네임
 * @param {() => Promise<unknown>} props.onConfirm 차단 요청
 * @param {() => void} props.close 팝업 닫기
 * @param {() => void} props.onDone 성공한 뒤(팝업을 닫은 다음)
 * @param {string} [props.demoNote] 개발용 목 모드 안내
 */
function BlockDialog({ nickname, onConfirm, close, onDone, demoNote }) {
  const ref = useRef(null), submitting = useRef(false)
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  useLayerFocus(ref)
  async function block() {
    if (submitting.current) return
    submitting.current = true; setBusy(true)
    try { await onConfirm(); close(); onDone() }
    catch (err) { setError(err.message) }
    finally { submitting.current = false; setBusy(false) }
  }
  return <div className="safety-block-dialog" ref={ref}><div className="safety-block-scene"><img src={circle} alt="" /><Mascot pose="teary" size={70} alt="울먹이는 고향이" /></div><h2 className="text-title-20">{nickname}님을 차단할까요?</h2><p className="text-body-13">서로의 일기와 편지가 보이지 않게 돼요.<br />차단한 사실은 상대에게 알리지 않아요.</p><p className="safety-block-hint text-caption-11">마이 &gt; 설정에서 언제든 풀 수 있어요</p>{error && <p role="alert" className="safety-action-error text-caption-11">{error}</p>}{demoNote && <p className="safety-action-demo text-caption-11">{demoNote}</p>}<div className="safety-block-actions"><Button variant="secondary" onClick={close} disabled={busy}>취소</Button><Button onClick={block} disabled={busy}>{busy ? '처리 중…' : '차단하기'}</Button></div></div>
}

export default BlockDialog
