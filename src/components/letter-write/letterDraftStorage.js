// 임시저장한 편지(4-8 "임시저장", 4-9 "이어 쓰기"). 서버에 저장한다(api/letters.md의 drafts).
// 대상(일기 또는 받은 편지)마다 1통만 두고, 같은 대상에 다시 저장하면 서버가 덮어쓴다.
// 서버는 본문·편지지·글씨체만 저장한다. 서명·스티커·우표와 저장할 때의 단계는 저장하지 않으므로,
// 이어 쓸 때는 항상 내용 쓰기(2단계)에서 시작하고 서명·스티커·우표는 다시 고른다.
import {
  deleteLetterDraft,
  fetchLetterDraft,
  fetchLetterDrafts,
  saveLetterDraft as requestSaveLetterDraft,
} from './letterApi.js'
import { fontCodeOf, fontIdOf, paperCodeOf, paperIdOf } from './data.js'
import { EMPTY_DRAFT } from './letterDraftContext.js'

// 서버 임시저장은 내용 쓰기(2단계)부터 이어 쓴다.
const RESUME_STEP = 2

// 작성 중 상태의 reply(쿼리 문자열 값)를 서버 대상으로 바꾼다. 일기면 diary_id, 받은 편지면 reply_to.
function toTarget(reply) {
  const diaryId = reply?.diaryId ? Number(reply.diaryId) : null
  const replyTo = reply?.letterId ? Number(reply.letterId) : null
  return { diaryId, replyTo }
}

// 서버 임시저장이 가리키는 대상이 이 reply와 같은지
function matches(item, { diaryId, replyTo }) {
  return diaryId ? item.diary_id === diaryId : replyTo ? item.reply_to === replyTo : false
}

// 이 대상의 임시저장(목록 항목)을 찾는다. 없으면 null. 목록은 최신순으로 20개씩 온다.
async function findDraftItem(reply) {
  const target = toTarget(reply)
  if (!target.diaryId && !target.replyTo) return null
  for (let page = 1; ; page += 1) {
    const { results, next } = await fetchLetterDrafts(page)
    const found = results.find((item) => matches(item, target))
    if (found) return found
    if (!next) return null
  }
}

// 서버 임시저장을 작성 중 상태(useLetterDraft의 draft)로 바꾼다.
function toDraftState(server, reply) {
  return {
    ...EMPTY_DRAFT,
    reply: { ...EMPTY_DRAFT.reply, ...reply, nickname: server.recipient?.nickname ?? reply?.nickname ?? null },
    paperId: paperIdOf(server.stationery),
    content: server.body ?? '',
    fontId: fontIdOf(server.font),
    draftId: server.id,
  }
}

/**
 * 작성 중인 편지를 임시저장한다. 서버 요청이 실패하면 LetterApiError를 던진다.
 * @param {object} draft 작성 중 상태(useLetterDraft의 draft)
 */
export async function saveLetterDraft(draft) {
  const { diaryId, replyTo } = toTarget(draft.reply)
  const saved = await requestSaveLetterDraft({
    diaryId,
    replyTo,
    body: draft.content,
    stationery: paperCodeOf(draft.paperId),
    font: fontCodeOf(draft.fontId),
  })
  return saved
}

/**
 * 이 대상의 임시저장한 편지를 꺼낸다. 없거나 서버에서 못 받으면 null이다(이어 쓰기를 묻지 않고 새로 쓴다).
 * @param {{diaryId: string | null, letterId: string | null}} reply
 * @returns {Promise<{draft: object, step: number, savedAt: string} | null>}
 */
export async function loadLetterDraft(reply) {
  try {
    const item = await findDraftItem(reply)
    if (!item) return null
    const server = await fetchLetterDraft(item.id)
    return { draft: toDraftState(server, reply), step: RESUME_STEP, savedAt: server.saved_at }
  } catch {
    return null
  }
}

/**
 * 임시저장한 편지를 지운다(새로 쓰기, 저장 안 함). 지울 것이 없으면 아무 일도 하지 않는다.
 * @param {{diaryId: string | null, letterId: string | null}} reply
 * @param {number | null} [draftId] 알고 있는 임시저장 id. 없으면 대상으로 찾는다.
 */
export async function clearLetterDraft(reply, draftId = null) {
  try {
    const id = draftId ?? (await findDraftItem(reply))?.id
    if (id) await deleteLetterDraft(id)
  } catch {
    // 이미 없거나 서버에서 지우지 못하면 넘어간다. 남은 임시저장은 다음에 이어 쓰기로 다시 보인다.
  }
}
