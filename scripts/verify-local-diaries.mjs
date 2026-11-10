import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'

// Load the actual API modules with Vite's DEV constant, without starting a browser/server.
const storage = new Map()
globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }
globalThis.FileReader = class {
  readAsDataURL(file) { this.result = file.data; queueMicrotask(() => this.onload()) }
}
async function graph(epoch) {
  const urls = new Map()
  async function url(path) {
    path = resolve(path)
    if (urls.has(path)) return urls.get(path)
    let code = (await readFile(path, 'utf8')).replaceAll('import.meta.env.DEV', 'true')
    for (const match of [...code.matchAll(/from\s+['"](\.[^'"]+)['"]/g)]) {
      code = code.replace(match[0], `from '${await url(resolve(dirname(path), match[1]))}'`)
    }
    const result = `data:text/javascript;base64,${Buffer.from(code + `\n// graph ${epoch}`).toString('base64')}`
    urls.set(path, result)
    return result
  }
  const load = async (name) => import(await url(`src/shared/api/${name}.js`))
  return { profile: await load('profile'), owned: await load('ownedDiary'), reading: await load('readingDiary'), first: await load('firstDiary') }
}
let api = await graph(1)
const author = api.profile.saveSignupProfile({ id: 'integration-author', nickname: '작성자', hometowns: [{ province: '충남', district: '천안' }], residence: { province: '서울', district: '성북' } })
assert.equal(api.owned.getOwnedDiarySnapshot().diaries.length, 0)
let updates = 0
const stop = api.reading.subscribeReading(() => updates++)
const first = await api.first.publishFirstDiary({ content: '첫 일기 테스트', photo: { data: 'data:image/png;base64,aGVsbG8=' }, profile: author })
assert.equal(api.owned.getOwnedDiarySnapshot().diaries[0].id, first.id)
assert.equal((await api.first.publishFirstDiary({ content: '중복 클릭', profile: author })).id, first.id)
assert.equal(api.owned.getOwnedDiarySnapshot().diaries.length, 1)
assert.equal(api.reading.getReadingSnapshot().diaries.find(d => d.id === first.id).photo.url, 'data:image/png;base64,aGVsbG8=')
assert.ok(updates > 0)
stop()
await api.owned.updateOwnedDiary(first.id, { content: '수정한 일기', photo: first.photo, receiveLetters: false })
await api.owned.setOwnedDiaryVisibility(first.id, 'private')
const record = api.reading.getReadingSnapshot().diaries.find(d => d.id === first.id)
const hometownViewer = { id: 'reader', hometowns: [{ province: '서울', district: '성북' }] }
assert.equal(api.reading.canReadDiary(record, hometownViewer), false)
assert.equal(api.reading.canReadDiary(record, author), true)
await api.owned.setOwnedDiaryVisibility(first.id, 'hometown')
const hometownRecord = api.reading.getReadingSnapshot().diaries.find(d => d.id === first.id)
assert.equal(api.reading.canReadDiary(hometownRecord, hometownViewer), true)
assert.equal(api.reading.canReadDiary(hometownRecord, { id: 'other', hometowns: [] }), false)
assert.equal(api.reading.canReplyToDiary(hometownRecord, hometownViewer), false)
assert.equal(api.reading.canReplyToDiary({ ...hometownRecord, receiveLetters: true }, hometownViewer), true)
assert.equal(api.reading.canReplyToDiary({ ...hometownRecord, receiveLetters: true }, author), false)
// A fresh module graph simulates refresh and restores the actual persisted records.
api = await graph(2)
assert.equal(api.profile.getSignupProfile().id, author.id)
assert.equal(api.owned.getOwnedDiarySnapshot().diaries[0].content, '수정한 일기')
assert.equal(api.owned.getOwnedDiarySnapshot().diaries[0].visibility, 'hometown')
assert.equal(api.owned.getOwnedDiarySnapshot().diaries[0].photo.url, first.photo.url)
api.profile.saveSignupProfile({ ...hometownViewer, nickname: '독자', residence: { province: '부산', district: '수영' } })
assert.equal(api.owned.getOwnedDiarySnapshot().diaries.length, 0)
assert.ok(api.reading.visibleReadingDiaries().some(d => d.id === first.id))
await assert.rejects(api.owned.deleteOwnedDiary(first.id))
api.profile.saveSignupProfile(author)
await api.owned.deleteOwnedDiary(first.id)
assert.equal(api.reading.getReadingSnapshot().diaries.some(d => d.id === first.id), false)
api = await graph(3)
assert.equal(api.owned.getOwnedDiarySnapshot().diaries.length, 0)
const setItem = localStorage.setItem
localStorage.setItem = () => { throw new Error('Quota exceeded') }
await assert.rejects(api.owned.createOwnedDiary({ content: '저장 실패 테스트', photo: null, receiveLetters: true }))
assert.equal(api.owned.getOwnedDiarySnapshot().diaries.length, 0)
localStorage.setItem = setItem
console.log('Passed: first diary integration, duplicate prevention, photo persistence, edits/deletion across refresh, ownership, visibility, replies, subscriptions, storage failure.')
