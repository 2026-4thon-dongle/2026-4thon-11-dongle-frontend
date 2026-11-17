// 신고 사유(시안 3-7 순서)와 서버 코드(POST /api/reports/ reason, 문서 레포 api/safety.md). ReportForm이 쓴다.
export const REPORT_REASONS = [
  { code: 'abuse', label: '욕설 · 비하' },
  { code: 'sexual', label: '성적인 내용' },
  { code: 'personal_info', label: '연락처 · 개인정보 요구' },
  { code: 'spam', label: '광고 · 도배' },
  { code: 'etc', label: '기타 (직접 입력)' },
]
