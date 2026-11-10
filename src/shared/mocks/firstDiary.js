// 02 첫 고향 일기 UI 확인용. 서버 응답이나 실제 사용자로 취급하지 않는다.
export const MOCK_FIRST_DIARY_PROFILE = {
  nickname: '다인',
  hometowns: [{ province: '충남', district: '천안' }, { province: '대전', district: '' }],
  residence: { province: '서울', district: '성북' },
}

export const MOCK_DIARY_PROMPTS = [
  '우리 동네 사람이면 다 아는 장소는?',
  '오늘 우리 동네에서 발견한 작은 행복은?',
  '고향 친구에게 소개하고 싶은 동네 음식은?',
  '자주 걷는 동네 산책길은 어디인가요?',
]

const diaries = new Map()
/** @param {{content: string, photo?: File|null, profile: object}} draft */
export async function publishMockFirstDiary(draft) {
  const profileKey = JSON.stringify(draft.profile)
  if (diaries.has(profileKey)) return diaries.get(profileKey)
  const result = { id: crypto.randomUUID(), content: draft.content.trim(), photoName: draft.photo?.name || null, createdAt: new Date().toISOString(), stampId: 'first-diary', demo: true }
  diaries.set(profileKey, result)
  return result
}
