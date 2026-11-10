import { publishMockFirstDiary } from '../mocks/firstDiary.js'

/** 서버 명세가 연결되면 이 경계에서 FormData 전송 및 응답 처리를 구현한다. */
export const isFirstDiaryDemo = import.meta.env.DEV

/** @param {{content: string, photo?: File|null, profile: object}} draft */
export async function publishFirstDiary(draft) {
  const content = draft.content.trim()
  if (!content || content.length > 500) throw new Error('일기를 1~500자로 입력해주세요')
  if (!draft.profile?.nickname || !draft.profile?.residence || !draft.profile?.hometowns?.length) throw new Error('가입한 사용자 정보를 먼저 연결해주세요')
  if (!isFirstDiaryDemo) throw new Error('아직 일기 저장 서버가 연결되지 않았어요. 작성한 내용은 이 화면에 유지돼요.')
  return publishMockFirstDiary({ ...draft, content })
}
