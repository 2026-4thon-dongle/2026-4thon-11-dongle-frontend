import { useContext } from 'react'
import { LetterDraftContext } from './letterDraftContext.js'

/**
 * 편지 작성 중 상태를 읽고 바꾼다. 편지 쓰기 화면(LetterDraftProvider 안)에서만 쓸 수 있다.
 *
 * const { draft, updateDraft, resetDraft } = useLetterDraft()
 * updateDraft({ content: '안녕' })   // 일부 항목만 바꾼다.
 */
export default function useLetterDraft() {
  const value = useContext(LetterDraftContext)
  if (!value) throw new Error('useLetterDraft는 LetterDraftProvider 안에서만 쓸 수 있어요.')
  return value
}
