import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'
import MailboxPage from '../../pages/mailbox/MailboxPage.jsx'
import LetterPage from '../../pages/mailbox/LetterPage.jsx'
import StampGainedPage from '../../pages/mailbox/StampGainedPage.jsx'
import RewardUnlockedPage from '../../pages/mailbox/RewardUnlockedPage.jsx'
import PenPalPage from '../../pages/pen-pal/PenPalPage.jsx'
import PenPalLettersPage from '../../pages/pen-pal/PenPalLettersPage.jsx'

export const mailboxRoutes = [
  { path: '/mailbox', element: <MailboxPage /> }, // 5-1 (mock, 문서 레포 API 확정 전)
  // 카드를 누르면 /mailbox/:letterId 로 이동한다(가정). 읽지 않은 편지는 5-8, 읽은 편지는 5-9 (mock)
  { path: '/mailbox/:letterId', element: <LetterPage /> },
  // 5-12, 5-13: 언제 뜨는지가 정해지지 않아 주소로 직접 연다(경로는 가정). 정적 경로가 위의 :letterId보다 먼저 골라진다.
  { path: '/mailbox/stamp-gained', element: <StampGainedPage /> }, // 5-12 (mock)
  { path: '/mailbox/reward-unlocked', element: <RewardUnlockedPage /> }, // 5-13 (mock)
  // 대화 중 카드(5-3)를 누르면 /mailbox/chats/:chatId 로 이동한다(가정). 대화 상세 화면이 만들어지면 바꾼다.
  { path: '/mailbox/chats/:chatId', element: <RoutePlaceholder title="대화" /> },
  { path: '/pen-pal', element: <PenPalPage /> }, // 5-14 (mock, 문서 레포 API 확정 전)
  { path: '/pen-pal/:friendId', element: <PenPalLettersPage /> }, // 5-15 (경로는 가정)
  {
    path: '/pen-pal/*',
    element: <RoutePlaceholder title="펜팔 친구" />,
  },
  {
    path: '/mypage/*',
    element: <RoutePlaceholder title="마이페이지" />,
  },
]
