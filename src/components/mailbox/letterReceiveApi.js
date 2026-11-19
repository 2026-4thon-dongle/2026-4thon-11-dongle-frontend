import { ApiError, isApiDemo, request, subscribeSession } from '../../shared/api/client.js'
import { toLetterDetail } from './letterReceiveMapper.js'
import {
  blockDemoSender,
  fetchDemoLetterDetail,
  markDemoLetterReplied,
  openDemoLetter,
  passDemoLetter,
  reportDemoLetter,
} from './letterReceiveDemo.js'

let reportedLetterIds = new Set()
subscribeSession(() => { reportedLetterIds = new Set() })

export function isReportedLetter(id) {
  return reportedLetterIds.has(String(id))
}

const letterPath = (letterId) => `/api/letters/${encodeURIComponent(letterId)}/`

export async function fetchLetterDetail(letterId) {
  if (isReportedLetter(letterId)) return null
  if (isApiDemo) return fetchDemoLetterDetail(letterId)
  try {
    return toLetterDetail(await request(letterPath(letterId)))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export async function openLetter(letterId) {
  if (isApiDemo) return openDemoLetter(letterId)
  return toLetterDetail(await request(`${letterPath(letterId)}open/`, { method: 'POST' }))
}

export async function passLetter(letterId) {
  if (isApiDemo) return passDemoLetter(letterId)
  await request(`${letterPath(letterId)}pass/`, { method: 'POST' })
}

export async function markLetterReplied(letterId) {
  if (isApiDemo) await markDemoLetterReplied(letterId)
}

export async function reportLetter({ letterId, reason, details, block }) {
  const hidden = reportedLetterIds
  const result = await (isApiDemo ? reportDemoLetter({ letterId, reason, details, block }) : request('/api/reports/', {
    method: 'POST',
    json: { target_type: 'letter', target_id: Number(letterId), reason, detail: reason === 'etc' ? details.trim() : '', block_user: block },
  }))
  hidden.add(String(letterId))
  return result
}

export async function blockLetterSender(userId) {
  if (isApiDemo) return blockDemoSender(userId)
  await request('/api/blocks/', { method: 'POST', json: { user_id: Number(userId) } })
}
