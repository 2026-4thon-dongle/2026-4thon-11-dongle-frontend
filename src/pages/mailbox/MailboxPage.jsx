import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import Button from '../../shared/ui/Button.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import { isApiDemo } from '../../shared/api/client.js'
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
import { fetchMailboxLetters, fetchMailboxSummary } from '../../components/mailbox/mailboxApi.js'
import useSidoOptions from '../../components/mailbox/useSidoOptions.js'
import './MailboxPage.css'

// 가정: 다른 담당 화면으로 가는 경로. 모두 지금은 RoutePlaceholder(임시 화면)이거나 다른 담당이 만든 화면이다.
//   일기 쓰기: shared TabBar의 기본 경로와 같다 (/diary/* 임시 화면)
//   홈 피드: 답장할 일기를 고르는 곳(배송 중이 비었을 때 "편지 쓰러 가기")
const DIARY_WRITE_PATH = '/diary/write'
const HOME_PATH = '/home'

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
 * 정렬 칩은 새 편지 탭에만 있다(서버 ordering). 배송 중 탭은 서버가 도착 임박순으로 준다. 오른쪽 위 필터 아이콘은 없다.
 * 대화 중 카드는 5-15(/pen-pal/:conversationId)로 이동한다.
 * 목록은 서버(api/mailbox.md)에서 받는다. 요청과 변환은 components/mailbox에서 한다. VITE_API_MOCK=true(개발 전용)일 때만 mock이다.
 * 로딩은 스켈레톤이다. 실패하면 mock으로 채우지 않고 에러 안내와 "다시 시도"를 보여 준다(탭은 그대로 남는다).
 * 페이지당 20개이고 다음 페이지가 있으면 목록 아래에 "더 보기" 버튼이 나온다(시안에 없는 임시 UI). 더 보기가 실패하면 토스트만 띄운다.
 * 탭은 주소 쿼리(/mailbox?tab=new|chatting|shipping|stored)에 둔다. 상세 화면에 갔다가 뒤로 나와도 보던 탭이 남는다.
 *   시작 탭 우선순위: navigate의 state.tab(5-9 넘기기, 5-12, 5-13) > 쿼리 ?tab > 새 편지. 잘못된 값은 새 편지로 본다.
 *   탭을 바꿀 때와 state로 열렸을 때는 replace로 쿼리를 맞춰 히스토리를 쌓지 않는다(뒤로 가기가 탭을 거슬러 오르지 않는다).
 * 가정: 정렬·지역 필터는 화면 상태로만 두고 URL에는 넣지 않았다(상세에 다녀오면 처음으로 돌아간다).
 * 지역 필터("지역별 ▾")는 새 편지 탭에만 있다. 선택 UI는 시안이 없어 임시로 만들었다(NewLetterFilters).
 *   시·도 목록은 서버 지역 목록(GET /api/regions/, shared/region)의 17개 시·도이고, 고른 시·도의 id를 서버 sido 파라미터로 보내 서버가 거른다(받아 온 편지를 화면에서 거르지 않는다).
 *   지역 목록을 못 받으면 드롭다운 안에 오류와 "다시 시도"가 나온다(목록은 그대로 보인다). 필터를 건 채 목록 요청이 실패해도 칩은 남아 필터를 풀 수 있다.
 * 새 편지 탭 옆 빨간 점은 GET /api/mailbox/summary/의 new_unread_count 기준이다(필터·페이지와 상관없다). 점만 실패하면 점 없이 목록은 보여 준다.
 * 개발 중 확인용: VITE_API_MOCK=true일 때만 주소 뒤에 ?mock=empty 를 붙이면 mock 데이터가 비어 비었을 때 화면이 나온다.
 */
function MailboxPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { showToast } = useOverlay()
  const forceEmpty = isApiDemo && searchParams.get('mock') === 'empty'

  const tab = pickTab(location.state?.tab) ?? pickTab(searchParams.get('tab')) ?? DEFAULT_TAB
  const [sort, setSort] = useState('latest')
  const [region, setRegion] = useState(null)
  const sidoOptions = useSidoOptions()
  const [reloadKey, setReloadKey] = useState(0)
  // 불러온 결과. 어떤 조건(key)으로 받았는지 같이 둔다: 지금 조건과 key가 다르면 아직 불러오는 중이다.
  const [result, setResult] = useState(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasNewDot, setHasNewDot] = useState(false)

  // 지역 필터는 새 편지 탭에서만 서버로 보낸다.
  const sido = tab === 'new' ? (region?.id ?? null) : null
  const requestKey = `${tab}|${sort}|${sido}|${forceEmpty}|${reloadKey}`
  const isLoading = result?.key !== requestKey

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
    // 탭 점은 목록과 따로 받는다. 점만 실패해도 목록은 보여 준다(점이 없을 뿐이다).
    Promise.all([
      fetchMailboxLetters(tab, { sort, sido, empty: forceEmpty }),
      fetchMailboxSummary({ empty: forceEmpty }).catch(() => null),
    ])
      .then(([page, summary]) => {
        if (cancelled) return
        setResult({ key: requestKey, items: page.items, page: 1, hasNext: page.hasNext, error: null })
        if (summary) setHasNewDot(summary.hasUnread)
      })
      .catch((error) => {
        if (!cancelled) setResult({ key: requestKey, items: [], page: 1, hasNext: false, error })
      })
    return () => {
      cancelled = true
    }
  }, [tab, sort, sido, forceEmpty, requestKey])

  const retry = useCallback(() => setReloadKey((value) => value + 1), [])

  const loadMore = async () => {
    if (isLoadingMore || isLoading || !result.hasNext) return
    const key = requestKey
    setIsLoadingMore(true)
    try {
      const next = await fetchMailboxLetters(tab, { sort, sido, page: result.page + 1, empty: forceEmpty })
      setResult((prev) => {
        // 더 보는 사이에 탭·정렬이 바뀌었으면 버린다
        if (!prev || prev.key !== key) return prev
        const known = new Set(prev.items.map((item) => item.id))
        return {
          ...prev,
          items: [...prev.items, ...next.items.filter((item) => !known.has(item.id))],
          page: prev.page + 1,
          hasNext: next.hasNext,
        }
      })
    } catch (error) {
      showToast(error.message)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const changeTab = (next) => {
    if (next === tab) return
    const params = new URLSearchParams(searchParams)
    params.set('tab', next)
    navigate({ pathname: location.pathname, search: `?${params.toString()}` }, { replace: true })
  }
  // 이미 고른 값이면 아무것도 하지 않는다
  const changeSort = (next) => {
    if (next !== sort) setSort(next)
  }
  const changeRegion = (next) => {
    if ((next?.id ?? null) !== (region?.id ?? null)) setRegion(next)
  }

  const error = isLoading ? null : result.error
  const items = isLoading || error ? [] : result.items
  const regionFilter = tab === 'new' ? region : null

  const isEmpty = !isLoading && !error && items.length === 0
  const hasItems = !isLoading && !error && items.length > 0
  // 정렬 칩은 새 편지 탭에만 있고, 비었을 때(5-2)는 없다.
  // 지역 필터를 걸어서 빈 경우는 5-2가 아니므로 칩을 남겨 필터를 풀 수 있게 한다.
  // 필터를 건 채 목록 요청이 실패하면 칩을 남겨 필터를 풀 수 있게 한다.
  const showChips = tab === 'new' && (!error || regionFilter !== null) && (!isEmpty || regionFilter !== null)
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
          regions={sidoOptions.options}
          region={regionFilter}
          onRegionChange={changeRegion}
          regionsLoading={sidoOptions.loading}
          regionsError={sidoOptions.error}
          onRegionsRetry={sidoOptions.retry}
          sortOptions={MAILBOX_SORT_OPTIONS}
          sort={sort}
          onSortChange={changeSort}
        />
      )}

      {tab === 'stored' && !isEmpty && !error && !isLoading && (
        <div className="mailbox-page__notice">
          <StoredNotice />
        </div>
      )}

      {isLoading && (
        <ul className={`mailbox-page__list mailbox-page__list--${tab}`} aria-busy="true">
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

      {!isLoading && !error && result.hasNext && (
        <div className="mailbox-page__more">
          <Button variant="secondary" disabled={isLoadingMore} onClick={loadMore}>
            {isLoadingMore ? '불러오는 중…' : '더 보기'}
          </Button>
        </div>
      )}

      {hasItems && tab === 'shipping' && (
        <div className="mailbox-page__banner">
          <GameBanner />
        </div>
      )}

      {error && (
        <MailboxEmpty
          size="small"
          pose="surprised"
          title="우체통을 불러오지 못했어요"
          description={[error.message]}
          actionLabel="다시 시도"
          onAction={retry}
        />
      )}

      {isEmpty && tab === 'new' && regionFilter !== null && (
        <p className="mailbox-page__filtered-empty">{regionFilter.label}에서 온 새 편지가 없어요</p>
      )}

      {isEmpty && tab === 'new' && regionFilter === null && (
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
          // 편지는 일기나 받은 편지에 답장할 때만 쓴다. 받는 사람 없이 편지 쓰기로 가면 4단계에서 막히므로 홈 피드로 간다.
          onAction={() => navigate(HOME_PATH)}
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
