import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import MailboxTabs from '../../components/mailbox/MailboxTabs.jsx'
import LetterCard from '../../components/mailbox/LetterCard.jsx'
import ChatCard from '../../components/mailbox/ChatCard.jsx'
import ShippingCard from '../../components/mailbox/ShippingCard.jsx'
import StoredCard from '../../components/mailbox/StoredCard.jsx'
import StoredNotice from '../../components/mailbox/StoredNotice.jsx'
import GameBanner from '../../components/mailbox/GameBanner.jsx'
import MailboxEmpty from '../../components/mailbox/MailboxEmpty.jsx'
import NewLetterFilters from '../../components/mailbox/NewLetterFilters.jsx'
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

const DEFAULT_TAB = 'new'

/** 탭 id로 쓸 수 있는 값이면 그대로, 아니면 null(없는 탭·잘못된 값) */
function pickTab(value) {
  return typeof value === 'string' && Object.hasOwn(TAB_VIEW, value) ? value : null
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
 * 정렬 칩은 새 편지 탭에만 있다. 배송 중 탭은 도착 임박순으로 고정이다(정렬은 mailboxApi). 오른쪽 위 필터 아이콘은 없다.
 * 대화 중 카드는 5-15(/pen-pal/:friendId)로 이동한다.
 * 목록은 mock이다(문서 레포 API 확정 전, Notion 초안 참고). 요청과 변환은 components/mailbox에서 한다.
 * 탭은 주소 쿼리(/mailbox?tab=new|chatting|shipping|stored)에 둔다. 상세 화면에 갔다가 뒤로 나와도 보던 탭이 남는다.
 *   시작 탭 우선순위: navigate의 state.tab(5-9 넘기기, 5-12, 5-13) > 쿼리 ?tab > 새 편지. 잘못된 값은 새 편지로 본다.
 *   탭을 바꿀 때와 state로 열렸을 때는 replace로 쿼리를 맞춰 히스토리를 쌓지 않는다(뒤로 가기가 탭을 거슬러 오르지 않는다).
 * 가정: 정렬·지역 필터는 화면 상태로만 두고 URL에는 넣지 않았다(상세에 다녀오면 처음으로 돌아간다).
 * 지역 필터("지역별 ▾")는 새 편지 탭에만 있다. 선택 UI는 시안이 없어 임시로 만들었다(NewLetterFilters).
 * 개발 중 확인용: 주소 뒤에 ?mock=empty 를 붙이면 mock 데이터가 비어 비었을 때 화면이 나온다.
 */
function MailboxPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const forceEmpty = import.meta.env.DEV && searchParams.get('mock') === 'empty'

  const tab = pickTab(location.state?.tab) ?? pickTab(searchParams.get('tab')) ?? DEFAULT_TAB
  const [sort, setSort] = useState('latest')
  const [region, setRegion] = useState(null)
  const [regionOptions, setRegionOptions] = useState([])
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNewDot, setHasNewDot] = useState(false)

  // 주소 쿼리를 지금 탭에 맞춘다(없거나 잘못된 값, state로 열린 경우). 쓴 state는 지워서 새로고침해도 쿼리를 따른다.
  useEffect(() => {
    if (location.state?.tab || searchParams.get('tab') !== tab) {
      const next = new URLSearchParams(searchParams)
      next.set('tab', tab)
      navigate({ pathname: location.pathname, search: `?${next.toString()}` }, { replace: true, state: null })
    }
  }, [tab, location, searchParams, navigate])

  useEffect(() => {
    let cancelled = false
    fetchMailboxLetters(tab, { sort, region, empty: forceEmpty }).then((page) => {
      if (cancelled) return
      setItems(page.items)
      if (tab === 'new') {
        // 점과 지역 목록은 필터를 건 결과가 아니라 전체 기준이다(api가 따로 계산해 준다)
        setHasNewDot(page.hasUnread)
        setRegionOptions(page.regions)
      }
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [tab, sort, region, forceEmpty])

  // 탭·정렬을 바꾸는 순간 로딩 표시로 돌린다(효과 안에서 setState를 바로 부르지 않기 위해 여기서 처리)
  // 이미 고른 값이면 아무것도 하지 않는다: 값이 그대로면 효과가 다시 돌지 않아 로딩이 끝나지 않기 때문이다.
  const changeTab = (next) => {
    if (next === tab) return
    setIsLoading(true)
    const params = new URLSearchParams(searchParams)
    params.set('tab', next)
    navigate({ pathname: location.pathname, search: `?${params.toString()}` }, { replace: true })
  }
  const changeSort = (next) => {
    if (next === sort) return
    setIsLoading(true)
    setSort(next)
  }
  const changeRegion = (next) => {
    if (next === region) return
    setIsLoading(true)
    setRegion(next)
  }

  const isEmpty = !isLoading && items.length === 0
  const hasItems = !isLoading && items.length > 0
  // 정렬 칩은 새 편지 탭에만 있고, 비었을 때(5-2)는 없다.
  // 지역 필터를 걸어서 빈 경우는 5-2가 아니므로 칩을 남겨 필터를 풀 수 있게 한다.
  const showChips = tab === 'new' && (!isEmpty || region !== null)
  const view = TAB_VIEW[tab]

  return (
    <main className="mailbox-page">
      <header className="mailbox-page__header">
        <h1 className="mailbox-page__title">우체통</h1>
      </header>

      <MailboxTabs
        options={MAILBOX_TAB_OPTIONS}
        value={tab}
        onChange={changeTab}
        dotTabId={hasNewDot ? 'new' : undefined}
      />

      {showChips && (
        <NewLetterFilters
          regions={regionOptions}
          region={region}
          onRegionChange={changeRegion}
          sortOptions={MAILBOX_SORT_OPTIONS}
          sort={sort}
          onSortChange={changeSort}
        />
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

      {isEmpty && tab === 'new' && region !== null && (
        <p className="mailbox-page__filtered-empty">{region}에서 온 새 편지가 없어요</p>
      )}

      {isEmpty && tab === 'new' && region === null && (
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
