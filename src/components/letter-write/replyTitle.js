// 답장 대상에 따라 편지 쓰기 화면의 이름을 정한다. 제목은 여기서만 정하고 네 단계 화면이 같이 쓴다.

/** 받은 편지에 답장하는지(일기 답장이 아니고 letterId가 있을 때) */
export const isLetterReply = (reply) => !reply.diaryId && Boolean(reply.letterId)

/** 편지 쓰기 단계 화면의 헤더 제목. 받은 편지 답장(5-10, 5-11)만 "답장 쓰기", 일기 답장과 일반 편지는 "편지 쓰기". */
export const letterWriteTitle = (reply) => (isLetterReply(reply) ? '답장 쓰기' : '편지 쓰기')
