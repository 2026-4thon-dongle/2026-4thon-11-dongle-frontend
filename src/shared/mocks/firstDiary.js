// 02 첫 고향 일기 UI 확인용. 서버 응답이나 실제 사용자로 취급하지 않는다.
export const MOCK_FIRST_DIARY_PROFILE = {
  nickname: '다인',
  hometowns: [{ province: '충남', district: '천안' }, { province: '대전', district: '' }],
  residence: { province: '서울', district: '성북' },
}

export const MOCK_DIARY_PROMPTS = ['우리 동네 사람이면 다 아는 장소는?', '요즘 우리 동네에서 제일 맛있는 한 끼는?', '오늘 등굣길에 본 풍경 하나', '자취방 창문 밖으로 뭐가 보여요?', '우리 동네 단골 가게를 소개해 주세요', '친구가 놀러 오면 꼭 데려가고 싶은 곳은?', '요즘 우리 동네 날씨는 어때요?', '나만 아는 동네 산책 코스', '이 동네에 와서 처음 해본 것', '시험기간에 찾는 나만의 공부 스팟', '이번 계절, 우리 동네에서만 볼 수 있는 것', '동네 시장 · 편의점에서 꼭 사는 것', '오늘 고향 생각이 났던 순간', '고향 친구한테 자랑하고 싶은 우리 동네 한 가지']

const diaries = new Map()
/** @param {{content: string, photo?: File|null, profile: object}} draft */
export async function publishMockFirstDiary(draft) {
  const profileKey = JSON.stringify(draft.profile)
  if (diaries.has(profileKey)) return diaries.get(profileKey)
  const result = { id: crypto.randomUUID(), content: draft.content.trim(), photoName: draft.photo?.name || null, createdAt: new Date().toISOString(), stampId: 'first-diary', demo: true }
  diaries.set(profileKey, result)
  return result
}
