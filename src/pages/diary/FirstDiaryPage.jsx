import { insertDiaryPrompt } from '../../shared/utils/diaryPrompt.js'
import useDiaryPrompt from '../../shared/hooks/useDiaryPrompt.js'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import FirstDiaryWelcome from '../../components/diary/FirstDiaryWelcome.jsx'
import FirstDiaryEditor from '../../components/diary/FirstDiaryEditor.jsx'
import FirstDiaryComplete from '../../components/diary/FirstDiaryComplete.jsx'
import { isFirstDiaryDemo, publishFirstDiary } from '../../shared/api/firstDiary.js'
import { MOCK_DIARY_PROMPTS, MOCK_FIRST_DIARY_PROFILE } from '../../shared/mocks/firstDiary.js'
import { getOwnedDiarySnapshot } from '../../shared/api/ownedDiary.js'
import { getSignupProfile } from '../../shared/api/profile.js'
import './FirstDiaryPage.css'

function validProfile(profile) {
  return typeof profile?.nickname === 'string' && typeof profile?.residence?.province === 'string' && Array.isArray(profile?.hometowns) && profile.hometowns.length > 0 && profile.hometowns.every((region) => typeof region?.province === 'string')
}

export default function FirstDiaryPage() {
  const { '*': path = '' } = useParams()
  const step = path || 'welcome'
  const location = useLocation()
  const navigate = useNavigate()
  const [profile] = useState(() => validProfile(location.state?.profile) ? location.state.profile : getSignupProfile() || (isFirstDiaryDemo ? MOCK_FIRST_DIARY_PROFILE : null))
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState(null)
  const prompt = useDiaryPrompt(MOCK_DIARY_PROMPTS, step === 'write')
  const [result, setResult] = useState(() => getOwnedDiarySnapshot().diaries.find((diary) => diary.isFirstDiary) || null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const go = (next) => navigate(`/diary/first/${next}`, { state: { profile } })

  useEffect(() => {
    window.scrollTo(0, 0)
    const heading = document.querySelector('.first-diary-page h1')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
  }, [step])

  async function submit(event) {
    event.preventDefault()
    if (submitting.current || !content.trim()) return
    submitting.current = true
    setBusy(true)
    setError('')
    try { setResult(await publishFirstDiary({ content, photo, profile })); go('complete') }
    catch (err) { setError(err.message || '일기를 올리지 못했어요. 다시 시도해주세요') }
    finally { submitting.current = false; setBusy(false) }
  }

  if (profile?.first_diary_completed && !result) return <Navigate to="/home" replace />
  if (!['welcome', 'write', 'complete'].includes(step)) return <Navigate to="/diary/first" replace state={{ profile }} />
  if (step === 'complete' && !result) return <Navigate to="/diary/first/write" replace state={{ profile }} />
  if (step === 'write' && result) return <Navigate to="/diary/first/complete" replace state={{ profile }} />
  if (step === 'complete') return <FirstDiaryComplete profile={profile} demo={isFirstDiaryDemo} onNext={() => navigate('/home')} />
  if (step === 'welcome') return <FirstDiaryWelcome profile={profile} demo={isFirstDiaryDemo} onNext={() => go(result ? 'complete' : 'write')} />
  return <FirstDiaryEditor profile={profile} content={content} onContent={(value) => { setContent(value); setError('') }} photo={photo} onPhoto={setPhoto} prompt={prompt.text} onPrompt={prompt.next} onUsePrompt={() => { try { setContent(insertDiaryPrompt(content, prompt.text)); setError(''); document.getElementById('first-diary-content')?.focus() } catch (err) { setError(err.message) } }} onSubmit={submit} busy={busy} error={error || prompt.error} demo={isFirstDiaryDemo} />
}
