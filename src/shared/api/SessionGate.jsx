import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { hasSession, isApiDemo, sessionEndReason } from './client.js'
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
  // 로그아웃·탈퇴 뒤에는 시작 화면(1-4)으로, 토큰이 만료됐으면 안내와 함께 로그인 화면(1-12)으로 보낸다.
  // 로그아웃 화면이 /start로 이동하기 전에 토큰이 먼저 지워져도 같은 곳으로 간다.
  if (!hasSession()) return sessionEndReason() === 'logout' ? <Navigate to="/start" replace /> : <Navigate to="/login" replace state={sessionEndReason() === 'expired' ? { expired: true } : undefined} />
  if (error) return <ErrorScreen description={error.message} hint="" onRetry={() => { setError(null); setAttempt((n) => n + 1) }} />
  if (!profile) return <Loading />
  if (pathname === '/') return <Navigate to={profile.first_diary_completed ? '/home' : '/diary/first'} replace />
  if (!profile.first_diary_completed && !pathname.startsWith('/diary/first')) return <Navigate to="/diary/first" replace />
  return children
}
