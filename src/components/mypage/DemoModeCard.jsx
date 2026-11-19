import { useEffect, useState } from 'react'
import { isApiDemo, request } from '../../shared/api/client.js'
import Toggle from './Toggle.jsx'
import './DemoModeCard.css'

/**
 * 시연용 임시 스위치(이슈 #150). 켜면 새로 보내는 편지가 1분 만에 도착하고, 끄면 거리만큼 걸린다.
 * 서버 GET·PUT /api/letters/demo-mode/를 쓴다. 마감 뒤에는 이 파일과 SettingsPage의 사용처를 지운다.
 */
function DemoModeCard() {
  const [enabled, setEnabled] = useState(isApiDemo ? false : null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isApiDemo) return undefined
    let live = true
    request('/api/letters/demo-mode/').then((data) => { if (live) setEnabled(Boolean(data.enabled)) }).catch((err) => { if (live) setError(err.message) })
    return () => { live = false }
  }, [])

  async function change(next) {
    setBusy(true)
    setError('')
    try {
      const data = isApiDemo ? { enabled: next } : await request('/api/letters/demo-mode/', { method: 'PUT', json: { enabled: next } })
      setEnabled(Boolean(data.enabled))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="demo-mode-card" aria-label="데모 모드">
      <div className="demo-mode-card__text">
        <h3 className="demo-mode-card__title">데모 모드 (시연용)</h3>
        <p className="demo-mode-card__desc">
          {enabled ? '켜짐 · 새 편지가 거리와 상관없이 1분 뒤 도착해요' : '꺼짐 · 새 편지가 거리만큼 걸려 도착해요'}
        </p>
        {error && <p className="demo-mode-card__error" role="alert">{error}</p>}
      </div>
      {enabled !== null && <Toggle checked={enabled} label="데모 모드" onChange={(next) => { if (!busy) change(next) }} />}
    </section>
  )
}

export default DemoModeCard