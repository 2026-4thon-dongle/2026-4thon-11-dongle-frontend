import assert from 'node:assert/strict'
import { createServer } from 'vite'
const storage = new Map()
globalThis.localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) }
globalThis.window = new EventTarget()
window.location = { origin: 'http://frontend.test' }
process.env.VITE_API_BASE_URL = ''
const vite = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, mode: 'production' })
let checks = 0
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
try {
  const { insertDiaryPrompt } = await vite.ssrLoadModule('/src/shared/utils/diaryPrompt.js')
  assert.equal(insertDiaryPrompt('existing body', 'question?'), 'question?\n\nexisting body')
  assert.equal(insertDiaryPrompt('question?\n\nexisting body', 'question?'), 'question?\n\nexisting body')
  assert.throws(() => insertDiaryPrompt('x'.repeat(500), 'question?'))
  checks++
  const client = await vite.ssrLoadModule('/src/shared/api/client.js')
  assert.equal(client.isApiDemo, false)
  client.saveTokens({ access: 'expired', refresh: 'refresh-old' })
  let refreshes = 0
  globalThis.fetch = async (url, options) => {
    if (url === '/api/auth/token/refresh/') {
      refreshes++
      assert.deepEqual(JSON.parse(options.body), { refresh: 'refresh-old' })
      await new Promise((resolve) => setTimeout(resolve, 10))
      return json({ access: 'access-new', refresh: 'refresh-new' })
    }
    if (options.headers.get('Authorization') === 'Bearer expired') return json({ code: 'TOKEN_NOT_VALID', message: 'expired' }, 401)
    assert.equal(options.headers.get('Authorization'), 'Bearer access-new')
    return json({ ok: true })
  }
  const values = await Promise.all([client.request('/api/users/me/'), client.request('/api/notifications/unread-count/')])
  assert(values.every((item) => item.ok)); assert.equal(refreshes, 1)
  assert.equal(client.getTokens().refresh, 'refresh-new'); checks++
  globalThis.fetch = async () => json({ code: 'VALIDATION_ERROR', message: 'invalid', errors: { body: ['required'] }, remaining_attempts: 4 }, 400)
  await assert.rejects(client.request('/api/diaries/'), (error) => error.code === 'VALIDATION_ERROR' && error.errors.body[0] === 'required' && error.remaining_attempts === 4); checks++
  globalThis.fetch = async () => new Response(null, { status: 204 })
  assert.equal(await client.request('/api/diaries/1/', { method: 'DELETE' }), null); checks++
  const auth = await vite.ssrLoadModule('/src/shared/api/auth.js')
  const user = { id: 1, nickname: 'tester', hometowns: [{ id: 1, full_name: '서울특별시' }], residence: { id: 148, full_name: '충남 천안시' }, first_diary_completed: false }
  let signupBody
  globalThis.fetch = async (url, options) => {
    const body = options.body ? JSON.parse(options.body) : null
    assert.equal(options.headers.has('Authorization'), false)
    if (url === '/api/auth/email/send/') { assert.equal(body.email, 'test@school.ac.kr'); return json({ expires_at: '2026-11-15T20:00:00+09:00', resend_available_seconds: 60 }) }
    if (url === '/api/auth/email/verify/') { assert.equal(body.purpose, 'signup'); return json({ signup_token: 'signup-token' }) }
    assert.equal(url, '/api/auth/signup/'); signupBody = body
    return json({ access: 'signed-in', refresh: 'signed-refresh', user }, 201)
  }
  const challenge = await auth.requestCode('TEST@school.ac.kr', 'signup')
  assert(challenge.resendAt - Date.now() > 59000)
  await auth.verifyCode(challenge.key, '123456')
  const profile = await auth.completeSignup({ challengeKey: challenge.key, nickname: 'tester', hometowns: [{ id: 1 }], residence: { id: 148 }, agreements: [true, true, true, false] })
  assert.equal(profile.id, '1'); assert.equal(profile.hometowns[0].province, '서울')
  assert.deepEqual(signupBody.hometown_region_ids, [1]); assert.equal(signupBody.residence_region_id, 148)
  assert.equal(signupBody.signup_token, 'signup-token'); assert.equal(signupBody.terms.marketing, false); checks++
  const owned = await vite.ssrLoadModule('/src/shared/api/ownedDiary.js')
  const rawDiary = { id: 31, author: { id: 1, nickname: 'tester' }, region: user.residence, body: 'hello', image: null, accepts_letters: true, visibility: 'all', received_letter_count: 0, created_at: '2026-11-15T12:00:00+09:00' }
  const photo = new File(['png'], 'photo.png', { type: 'image/png' })
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/diaries/'); assert.equal(options.method, 'POST')
    assert(options.body instanceof FormData); assert.equal(options.body.get('body'), 'hello')
    assert.equal(options.body.get('image').name, 'photo.png'); assert(!options.headers.has('Content-Type'))
    return json(rawDiary, 201)
  }
  const diary = await owned.createOwnedDiary({ content: ' hello ', photo: { file: photo }, receiveLetters: true })
  assert.equal(diary.id, '31'); assert.equal(diary.authorId, '1'); checks++
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/diaries/31/'); assert.equal(options.body.get('remove_image'), 'true')
    assert.equal(options.body.has('image'), false); return json(rawDiary)
  }
  await owned.updateOwnedDiary('31', { content: 'hello', photo: null, receiveLetters: false }); checks++
  globalThis.fetch = async (url, options) => {
    assert.equal(JSON.parse(options.body).visibility, 'same_hometown'); return json({ ...rawDiary, visibility: 'same_hometown' })
  }
  await owned.setOwnedDiaryVisibility('31', 'hometown'); assert.equal(owned.getOwnedDiarySnapshot().diaries[0].visibility, 'hometown'); checks++
  const reading = await vite.ssrLoadModule('/src/shared/api/readingDiary.js')
  globalThis.fetch = async (url) => {
    if (url === '/api/users/me/') return json(user)
    if (url === '/api/regions/') return json([])
    if (url === '/api/feed/hometown/summary/') return json({ new_count: 2 })
    if (url === '/api/notifications/unread-count/') return json({ unread_count: 1 })
    if (url === '/api/feed/hometown/seen/') return new Response(null, { status: 204 })
    assert.equal(url, '/api/feed/hometown/?page=1')
    return json({ results: [{ ...rawDiary, author: { id: 7, nickname: 'other' }, can_reply: false }], next: null, count: 1 })
  }
  await reading.loadReadingFeed()
  const state = reading.getReadingSnapshot()
  assert.equal(state.error, null); assert.equal(state.diaries.length, 1); assert.equal(state.newCount, 2)
  assert.equal(reading.canReplyToDiary(state.diaries[0], state.profile), false); checks++
  globalThis.fetch = async (url) => {
    assert.equal(url, '/api/feed/diaries/31/')
    return json({ ...rawDiary, author: { id: 7, nickname: 'other' }, can_reply: true, delivery: { duration_minutes: 360 } })
  }
  await reading.loadReadingDetail('31'); assert.equal(reading.getReadingSnapshot().diaries[0].canReply, true); checks++
  const React = await import('react')
  const { renderToString } = await import('react-dom/server')
  const { MemoryRouter } = await import('react-router-dom')
  const Home = (await vite.ssrLoadModule('/src/pages/home/HomePage.jsx')).default
  assert(renderToString(React.createElement(MemoryRouter, null, React.createElement(Home))).includes('other')); checks++
  const prompts = await vite.ssrLoadModule('/src/shared/api/prompts.js')
  globalThis.fetch = async (url) => { assert.equal(url, '/api/diaries/prompts/?exclude=2'); return json({ id: 3, text: 'prompt' }) }
  assert.equal((await prompts.getPrompt(2)).id, 3); checks++
  // 01: login uses server tokens/profile; a verified signup token is not fabricated.
  globalThis.fetch = async (url, options) => {
    if (url === '/api/auth/email/send/') return json({ expires_at: '2026-11-16T20:00:00+09:00', resend_available_seconds: 60 })
    assert.equal(JSON.parse(options.body).purpose, 'login')
    return json({ access: 'signed-in', refresh: 'signed-refresh', user: { ...user, first_diary_completed: true } })
  }
  const login = await auth.requestCode('test@school.ac.kr', 'login')
  assert.equal((await auth.verifyCode(login.key, '123456')).first_diary_completed, true); checks++
  // 06: server pagination, detail, photo preservation, delete and file validation.
  globalThis.fetch = async (url) => {
    assert.equal(url, '/api/diaries/me/?page=1')
    return json({ results: [rawDiary], count: 21, next: 'http://server/api/diaries/me/?page=2' })
  }
  await owned.loadOwnedDiaries(); assert.equal(owned.getOwnedDiarySnapshot().next, 2); checks++
  globalThis.fetch = async (url) => {
    assert.equal(url, '/api/diaries/me/?page=2'); return json({ results: [{ ...rawDiary, id: 32 }], count: 21, next: null })
  }
  await owned.loadOwnedDiaries(2); assert.equal(owned.getOwnedDiarySnapshot().diaries.length, 2); checks++
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/diaries/31/'); assert.equal(options.method, 'PATCH')
    assert(!options.body.has('image')); assert(!options.body.has('remove_image')); return json(rawDiary)
  }
  await owned.updateOwnedDiary('31', { content: 'hello', photo: { url: 'https://images.test/photo.png' } }); checks++
  await assert.rejects(owned.createOwnedDiary({ content: 'hello', photo: { file: new File(['gif'], 'photo.gif', { type: 'image/gif' }) } })); checks++
  globalThis.fetch = async (url, options) => { assert.equal(options.method, 'DELETE'); return new Response(null, { status: 204 }) }
  await owned.deleteOwnedDiary('31'); assert(!owned.getOwnedDiarySnapshot().diaries.some((item) => item.id === '31')); checks++
  // 03: report mapping, server reply permission, read notifications and next page.
  globalThis.fetch = async () => json({ ...rawDiary, author: { id: 7, nickname: 'other' }, can_reply: false })
  await reading.loadReadingDetail('31')
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/reports/')
    assert.deepEqual(JSON.parse(options.body), { target_type: 'diary', target_id: 31, reason: 'personal_info', detail: '', block_user: true })
    return json({ id: 1, blocked: true }, 201)
  }
  await reading.reportReadingDiary({ diaryId: '31', reason: '연락처 · 개인정보 요구', details: '', blockAuthor: true })
  assert.equal(reading.visibleReadingDiaries().length, 0); checks++
  const notice = { id: 4, type: 'letter_arrived', title: 'arrived', body: '', target_id: 60, read_at: null, created_at: rawDiary.created_at }
  globalThis.fetch = async (url) => { assert.equal(url, '/api/notifications/?page=1'); return json({ results: [notice], next: '/api/notifications/?page=2' }) }
  await reading.loadReadingNotifications(); assert.equal(reading.getReadingSnapshot().notificationNext, 2)
  assert.equal(reading.getReadingSnapshot().notifications[0].to, '/mailbox/60'); checks++
  globalThis.fetch = async (url, options) => { assert.equal(url, '/api/notifications/4/read/'); assert.equal(options.method, 'POST'); return json({ ...notice, read_at: rawDiary.created_at }) }
  await reading.markReadingNotification('4'); assert.equal(reading.getReadingSnapshot().notifications[0].unread, false); checks++
  // A temporary refresh failure must retain the user's refresh token for retry.
  globalThis.fetch = async (url) => url === '/api/auth/token/refresh/' ? json({ code: 'UNAVAILABLE', message: 'retry later' }, 503) : json({ code: 'TOKEN_NOT_VALID' }, 401)
  await assert.rejects(client.request('/api/users/me/'), (error) => error.status === 503)
  assert.equal(client.getTokens().refresh, 'signed-refresh'); checks++
  globalThis.fetch = async () => { throw new TypeError('network down') }
  await assert.rejects(client.request('/api/users/me/'), (error) => error.code === 'NETWORK_ERROR')
  assert.equal(client.getTokens().refresh, 'signed-refresh'); checks++
  let expired = 0
  window.addEventListener('dongle:session-expired', () => expired++)
  globalThis.fetch = async () => json({ code: 'TOKEN_NOT_VALID', message: 'expired' }, 401)
  await assert.rejects(client.request('/api/users/me/'))
  assert.equal(client.getTokens().refresh, undefined); assert.equal(expired, 1)
  assert.equal(reading.getReadingSnapshot().diaries.length, 0); assert.equal(owned.getOwnedDiarySnapshot().diaries.length, 0); checks++
  console.log(`PASS: ${checks} scoped API contract scenarios (stubbed responses; no live server)`)
} finally { await vite.close() }
