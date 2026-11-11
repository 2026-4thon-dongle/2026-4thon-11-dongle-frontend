import { useRef, useState } from 'react'
import Header from '../../shared/ui/Header.jsx'
import Button from '../../shared/ui/Button.jsx'
import Chip from '../../shared/ui/Chip.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import { createOwnedDiary, updateOwnedDiary } from '../../shared/api/ownedDiary.js'
import { OWNED_DIARY_PROMPTS } from '../../shared/mocks/ownedDiary.js'
import OwnedDiaryPhotoField from './OwnedDiaryPhotoField.jsx'

/** @param {{diary?: object, profile: object, onSaved: (diary: object) => void, onBack: () => void}} props */
export default function OwnedDiaryEditor({ diary, profile, onSaved, onBack }) {
  const editing = Boolean(diary)
  const [content, setContent] = useState(diary?.content || '')
  const [photo, setPhoto] = useState(diary?.photo || null)
  const [receiveLetters, setReceiveLetters] = useState(diary?.receiveLetters ?? true)
  const [promptIndex, setPromptIndex] = useState(0)
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const submitting = useRef(false)
  async function save(event) {
    event.preventDefault()
    if (submitting.current || !content.trim()) return
    submitting.current = true; setBusy(true); setError('')
    try { const draft = { content, photo, receiveLetters }; const saved = editing ? await updateOwnedDiary(diary.id, draft) : await createOwnedDiary(draft); onSaved(saved) }
    catch (err) { setError(err.message) }
    finally { submitting.current = false; setBusy(false) }
  }
  const disabled = busy || !content.trim()
  return <main className={`owned-page owned-editor ${editing ? 'owned-editor--editing' : ''}`}><Header title={editing ? '일기 수정하기' : '고향 일기 쓰기'} onBack={onBack} right={<button className="owned-header-action" type="submit" form="owned-diary-form" disabled={disabled}>{editing ? '저장' : '등록'}</button>} /><div className="owned-editor-body"><Chip variant="light">{profile.regionLabel}에서 쓰는 일기</Chip>{!editing && <aside className="owned-prompt"><div><span className="text-caption-11"><Icon name="sparkle" size={18} />오늘의 글감</span><button type="button" onClick={() => setPromptIndex((index) => (index + 1) % OWNED_DIARY_PROMPTS.length)} disabled={busy}>다른 글감</button></div><p className="text-label-15" aria-live="polite">{OWNED_DIARY_PROMPTS[promptIndex]}</p></aside>}<form id="owned-diary-form" onSubmit={save}><OwnedDiaryPhotoField photo={photo} onChange={setPhoto} editing={editing} province={profile.province} disabled={busy} /><div className="owned-content-field"><label className="owned-sr-only" htmlFor="owned-diary-content">일기 내용</label><textarea id="owned-diary-content" name="content" value={content} onChange={(event) => { setContent(event.target.value); setError('') }} placeholder={`${profile.regionLabel}에서 보낸 하루를 들려주세요…`} maxLength={500} disabled={busy} aria-describedby="owned-diary-count owned-save-error" /><span id="owned-diary-count" className="text-caption-11">{content.length} / 500</span></div><div className="owned-letter-setting"><div><h2 className="text-label-15">이 일기로 편지 받기</h2><p className="text-caption-11">끄면 이 일기엔 편지 버튼이 보이지 않아요</p></div><button type="button" className="owned-switch" role="switch" aria-label="이 일기로 편지 받기" aria-checked={receiveLetters} onClick={() => setReceiveLetters(!receiveLetters)} disabled={busy}><span /></button></div><p id="owned-save-error" className="owned-error text-caption-11" role="alert">{error}</p></form></div><footer className="owned-editor-footer"><p className="owned-demo text-caption-11">개발용 미리보기 · 이 브라우저에 저장돼요</p><Button type="submit" form="owned-diary-form" disabled={disabled} aria-busy={busy}>{busy ? '저장 중…' : editing ? '수정 완료' : '일기 등록하기'}</Button></footer></main>
}
