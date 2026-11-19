import * as demo from '../mocks/auth.js'
import { isApiDemo, request, setTokens, subscribeSession } from './client.js'
import { saveSignupProfile } from './profile.js'
import { mapProfile } from './mappers.js'
import { resolveRegion } from './regions.js'
export const isAuthDemo = isApiDemo
export const DEMO_CODE = demo.DEMO_CODE
export const isSchoolEmail = demo.isSchoolEmail
const challenges = new Map()
subscribeSession(() => challenges.clear())
export async function requestCode(email, purpose) {
  if (isApiDemo) return demo.requestCode(email, purpose)
  email = email.trim().toLowerCase()
  if (!isSchoolEmail(email)) throw new Error('학교 이메일(ac.kr)을 입력해주세요')
  let data
  try { data = await request('/api/auth/email/send/', { method: 'POST', auth: false, json: { email, purpose } }) }
  catch (error) {
    const previous = challenges.get(`${purpose}:${email}`)
    if (error?.code === 'CODE_RESEND_TOO_SOON' && previous && previous.expiresAt > Date.now()) {
      const retry = Number(error.retry_after_seconds)
      return { ...previous, resendAt: Number.isFinite(retry) ? Date.now() + retry * 1000 : previous.resendAt }
    }
    throw error
  }
  const challenge = { key: `${purpose}:${email}`, email, purpose, expiresAt: Date.parse(data.expires_at), resendAt: Date.now() + data.resend_available_seconds * 1000 }
  challenges.set(challenge.key, challenge)
  return challenge
}
export async function verifyCode(key, code) {
  if (isApiDemo) return demo.verifyCode(key, code)
  const challenge = challenges.get(key)
  if (!challenge) throw new Error('이메일 단계에서 코드를 다시 받아주세요')
  try {
    const data = await request('/api/auth/email/verify/', { method: 'POST', auth: false, json: { email: challenge.email, purpose: challenge.purpose, code } })
    if (challenge.purpose === 'signup') { challenge.signupToken = data.signup_token; return data }
    setTokens(data)
    return saveSignupProfile(mapProfile(data.user))
  } catch (error) {
    if (error.remaining_attempts !== undefined) error.message += ` (남은 시도 ${error.remaining_attempts}회)`
    throw error
  }
}
export async function checkNickname(nickname) {
  return request('/api/auth/nickname/check/', { auth: false, query: { nickname: nickname.trim() } })
}
export async function completeSignup(values) {
  if (isApiDemo) return demo.completeSignup(values)
  const { challengeKey, nickname, hometowns, residence, agreements } = values
  const signupToken = challenges.get(challengeKey)?.signupToken
  if (!signupToken) throw new Error('학교 이메일 인증을 먼저 완료해주세요')
  const hometownIds = await Promise.all(hometowns.map((region) => resolveRegion(region, 'hometown')))
  const residenceId = await resolveRegion(residence, 'residence')
  const data = await request('/api/auth/signup/', { method: 'POST', auth: false, json: {
    signup_token: signupToken, nickname: nickname.trim(), hometown_region_ids: hometownIds, residence_region_id: residenceId,
    terms: { service: agreements[0], privacy: agreements[1], age_over_14: agreements[2], marketing: agreements[3] },
  } })
  challenges.delete(challengeKey)
  setTokens(data)
  return saveSignupProfile(mapProfile(data.user))
}
