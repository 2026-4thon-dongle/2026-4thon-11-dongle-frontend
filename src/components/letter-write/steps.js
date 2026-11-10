// 편지 쓰기 단계. 순서와 경로는 여기에서만 정한다.
// 4단계(우표)는 쓴 편지를 보여 주는 화면이고, 그 위에 "편지를 보낼까요?" 바텀시트(4-6, 4-7)가 열린다.
export const LETTER_STEPS = [
  { label: '편지지', path: '/letter-write/paper' },
  { label: '내용', path: '/letter-write/content' },
  { label: '서명', path: '/letter-write/signature' },
  { label: '우표', path: '/letter-write/stamp' },
]

export const LETTER_STEP_LABELS = LETTER_STEPS.map((step) => step.label)
