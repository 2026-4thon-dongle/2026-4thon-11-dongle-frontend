import { useRef, useState } from 'react'
import Button from '../../shared/ui/Button.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import { deleteOwnedDiary, setOwnedDiaryVisibility } from '../../shared/api/ownedDiary.js'
import useOwnedLayerFocus from './useOwnedLayerFocus.js'
import circle from './assets/delete-circle.svg'

/** @param {{onEdit: () => void, onDelete: () => void, onVisibility: () => void}} props */
export function OwnedDiaryMenu({ onEdit, onDelete, onVisibility }) {
  const ref = useRef(null)
  useOwnedLayerFocus(ref)
  return <div className="owned-menu" ref={ref}>{[{ label: '수정하기', icon: 'pencil', action: onEdit }, { label: '삭제하기', icon: 'trash', action: onDelete, danger: true }, { label: '공개 범위 설정', icon: 'lock', action: onVisibility }].map((item) => <button type="button" key={item.label} onClick={item.action} className={item.danger ? 'owned-menu-danger' : ''}><span><Icon name={item.icon} /></span><strong>{item.label}</strong></button>)}</div>
}

/** @param {{diary: object, close: () => void, onSaved: () => void}} props */
export function OwnedVisibilitySheet({ diary, close, onSaved }) {
  const [visibility, setVisibility] = useState(diary.visibility)
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const ref = useRef(null), submitting = useRef(false)
  useOwnedLayerFocus(ref)
  const options = [{ id: 'all', title: '모두에게', description: `모든 지역 피드에 보여요 (${diary.province}이 고향인 사람에게 먼저)` }, { id: 'hometown', title: `${diary.province}이 고향인 사람에게만`, description: '고향 사람들끼리만 볼 수 있어요' }, { id: 'private', title: '나만 보기', description: '피드에 올라가지 않고 내 일기에만 남아요' }]
  async function save(event) { event.preventDefault(); if (submitting.current) return; submitting.current = true; setBusy(true); try { await setOwnedDiaryVisibility(diary.id, visibility); close(); onSaved() } catch (err) { setError(err.message) } finally { submitting.current = false; setBusy(false) } }
  return <form className="owned-visibility" ref={ref} onSubmit={save}><fieldset><legend className="owned-sr-only">일기 공개 범위</legend>{options.map((option) => <label key={option.id} className={visibility === option.id ? 'is-selected' : ''}><input type="radio" name="owned-visibility" value={option.id} checked={visibility === option.id} onChange={() => setVisibility(option.id)} disabled={busy} /><span><strong>{option.title}</strong><small>{option.description}</small></span></label>)}</fieldset>{error && <p className="owned-error text-caption-11" role="alert">{error}</p>}<p className="owned-demo text-caption-11">개발용 설정 · 실제 피드 공개 범위는 변경되지 않아요</p><Button type="submit" disabled={busy}>{busy ? '저장 중…' : '저장'}</Button></form>
}

/** @param {{diary: object, close: () => void, onDeleted: () => void}} props */
export function OwnedDeleteDialog({ diary, close, onDeleted }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const ref = useRef(null), submitting = useRef(false)
  useOwnedLayerFocus(ref)
  async function remove() { if (submitting.current) return; submitting.current = true; setBusy(true); try { await deleteOwnedDiary(diary.id); close(); onDeleted() } catch (err) { setError(err.message) } finally { submitting.current = false; setBusy(false) } }
  return <div className="owned-delete-dialog" ref={ref}><div className="owned-delete-scene"><img src={circle} alt="" /><Mascot pose="teary" size={70} alt="울먹이는 고향이" /></div><h2 className="text-title-20">이 일기를 삭제할까요?</h2><p className="text-body-13">삭제한 일기는 되돌릴 수 없어요</p>{error && <p className="owned-error text-caption-11" role="alert">{error}</p>}<p className="owned-demo text-caption-11">개발용 일기만 삭제돼요</p><div className="owned-delete-actions"><Button variant="secondary" onClick={close} disabled={busy}>취소</Button><Button className="owned-danger-button" onClick={remove} disabled={busy}>{busy ? '삭제 중…' : '삭제하기'}</Button></div></div>
}
