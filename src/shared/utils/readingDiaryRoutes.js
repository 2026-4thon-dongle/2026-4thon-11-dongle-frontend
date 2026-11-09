export const diaryDetailUrl = (id) => `/diary/${encodeURIComponent(id)}`

/** @param {{id: string, nickname: string, province: string, district: string}} diary 편지 담당 화면의 기존 쿼리 계약. */
export function diaryReplyUrl(diary) {
  return `/letter-write/paper?${new URLSearchParams({ diaryId: diary.id, nickname: diary.nickname, region: [diary.province, diary.district].filter(Boolean).join(' ') })}`
}
