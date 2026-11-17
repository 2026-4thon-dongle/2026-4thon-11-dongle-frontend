import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { hasSession, isApiDemo } from './client.js'
import { getSignupProfile, loadProfile, subscribeSignupProfile } from './profile.js'
import Loading from '../feedback/Loading.jsx'
import ErrorScreen from '../feedback/ErrorScreen.jsx'
export default function SessionGate({ children }) {
  const { pathname } = useLocation()
  const [profile, setProfile] = useState(getSignupProfile)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const publicPage = /^\/(?:intro|start|signup|login|preview)(?:\/|$)/.test(pathname) || (pathname === '/' && !hasSession())
  useEffect(() => subscribeSignupProfile(setProfile), [])
  useEffect(() => {
    if (isApiDemo || publicPage || !hasSession() || getSignupProfile()) return
    let active = true
    loadProfile().catch((reason) => { if (active) setError(reason) })
    return () => { active = false }
  }, [publicPage, attempt, pathname])
  // 로그인한 사람이 뒤로 가기나 주소로 소개·시작·가입·로그인 화면에 오면 홈(첫 일기 전이면 2-1)으로 보낸다.
  if (!isApiDemo && hasSession() && /^\/(?:intro|start|signup|login)(?:\/|$)/.test(pathname)) return <Navigate to="/" replace />
  if (isApiDemo || publicPage) return children
  if (!hasSession()) return <Navigate to="/login" replace />
  if (error) return <ErrorScreen description={error.message} hint="" onRetry={() => { setError(null); setAttempt((n) => n + 1) }} />
  if (!profile) return <Loading />
  if (pathname === '/') return <Navigate to={profile.first_diary_completed ? '/home' : '/diary/first'} replace />
  if (!profile.first_diary_completed && !pathname.startsWith('/diary/first')) return <Navigate to="/diary/first" replace />
  return children
}
