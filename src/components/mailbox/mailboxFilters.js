// 우체통 5-1 상단 탭과 정렬 칩 정의 (시안 라벨 기준).
// id는 shared/mocks/mailbox.js의 MAILBOX_TABS / MAILBOX_SORTS와 같다.

export const MAILBOX_TAB_OPTIONS = [
  { id: 'new', label: '새 편지' },
  { id: 'chatting', label: '대화 중' },
  { id: 'shipping', label: '배송 중' },
  { id: 'stored', label: '보관' },
]

// 시안 칩: "지역별 ▾"(필터, 아직 동작 없음) / 최신순(선택) / 오래된순 / 안읽음(API의 안읽음순)
export const MAILBOX_SORT_OPTIONS = [
  { id: 'latest', label: '최신순' },
  { id: 'oldest', label: '오래된순' },
  { id: 'unread', label: '안읽음' },
]
