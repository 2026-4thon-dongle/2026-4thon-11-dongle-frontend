import { MOCK_DIARY_PROMPTS } from './firstDiary.js'
// 06 UI용 예시. 사용자·일기·공개 상태는 실제 서버 데이터가 아니다.
export const MOCK_OWNED_PROFILE = { id: 'demo-dain', nickname: '다인', province: '서울', district: '성북', regionLabel: '서울 성북구' }
export const OWNED_DIARY_PROMPTS = MOCK_DIARY_PROMPTS
export const MOCK_OWNED_DIARIES = [
  { id: 'seongbuk-snow', title: '첫눈 온 성북천 산책', content: '첫눈 온 성북천을 걸었다. 천변 따라 늘어선 벚나무 가지에 눈이 소복이 쌓여서, 고향 천안의 겨울이 문득 생각났다.', dateLabel: '11월 2일', postmarkDate: '11.02', photo: { key: 'snow' } },
  { id: 'donam-hotteok', title: '돈암시장 호떡', content: '돈암시장 골목에서 따뜻한 호떡을 먹었다. 바삭한 가장자리가 특히 맛있었다.', dateLabel: '10월 30일', postmarkDate: '10.30', photo: { key: 'hotteok' } },
  { id: 'jeongneung-trail', title: '정릉 산책길', content: '정릉 산책길을 천천히 걸었다. 나무 사이로 불어오는 바람이 좋았다.', dateLabel: '10월 26일', postmarkDate: '10.26', photo: { key: 'trail' } },
  { id: 'campus-ginkgo', title: '캠퍼스 은행나무', content: '캠퍼스 은행나무 아래를 걸었다. 노란 잎이 쌓여 가을이 깊어지고 있었다.', dateLabel: '10월 22일', postmarkDate: '10.22', photo: { key: 'campus' } },
].map((diary) => ({ ...diary, authorId: MOCK_OWNED_PROFILE.id, province: '서울', district: '성북', receiveLetters: true, visibility: 'all' }))

export const OWNED_VISIBILITY = ['all', 'hometown', 'private']
