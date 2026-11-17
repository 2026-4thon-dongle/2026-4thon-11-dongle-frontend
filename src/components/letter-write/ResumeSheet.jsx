import { useEffect } from 'react'
import Button from '../../shared/ui/Button.jsx'
import { getLetterFontFamily, loadLetterFont } from '../../shared/fonts/letterFonts.js'
import './ResumeSheet.css'

// 기기 시간대와 상관없이 한국 시간 날짜로 쓴다.
const SAVED_DATE = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' })

/** "11월 6일에 임시저장했어요" */
const formatSavedAt = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '임시저장했어요'
  return `${SAVED_DATE.format(date)}에 임시저장했어요`
}

/**
 * 쓰던 편지 이어 쓰기(시안 4-9). useOverlay().openSheet()의 content로 넣어 쓴다.
 * 시트 제목("이 일기에 쓰던 편지가 있어요")은 openSheet의 title로 넣는다.
 * 시트는 라우트 바깥(OverlayProvider)에 그려지므로, 필요한 값은 모두 props로 받는다.
 * @param {{draft: object, savedAt: string}} saved 임시저장한 편지 (letterDraftStorage의 loadLetterDraft 결과)
 * @param {() => void} onNew "새로 쓰기": 저장한 편지를 지우고 처음부터 쓴다.
 * @param {() => void} onResume "이어 쓰기": 저장한 편지로 이어서 쓴다.
 */
function ResumeSheet({ saved, onNew, onResume }) {
  const { draft, savedAt } = saved
  const fontFamily = getLetterFontFamily(draft.fontId)

  useEffect(() => {
    loadLetterFont(draft.fontId)
  }, [draft.fontId])

  return (
    <div className="resume-sheet">
      <p className="resume-sheet__saved">{formatSavedAt(savedAt)}</p>

      {/* 저장한 편지 미리보기: 받는 사람과 본문 앞부분 두 줄 */}
      <div className="resume-sheet__preview">
        <p className="resume-sheet__to" style={{ fontFamily }}>
          To. {draft.reply.nickname ?? '고향 친구'}
        </p>
        <p className="resume-sheet__excerpt" style={{ fontFamily }}>
          {draft.content}
        </p>
      </div>

      <div className="resume-sheet__actions">
        <Button variant="ghost" onClick={onNew}>
          새로 쓰기
        </Button>
        <Button onClick={onResume}>이어 쓰기</Button>
      </div>
    </div>
  )
}

export default ResumeSheet
