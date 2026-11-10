import RoutePlaceholder from '../../shared/ui/RoutePlaceholder.jsx'
import LetterWriteLayout from '../../pages/letter-write/LetterWriteLayout.jsx'
import EntryRedirect from '../../pages/letter-write/EntryRedirect.jsx'
import PaperPage from '../../pages/letter-write/PaperPage.jsx'
import ContentPage from '../../pages/letter-write/ContentPage.jsx'
import SignaturePage from '../../pages/letter-write/SignaturePage.jsx'
import StampPage from '../../pages/letter-write/StampPage.jsx'

// 편지 쓰기 단계 경로는 components/letter-write/steps.js의 LETTER_STEPS와 같아야 한다.
export const letterRoutes = [
  {
    path: '/letter-write',
    element: <LetterWriteLayout />,
    children: [
      { index: true, element: <EntryRedirect /> },
      { path: 'paper', element: <PaperPage /> }, // 4-1
      { path: 'content', element: <ContentPage /> }, // 4-2, 4-3
      { path: 'signature', element: <SignaturePage /> }, // 4-4, 4-5
      { path: 'stamp', element: <StampPage /> }, // 4-6, 4-7
    ],
  },
  // 발송 연출·완료·배송 지도 (4-10 ~ 4-12). letterId는 편지를 보낸 뒤 받는 편지 번호이다(가정).
  { path: '/delivery/:letterId/sending', element: <RoutePlaceholder title="발송 연출" /> }, // 4-10
  { path: '/delivery/:letterId/done', element: <RoutePlaceholder title="발송 완료" /> }, // 4-11
  { path: '/delivery/:letterId/map', element: <RoutePlaceholder title="실시간 배송 지도" /> }, // 4-12
  {
    path: '/delivery/*',
    element: <RoutePlaceholder title="배송" />,
  },
  {
    path: '/delivery-game',
    element: <RoutePlaceholder title="직접 배달하기" />,
  },
  {
    path: '/stamp-make',
    element: <RoutePlaceholder title="우표 만들기" />,
  },
]
