import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import DiaryPhotoInput from './DiaryPhotoInput.jsx'

/** @param {{profile: object|null, content: string, onContent: (text: string) => void, photo: File|null, onPhoto: (file: File|null) => void, prompt: string, onPrompt: () => void, onSubmit: (event: import('react').FormEvent) => void, busy: boolean, error: string, demo: boolean}} props */
export default function FirstDiaryEditor({ profile, content, onContent, photo, onPhoto, prompt, onPrompt, onUsePrompt, onSubmit, busy, error, demo }) {
  const residence = [profile?.residence?.province, profile?.residence?.district].filter(Boolean).join(' ') || '우리 동네'
  const hometowns = [...new Set(profile?.hometowns?.map((item) => item.province) || [])].join(' · ') || '그 동네'
  return <main className="first-diary-page first-diary-editor">
    <p className="first-diary-last-step text-label-15">마지막 단계</p><div className="first-diary-progress" role="progressbar" aria-label="가입 마지막 단계" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100} />
    <div className="first-diary-editor-heading"><h1 className="text-title-24">첫 고향 일기를<br />남겨볼까요?</h1><Mascot pose="sparkle" size={74} alt="반짝이는 고향이" /></div>
    <p className="first-diary-editor-description text-body-13">지금 사는 {residence}의 하루를 써주면<br />{hometowns}이 고향인 친구들에게 먼저 보여요</p>
    <aside className="first-diary-prompt" aria-label="글감 추천"><div className="first-diary-prompt-top"><span className="text-caption-11"><Icon name="pencil" size={18} />오늘의 글감</span><button type="button" onClick={onPrompt} disabled={busy}>다른 글감</button></div><button className="first-diary-use-prompt text-label-15" type="button" disabled={busy} onClick={onUsePrompt} aria-label="이 글감을 본문에 넣기">{prompt}</button></aside>
    <form id="first-diary-form" className="first-diary-form" onSubmit={onSubmit}>
      <DiaryPhotoInput file={photo} onChange={onPhoto} disabled={busy} />
      <div className="first-diary-writing"><label className="first-diary-visually-hidden" htmlFor="first-diary-content">첫 고향 일기 내용</label><textarea id="first-diary-content" name="content" value={content} onChange={(event) => onContent(event.target.value)} placeholder={`${prompt}\n\n우리 동네의 하루를 자유롭게 들려주세요`} maxLength={500} disabled={busy} aria-describedby="first-diary-count first-diary-save-error" aria-invalid={Boolean(error)} /><span id="first-diary-count" className="text-caption-11">{content.length} / 500</span></div>
      <p id="first-diary-save-error" className="first-diary-error text-caption-11" role="alert">{error}</p>
    </form>
    <footer className="first-diary-footer"><p className="first-diary-editor-hint text-caption-11">첫 일기를 올리면 동글이 시작돼요</p>{demo && <p className="first-diary-demo text-caption-11">개발용 미리보기 · 서버에 전송되지 않아요</p>}<Button type="submit" form="first-diary-form" disabled={busy || !content.trim()} aria-busy={busy}>{busy ? '올리는 중…' : '첫 일기 올리기'}</Button></footer>
  </main>
}
