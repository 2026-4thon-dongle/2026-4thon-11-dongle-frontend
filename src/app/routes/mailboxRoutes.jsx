import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'
import MailboxPage from '../../pages/mailbox/MailboxPage.jsx'
import LetterPage from '../../pages/mailbox/LetterPage.jsx'
import ChatRedirectPage from '../../pages/mailbox/ChatRedirectPage.jsx'
import StampGainedPage from '../../pages/mailbox/StampGainedPage.jsx'
import RewardUnlockedPage from '../../pages/mailbox/RewardUnlockedPage.jsx'
import PenPalPage from '../../pages/pen-pal/PenPalPage.jsx'
import PenPalLettersPage from '../../pages/pen-pal/PenPalLettersPage.jsx'

export const mailboxRoutes = [
  { path: '/mailbox', element: <MailboxPage /> }, // 5-1 (서버, api/mailbox.md)
  // 카드를 누르면 /mailbox/:letterId 로 이동한다(가정). 열지 않은 받은 편지는 5-8, 그 밖에는 5-9 (서버)
  { path: '/mailbox/:letterId', element: <LetterPage /> },
  // 5-12, 5-13: 언제 뜨는지가 정해지지 않아 주소로 직접 연다(경로는 가정). 정적 경로가 위의 :letterId보다 먼저 골라진다.
  { path: '/mailbox/stamp-gained', element: <StampGainedPage /> }, // 5-12 (mock)
  { path: '/mailbox/reward-unlocked', element: <RewardUnlockedPage /> }, // 5-13 (mock)
  // 알림(round_trip)이 /mailbox/chats/:대화id 로 보낸다. 대화 id는 5-15의 id와 같아 /pen-pal/:conversationId 로 넘긴다.
  { path: '/mailbox/chats/:chatId', element: <ChatRedirectPage /> },
  { path: '/pen-pal', element: <PenPalPage /> }, // 5-14 (서버, api/mailbox.md)
  { path: '/pen-pal/:conversationId', element: <PenPalLettersPage /> }, // 5-15 (id는 대화 id)
  {
    path: '/pen-pal/*',
    element: <RoutePlaceholder title="펜팔 친구" />,
  },
  {
    path: '/mypage/*',
    element: <RoutePlaceholder title="마이페이지" />,
  },
]
