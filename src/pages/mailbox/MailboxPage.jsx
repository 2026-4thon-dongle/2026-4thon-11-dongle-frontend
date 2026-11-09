import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../../shared/ui/Icon.jsx'
import Chip from '../../shared/ui/Chip.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import MailboxTabs from '../../components/mailbox/MailboxTabs.jsx'
import LetterCard from '../../components/mailbox/LetterCard.jsx'
import ChatCard from '../../components/mailbox/ChatCard.jsx'
import ShippingCard from '../../components/mailbox/ShippingCard.jsx'
import StoredCard from '../../components/mailbox/StoredCard.jsx'
import StoredNotice from '../../components/mailbox/StoredNotice.jsx'
import GameBanner from '../../components/mailbox/GameBanner.jsx'
import MailboxEmpty from '../../components/mailbox/MailboxEmpty.jsx'
import { MAILBOX_TAB_OPTIONS, MAILBOX_SORT_OPTIONS } from '../../components/mailbox/mailboxFilters.js'
import { fetchMailboxLetters } from '../../components/mailbox/mailboxApi.js'
import './MailboxPage.css'

// 가정: 다른 담당 화면으로 가는 경로. 모두 지금은 RoutePlaceholder(임시 화면)이거나 다른 담당이 만든 화면이다.
//   일기 쓰기: shared TabBar의 기본 경로와 같다 (/diary/* 임시 화면)
//   편지 쓰기: 채현이 만든 편지 쓰기 첫 단계로 보내는 경로
const DIARY_WRITE_PATH = '/diary/write'
const LETTER_WRITE_PATH = '/letter-write'

// 탭마다 카드 모양, 로딩 자리 높이가 다르다 (시안 5-1 / 5-3 / 5-5 / 5-7)
const TAB_VIEW = {
  new: { skeletonHeight: 100, skeletonRadius: 24 },
  chatting: { skeletonHeight: 110, skeletonRadius: 24 },
  shipping: { skeletonHeight: 126, skeletonRadius: 24 },
  stored: { skeletonHeight: 86, skeletonRadius: 22 },
}

function renderCard(tab, item) {
  if (tab === 'chatting') return <ChatCard chat={item} />
  if (tab === 'shipping') return <ShippingCard shipping={item} />
  if (tab === 'stored') return <StoredCard stored={item} />
  return <LetterCard letter={item} />
}

/**
 * 우체통 5-1 ~ 5-7-1. 탭(새 편지/대화 중/배송 중/보관)에 맞춰 목록과 비었을 때 화면을 보여 준다.
 * - 새 편지(5-1, 비었으면 5-2): 정렬 칩 + 편지 카드
 * - 대화 중(5-3, 비었으면 5-4): 대화 카드
 * - 배송 중(5-5, 비었으면 5-6): 진행 바 카드 + 배달 게임 안내
 * - 보관(5-7, 비었으면 5-7-1): 안내 박스 + 보관 카드
 * 정렬 칩은 새 편지 탭에만 있고, 오른쪽 위 필터 아이콘은 새 편지·배송 중 탭에만 있다(시안).
 * 목록은 mock이다(문서 레포 API 확정 전, Notion 초안 참고). 요청과 변환은 components/mailbox에서 한다.
 * 가정: 탭·정렬은 화면 상태로만 두고 URL에는 넣지 않았다.
 * 개발 중 확인용: 주소 뒤에 ?mock=empty 를 붙이면 mock 데이터가 비어 비었을 때 화면이 나온다.
 */
function MailboxPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const forceEmpty = import.meta.env.DEV && searchParams.get('mock') === 'empty'

  const [tab, setTab] = useState('new')
  const [sort, setSort] = useState('latest')
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNewDot, setHasNewDot] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchMailboxLetters(tab, { sort, empty: forceEmpty }).then((page) => {
      if (cancelled) return
      setItems(page.items)
      if (tab === 'new') setHasNewDot(page.items.some((item) => !item.isRead))
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [tab, sort, forceEmpty])

  // 탭·정렬을 바꾸는 순간 로딩 표시로 돌린다(효과 안에서 setState를 바로 부르지 않기 위해 여기서 처리)
  const changeTab = (next) => {
    setIsLoading(true)
    setTab(next)
  }
  const changeSort = (next) => {
    setIsLoading(true)
    setSort(next)
  }

  const isEmpty = !isLoading && items.length === 0
  const hasItems = !isLoading && items.length > 0
  // 정렬 칩은 새 편지 탭에만 있고, 비었을 때(5-2)는 없다
  const showChips = tab === 'new' && !isEmpty
  // 필터 아이콘: 새 편지(비었을 때 제외)와 배송 중(비었을 때도 있다)
  const showFilter = showChips || tab === 'shipping'
  const view = TAB_VIEW[tab]

  return (
    <main className="mailbox-page">
      <header className="mailbox-page__header">
        <h1 className="mailbox-page__title">우체통</h1>
        {/* 필터 시트는 이 화면들의 범위 밖이라 아직 동작이 없다 */}
        {showFilter && (
          <button type="button" className="mailbox-page__filter" aria-label="필터">
            <Icon name="filter" />
          </button>
        )}
      </header>

      <MailboxTabs
        options={MAILBOX_TAB_OPTIONS}
        value={tab}
        onChange={changeTab}
        dotTabId={hasNewDot ? 'new' : undefined}
      />

      {showChips && (
        <div className="mailbox-page__chips">
          {/* 지역별 필터는 지역 선택(shared/region) 연결 전이라 표시만 한다 */}
          <Chip>지역별 ▾</Chip>
          {MAILBOX_SORT_OPTIONS.map((option) => (
            <Chip
              key={option.id}
              variant={option.id === sort ? 'selected' : 'default'}
              onClick={() => changeSort(option.id)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      )}

      {tab === 'stored' && !isEmpty && (
        <div className="mailbox-page__notice">
          <StoredNotice />
        </div>
      )}

      {isLoading && (
        <ul className={`mailbox-page__list mailbox-page__list--${tab}`}>
          {[0, 1, 2, 3].map((n) => (
            <li key={n}>
              <Skeleton height={view.skeletonHeight} radius={view.skeletonRadius} />
            </li>
          ))}
        </ul>
      )}

      {hasItems && (
        <ul className={`mailbox-page__list mailbox-page__list--${tab}`}>
          {items.map((item) => (
            <li key={item.id}>{renderCard(tab, item)}</li>
          ))}
        </ul>
      )}

      {hasItems && tab === 'shipping' && (
        <div className="mailbox-page__banner">
          <GameBanner />
        </div>
      )}

      {isEmpty && tab === 'new' && (
        <MailboxEmpty
          size="large"
          pose="sleepy"
          title="아직 새 편지가 없어요"
          description={['고향 일기를 쓰면 그 동네가 고향인', '친구에게서 편지가 찾아와요']}
          actionLabel="고향 일기 쓰러 가기"
          onAction={() => navigate(DIARY_WRITE_PATH)}
        />
      )}

      {isEmpty && tab === 'chatting' && (
        <MailboxEmpty
          size="small"
          pose="curious"
          title="아직 이어지는 대화가 없어요"
          description={['받은 편지에 답장하면', '여기서 대화가 이어져요']}
          actionLabel="새 편지 보러 가기"
          onAction={() => changeTab('new')}
        />
      )}

      {isEmpty && tab === 'shipping' && (
        <MailboxEmpty
          size="small"
          pose="letter"
          mascotSize={92}
          mascotShift={-5}
          title="지금 오가는 편지가 없어요"
          description={['편지를 보내면 도착할 때까지', '여기서 남은 시간을 볼 수 있어요']}
          actionLabel="편지 쓰러 가기"
          onAction={() => navigate(LETTER_WRITE_PATH)}
        />
      )}

      {isEmpty && tab === 'stored' && (
        <MailboxEmpty
          size="small"
          pose="sleepy"
          title="아직 보관된 편지가 없어요"
          description={['넘긴 편지와 마무리된 대화가 여기에 조용히 모여요']}
        />
      )}
    </main>
  )
}

export default MailboxPage
