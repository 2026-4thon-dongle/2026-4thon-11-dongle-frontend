// 편지 쓰기 단계. 순서와 경로는 여기에서만 정한다.
// 4단계(우표)는 3단계(서명) 화면 위에 올라오는 바텀시트이지만, 단계 표시와 이동을 위해 경로를 따로 둔다.
export const LETTER_STEPS = [
  { label: '편지지', path: '/letter-write/paper' },
  { label: '내용', path: '/letter-write/content' },
  { label: '서명', path: '/letter-write/signature' },
  { label: '우표', path: '/letter-write/stamp' },
]

export const LETTER_STEP_LABELS = LETTER_STEPS.map((step) => step.label)
