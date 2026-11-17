import { useRef } from 'react'
import Icon from '../../shared/ui/Icon.jsx'
import ReportForm from '../../shared/ui/ReportForm.jsx'
import BlockDialog from '../../shared/ui/BlockDialog.jsx'
import { blockReadingAuthor, reportReadingDiary, isReadingDemo } from '../../shared/api/readingDiary.js'
import useReadingLayerFocus from './useReadingLayerFocus.js'
import './ReadingModeration.css'

/** @param {{diary: object, onReport: () => void, onBlock: () => void}} props */
export function DiaryMenu({ diary, onReport, onBlock }) {
  const ref = useRef(null)
  useReadingLayerFocus(ref)
  return <div className="reading-menu" ref={ref}><button type="button" onClick={onReport}><span className="reading-menu-icon reading-menu-icon--report"><Icon name="flag" /></span><span><strong>신고하기</strong><small>불편한 내용을 운영진에게 알려요</small></span></button><button type="button" onClick={onBlock}><span className="reading-menu-icon"><Icon name="ban" /></span><span><strong>차단하기</strong><small>서로의 일기와 편지가 보이지 않아요</small></span></button><span className="reading-sr-only">{diary.nickname}의 일기 메뉴</span></div>
}

// 신고 시트(3-7)와 차단 팝업(3-8)의 화면은 편지(5-9)와 함께 쓰려고 shared/ui로 옮겼다. 여기서는 일기용 요청과 문구만 넘긴다.

/** @param {{diary: object, close: () => void, onDone: () => void}} props */
export function ReportDiaryForm({ diary, close, onDone }) {
  return <ReportForm
    nickname={diary.nickname}
    description={<>신고하면 내 화면에서 바로 숨겨지고, 3건이 쌓이면<br />모두에게 숨겨진 뒤 운영진이 확인해요</>}
    onSubmit={({ label, details, block }) => reportReadingDiary({ diaryId: diary.id, reason: label, details, blockAuthor: block })}
    close={close}
    onDone={() => onDone()}
    demoNote={isReadingDemo ? '개발용 미리보기 · 실제 운영진에게 전송되지 않아요' : undefined}
  />
}

/** @param {{diary: object, close: () => void, onDone: () => void}} props */
export function BlockDiaryDialog({ diary, close, onDone }) {
  return <BlockDialog
    nickname={diary.nickname}
    onConfirm={() => blockReadingAuthor(diary.authorId)}
    close={close}
    onDone={onDone}
    demoNote={isReadingDemo ? '개발용 차단 · 서버에는 저장되지 않아요' : undefined}
  />
}
