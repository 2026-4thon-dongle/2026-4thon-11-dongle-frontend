import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import { isApiDemo } from '../../shared/api/client.js'
import PenPalCard from '../../components/pen-pal/PenPalCard.jsx'
import { fetchPenPals } from '../../components/pen-pal/penPalApi.js'
import './PenPalPage.css'

/**
 * 5-14 펜팔 친구. 편지를 여러 번 주고받은 상대 목록. 친구를 누르면 5-15(/pen-pal/:conversationId)로 간다.
 * 데이터는 서버(GET /api/penpals/, api/mailbox.md)에서 받는다. 요청과 변환은 components/pen-pal에서 한다. VITE_API_MOCK=true(개발 전용)일 때만 mock이다.
 * 로딩은 스켈레톤이다. 실패하면 mock으로 채우지 않고 에러 화면과 "다시 시도"를 보여 준다.
 * 페이지당 20개이고 다음 페이지가 있으면 목록 아래에 "더 보기" 버튼이 나온다(시안에 없는 임시 UI). 더 보기가 실패하면 토스트만 띄운다.
 * 가정:
 *  - 경로는 /pen-pal 이다. 마이(7-1)의 "펜팔 친구" 줄이 이 경로로 연결한다.
 *  - 펜팔 기준(3번 이상 주고받음)은 서버가 정한다(왕복 3회, api/mailbox.md의 가정). 화면 문구는 시안 그대로이다.
 *  - 친구가 없을 때 화면이 시안에 없어서 안내 문구만 보여 준다.
 * 개발 중 확인용: VITE_API_MOCK=true일 때만 주소 뒤에 ?mock=empty 를 붙이면 펜팔 친구가 없는 상태가 나온다.
 */
function PenPalPage() {
  const [searchParams] = useSearchParams()
  const { showToast } = useOverlay()
  const forceEmpty = isApiDemo && searchParams.get('mock') === 'empty'
  const [reloadKey, setReloadKey] = useState(0)
  // 불러온 결과. 어떤 조건(key)으로 받았는지 같이 둔다: 지금 조건과 key가 다르면 아직 불러오는 중이다.
  const [result, setResult] = useState(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const requestKey = `${forceEmpty}|${reloadKey}`
  const loaded = result?.key === requestKey ? result : null

  useEffect(() => {
    let cancelled = false
    fetchPenPals({ empty: forceEmpty })
      .then((page) => {
        if (!cancelled) setResult({ key: requestKey, items: page.items, page: 1, hasNext: page.hasNext, error: null })
      })
      .catch((error) => {
        if (!cancelled) setResult({ key: requestKey, items: [], page: 1, hasNext: false, error })
      })
    return () => {
      cancelled = true
    }
  }, [forceEmpty, requestKey])

  const retry = useCallback(() => setReloadKey((value) => value + 1), [])

  const loadMore = async () => {
    if (isLoadingMore || !loaded?.hasNext) return
    const key = requestKey
    setIsLoadingMore(true)
    try {
      const next = await fetchPenPals({ page: loaded.page + 1, empty: forceEmpty })
      setResult((prev) => {
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

  if (loaded?.error) {
    return <ErrorScreen description={loaded.error.message} hint="" onRetry={retry} />
  }

  const friends = loaded?.items ?? null

  return (
    <main className="pen-pal-page">
      <Header title="펜팔 친구" />

      <div className="pen-pal-page__body">
        <p className="pen-pal-page__notice">
          <Mascot pose="smile" size={44} />
          <span>
            편지를 3번 이상 주고받으면
            <br />
            펜팔 친구가 돼요
          </span>
        </p>

        {friends === null && (
          <ul className="pen-pal-page__list" aria-busy="true">
            {[0, 1, 2].map((n) => (
              <li key={n}>
                <Skeleton height={80} radius={24} />
              </li>
            ))}
          </ul>
        )}

        {friends !== null && friends.length > 0 && (
          <ul className="pen-pal-page__list">
            {friends.map((friend) => (
              <li key={friend.id}>
                <PenPalCard friend={friend} />
              </li>
            ))}
          </ul>
        )}

        {friends !== null && loaded.hasNext && (
          <div className="pen-pal-page__more">
            <Button variant="secondary" disabled={isLoadingMore} onClick={loadMore}>
              {isLoadingMore ? '불러오는 중…' : '더 보기'}
            </Button>
          </div>
        )}

        {friends !== null && friends.length === 0 && (
          <p className="pen-pal-page__empty">아직 펜팔 친구가 없어요</p>
        )}
      </div>
    </main>
  )
}

export default PenPalPage
