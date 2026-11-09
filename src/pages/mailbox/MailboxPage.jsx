import { useEffect, useState } from 'react'
import Icon from '../../shared/ui/Icon.jsx'
import Chip from '../../shared/ui/Chip.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import MailboxTabs from '../../components/mailbox/MailboxTabs.jsx'
import LetterCard from '../../components/mailbox/LetterCard.jsx'
import { MAILBOX_TAB_OPTIONS, MAILBOX_SORT_OPTIONS } from '../../components/mailbox/mailboxFilters.js'
import { fetchMailboxLetters } from '../../components/mailbox/mailboxApi.js'
import './MailboxPage.css'

/**
 * 5-1 우체통 · 새 편지. 탭(새 편지/대화 중/배송 중/보관)과 정렬 칩에 맞춰 목록을 보여 준다.
 * 목록은 mock이다(문서 레포 API 확정 전, Notion 초안 참고). 요청과 변환은 components/mailbox에서 한다.
 * 가정: 탭·정렬은 화면 상태로만 두고 URL에는 넣지 않았다.
 */
function MailboxPage() {
  const [tab, setTab] = useState('new')
  const [sort, setSort] = useState('latest')
  const [letters, setLetters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNewDot, setHasNewDot] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchMailboxLetters(tab, { sort }).then((page) => {
      if (cancelled) return
      setLetters(page.letters)
      if (tab === 'new') setHasNewDot(page.letters.some((letter) => !letter.isRead))
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [tab, sort])

  // 탭·정렬을 바꾸는 순간 로딩 표시로 돌린다(효과 안에서 setState를 바로 부르지 않기 위해 여기서 처리)
  const changeTab = (next) => {
    setIsLoading(true)
    setTab(next)
  }
  const changeSort = (next) => {
    setIsLoading(true)
    setSort(next)
  }

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

      <ul className="mailbox-page__list">
        {isLoading
          ? [0, 1, 2, 3].map((n) => (
              <li key={n}>
                <Skeleton height={100} radius={24} />
              </li>
            ))
          : letters.map((letter) => (
              <li key={letter.id}>
                <LetterCard letter={letter} />
              </li>
            ))}
      </ul>
    </main>
  )
}

export default MailboxPage
