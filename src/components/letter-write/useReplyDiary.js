import { useEffect, useState } from 'react'
import { fetchFeedDiary } from './letterApi.js'

// 편지 쓰기 단계를 오가며 같은 일기를 다시 받지 않도록 받은 일기를 기억해 둔다. 새로고침하면 사라진다.
const cache = new Map()

/** 일기 본문에서 배너에 보여 줄 첫 줄. 빈 줄은 건너뛴다. */
export const firstLineOf = (body) => body?.split(/\r?\n/).find((line) => line.trim())?.trim() ?? ''

/**
 * 답장하는 일기를 서버에서 받는다(GET /api/feed/diaries/{id}/).
 * 일기에 답장하는 편지가 아니거나(diaryId 없음) 받는 중이거나 받지 못하면 diary가 null이다.
 * 받지 못했을 때 엉뚱한 일기 내용을 보여 주지 않도록 mock으로 채우지 않는다.
 * @param {string|number|null} diaryId
 * @returns {{ diary: { author: { nickname: string }, body: string } | null }}
 */
export default function useReplyDiary(diaryId) {
  const [diary, setDiary] = useState(() => (diaryId ? (cache.get(String(diaryId)) ?? null) : null))

  useEffect(() => {
    if (!diaryId || cache.has(String(diaryId))) return undefined
    let cancelled = false
    fetchFeedDiary(diaryId)
      .then((loaded) => {
        cache.set(String(diaryId), loaded)
        if (!cancelled) setDiary(loaded)
      })
      .catch(() => {}) // 배너의 일기 내용만 빠지고 편지는 그대로 쓸 수 있다.
    return () => {
      cancelled = true
    }
  }, [diaryId])

  return { diary }
}
