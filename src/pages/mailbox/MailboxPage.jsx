import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../../shared/ui/Icon.jsx'
import Chip from '../../shared/ui/Chip.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import MailboxTabs from '../../components/mailbox/MailboxTabs.jsx'
import LetterCard from '../../components/mailbox/LetterCard.jsx'
import ChatCard from '../../components/mailbox/ChatCard.jsx'
import MailboxEmpty from '../../components/mailbox/MailboxEmpty.jsx'
import { MAILBOX_TAB_OPTIONS, MAILBOX_SORT_OPTIONS } from '../../components/mailbox/mailboxFilters.js'
import { fetchMailboxLetters } from '../../components/mailbox/mailboxApi.js'
import './MailboxPage.css'

// 가정: 일기 쓰기 경로. shared TabBar의 기본 경로(/diary/write)와 같고, 지금은 /diary/* 가 RoutePlaceholder이다.
const DIARY_WRITE_PATH = '/diary/write'

/**
 * 우체통 5-1 ~ 5-4. 탭(새 편지/대화 중/배송 중/보관)에 맞춰 목록을 보여 준다.
 * - 새 편지(5-1): 정렬 칩 + 편지 카드. 비었으면 5-2.
 * - 대화 중(5-3): 칩 없이 대화 카드. 비었으면 5-4.
 * 목록은 mock이다(문서 레포 API 확정 전, Notion 초안 참고). 요청과 변환은 components/mailbox에서 한다.
 * 가정: 탭·정렬은 화면 상태로만 두고 URL에는 넣지 않았다.
 * 개발 중 확인용: 주소 뒤에 ?mock=empty 를 붙이면 mock 데이터가 비어 5-2, 5-4 화면이 나온다.
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

  // 정렬 칩은 새 편지 탭에만 있고, 비었을 때(5-2)는 없다
  const showChips = tab === 'new' && (isLoading || items.length > 0)

  return (
    <main className="mailbox-page">
      <header className="mailbox-page__header">
        <h1 className="mailbox-page__title">우체통</h1>
        {/* 필터 시트는 5-1 범위 밖이라 아직 동작이 없다 */}
        <button type="button" className="mailbox-page__filter" aria-label="필터">
          <Icon name="filter" />
        </button>
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

      {isLoading && (
        <ul className="mailbox-page__list">
          {[0, 1, 2, 3].map((n) => (
            <li key={n}>
              <Skeleton height={tab === 'chatting' ? 110 : 100} radius={24} />
            </li>
          ))}
        </ul>
      )}

      {!isLoading && items.length > 0 && (
        <ul className="mailbox-page__list">
          {items.map((item) => (
            <li key={item.id}>
              {tab === 'chatting' ? <ChatCard chat={item} /> : <LetterCard letter={item} />}
            </li>
          ))}
        </ul>
      )}

      {!isLoading && items.length === 0 && tab === 'new' && (
        <MailboxEmpty
          size="large"
          pose="sleepy"
          title="아직 새 편지가 없어요"
          description={['고향 일기를 쓰면 그 동네가 고향인', '친구에게서 편지가 찾아와요']}
          actionLabel="고향 일기 쓰러 가기"
          onAction={() => navigate(DIARY_WRITE_PATH)}
        />
      )}

      {!isLoading && items.length === 0 && tab === 'chatting' && (
        <MailboxEmpty
          size="small"
          pose="curious"
          title="아직 이어지는 대화가 없어요"
          description={['받은 편지에 답장하면', '여기서 대화가 이어져요']}
          actionLabel="새 편지 보러 가기"
          onAction={() => changeTab('new')}
        />
      )}
    </main>
  )
}

export default MailboxPage
