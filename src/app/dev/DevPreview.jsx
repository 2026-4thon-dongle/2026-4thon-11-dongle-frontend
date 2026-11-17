// 개발·QA용 확인 화면 목록 (/preview) — 평소에 보기 어려운 상태와 화면으로 들어가는 링크 모음
// 켜고 끄는 방법은 routes/previewRoutes.jsx를 본다.
import { Link } from 'react-router-dom'

function Title({ children }) {
  return <h2 className="text-title-20" style={{ margin: '32px 0 12px' }}>{children}</h2>
}

function DevPreview() {
  return (
    <main style={{ padding: '20px 20px calc(var(--tabbar-height) + 20px)' }}>
      <h1 className="text-display-32" style={{ margin: 0 }}>확인 화면</h1>

      <Title>공통 상태 화면</Title>
      <ul className="text-body-15" style={{ margin: 0, paddingLeft: 20 }}>
        <li><Link to="/preview/loading">8-1 로딩 (스켈레톤)</Link></li>
        <li><Link to="/preview/error">8-2 네트워크 에러</Link></li>
        <li><Link to="/preview/boundary">렌더링 에러 → ErrorBoundary</Link></li>
      </ul>

      <Title>편지 쓰기 · 배송</Title>
      <ul className="text-body-15" style={{ margin: 0, paddingLeft: 20 }}>
        <li><Link to="/letter-write?diaryId=12&nickname=하늘빛&region=충남 천안">일기에서 답장으로 들어오기 (쿼리 전달)</Link></li>
        <li><Link to="/preview/diary-reply">4-8, 4-9 임시저장과 이어 쓰기 (일기에서 답장)</Link></li>
        <li><Link to="/preview/gold-paper">4-2~4-6 금박 엽서로 편지 쓰기 (잠긴 편지지)</Link></li>
        <li><Link to="/preview/stamp-sheet">4-6, 4-7 우표 선택 시트</Link></li>
        <li><Link to="/preview/stamping">4-10 도장 찍기 애니메이션</Link></li>
      </ul>
    </main>
  )
}

export default DevPreview
