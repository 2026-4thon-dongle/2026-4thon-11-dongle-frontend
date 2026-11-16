export const diaryDetailUrl = (id) => `/diary/${encodeURIComponent(id)}`

/**
 * 편지 쓰기 입구(/letter-write)로 보낸다. 입구가 이 일기에 임시저장한 편지가 있는지 확인하고(4-9) 4-1로 넘긴다(docs/letter-write.md).
 * 4-1(/letter-write/paper)로 바로 가면 이 확인을 건너뛰어, 나갈 때 예전 임시저장을 덮거나 지운다.
 * @param {{id: string, nickname: string, province: string, district: string}} diary 편지 담당 화면의 기존 쿼리 계약.
 */
export function diaryReplyUrl(diary) {
  return `/letter-write?${new URLSearchParams({ diaryId: diary.id, nickname: diary.nickname, region: [diary.province, diary.district].filter(Boolean).join(' ') })}`
}
