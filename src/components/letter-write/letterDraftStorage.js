// 임시저장한 편지(4-8 "임시저장", 4-9 "이어 쓰기").
// 저장 방식(API)이 정해지기 전까지는 이 브라우저의 localStorage에 둔다(mock). 다른 기기에서는 이어 쓸 수 없다.
// API가 정해지면 이 파일의 함수 안쪽만 서버 호출로 바꾸면 된다. 쓰는 쪽은 그대로다.
const PREFIX = 'dongle:letter-draft:'

/**
 * 어떤 편지의 임시저장인지 가르는 값. 일기에 답장하는 편지는 일기마다 하나를 둔다.
 * 답장 대상을 모르면(diaryId가 없으면) 하나를 같이 쓰는 안전장치용 키이다.
 * TODO: 받은 편지에 답장하는 경우(letterId)는 쿼리 규칙을 채원과 합의한 뒤 편지마다 따로 둔다.
 * @param {{diaryId: string | null}} reply 작성 중 상태의 reply
 */
function getDraftKey(reply) {
  return PREFIX + (reply?.diaryId ? `diary-${reply.diaryId}` : 'unknown')
}

/**
 * 작성 중인 편지를 임시저장한다.
 * @param {object} draft 작성 중 상태(useLetterDraft의 draft)
 * @param {number} step 저장할 때 있던 단계(1부터). 이어 쓸 때 이 단계로 돌아간다.
 */
export function saveLetterDraft(draft, step) {
  try {
    localStorage.setItem(
      getDraftKey(draft.reply),
      JSON.stringify({ draft, step, savedAt: new Date().toISOString() }),
    )
  } catch {
    // 저장소를 못 쓰는 환경(사생활 보호 모드 등)이면 저장하지 못한다.
  }
}

/**
 * 임시저장한 편지를 꺼낸다. 없거나 읽을 수 없으면 null.
 * @param {{diaryId: string | null}} reply
 * @returns {{draft: object, step: number, savedAt: string} | null}
 */
export function loadLetterDraft(reply) {
  try {
    const saved = JSON.parse(localStorage.getItem(getDraftKey(reply)))
    return saved?.draft && saved.step ? saved : null
  } catch {
    return null
  }
}

/** 임시저장한 편지를 지운다(새로 쓰기, 저장 안 함, 편지를 보낸 뒤). */
export function clearLetterDraft(reply) {
  try {
    localStorage.removeItem(getDraftKey(reply))
  } catch {
    // 저장소를 못 쓰면 지울 것도 없다.
  }
}
