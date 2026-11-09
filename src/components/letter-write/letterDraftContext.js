import { createContext } from 'react'

// LetterDraftProvider가 값을 채우고, useLetterDraft가 꺼내 쓴다.
export const LetterDraftContext = createContext(null)

/**
 * 편지 작성 중 상태. 단계를 오가도 유지된다.
 * - reply: 이 편지가 답장하는 대상. 일기 상세·우체통에서 들어올 때 URL 파라미터로 전달받는다.
 *   { diaryId, nickname, region } — 일기에 답장하는 게 아니면 diaryId는 null이다.
 * - paperId: 고른 편지지
 * - content: 본문
 * - fontId: 고른 글씨체 (shared/fonts의 편지 글씨체 id)
 * - signature: 서명 그림. { ops: [...] } 그린 순서대로 쌓은 작업 목록이고, 되돌리기는 맨 뒤에서 하나씩 뺀다.
 *   - 선: { type: 'stroke', erase, color, points: [[x, y], ...] }  좌표는 그림판 크기에 대한 0~1 비율이다.
 *   - 스티커: { type: 'sticker', id, pose, x, y }  x, y는 스티커 중심의 0~1 비율이다.
 * - stampId: 고른 우표
 */
export const EMPTY_DRAFT = {
  reply: { diaryId: null, nickname: null, region: null },
  paperId: 'basic',
  content: '',
  fontId: 'nanum-pen',
  signature: { ops: [] },
  stampId: null,
}
