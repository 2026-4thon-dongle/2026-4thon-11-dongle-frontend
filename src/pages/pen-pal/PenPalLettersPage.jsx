import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Button from '../../shared/ui/Button.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import PenPalLetterCard from '../../components/pen-pal/PenPalLetterCard.jsx'
import { fetchPenPalLetters } from '../../components/pen-pal/penPalApi.js'
import './PenPalLettersPage.css'

/**
 * 5-15 (상대)와 주고받은 편지. 시작 일기와 주고받은 편지를 시간순으로 보여 준다. 아래 "답장 쓰기"는 편지 쓰기로 간다.
 * 데이터는 서버(GET /api/mailbox/conversations/{id}/, api/mailbox.md)에서 받는다. 요청과 변환은 components/pen-pal에서 한다. VITE_API_MOCK=true(개발 전용)일 때만 mock이다.
 * 로딩은 스켈레톤이다. 실패하면 mock으로 채우지 않고 에러 화면과 "다시 시도"를 보여 준다. 내 대화가 아니거나 없으면(404) 안내 문구만 나온다.
 * 가정:
 *  - 경로는 /pen-pal/:conversationId 이다. id는 친구 id가 아니라 대화 id이다(우체통 대화 중 카드, 펜팔 목록, 보관의 마무리된 대화가 같은 id로 들어온다).
 *  - "답장 쓰기"는 서버가 준 reply_to가 있을 때만 보인다. /letter-write?letterId=…&nickname=…&region=… 로 이동한다(5-10, 5-11은 편지 쓰기 흐름을 그대로 쓴다).
 *    마무리된 대화(7일 동안 답장 없음)나 지금 답장할 수 없는 대화는 reply_to가 없어 버튼이 없다.
 *  - 카드를 눌러도 아무 일도 없다(시안에 이동이 없다).
 *  - 서버는 도착한 편지만 미리보기를 줘서, 내가 보낸 편지의 첫 줄이 없으면 "내가 보낸 편지예요"로 보여 준다.
 * 개발 중 확인용 주소(VITE_API_MOCK=true일 때): /pen-pal/1, /pen-pal/2, /pen-pal/3, /pen-pal/4(끝난 대화)
 */
function PenPalLettersPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const [reloadKey, setReloadKey] = useState(0)
  // 불러온 결과. 어떤 대화·시도(key)로 받았는지 같이 둔다: 지금 key와 다르면 아직 불러오는 중이다.
  //   data: 화면용 데이터, null이면 없는 대화. error: 불러오지 못한 이유(ApiError)
  const [result, setResult] = useState(null)

  const requestKey = `${conversationId}|${reloadKey}`
  const loaded = result?.key === requestKey ? result : null

  useEffect(() => {
    let cancelled = false
    fetchPenPalLetters(conversationId)
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data, error: null })
      })
      .catch((error) => {
        if (!cancelled) setResult({ key: requestKey, data: null, error })
      })
    return () => {
      cancelled = true
    }
  }, [conversationId, requestKey])

  if (loaded?.error) {
    return (
      <ErrorScreen
        description={loaded.error.message}
        hint=""
        onRetry={() => setReloadKey((value) => value + 1)}
      />
    )
  }

  if (loaded && loaded.data === null) {
    return (
      <main className="pen-pal-letters">
        <Header title="주고받은 편지" />
        <p className="pen-pal-letters__missing">찾을 수 없는 대화예요</p>
      </main>
    )
  }

  const data = loaded?.data

  return (
    <main className="pen-pal-letters">
      <Header title={data?.title || '주고받은 편지'} />

      <div className="pen-pal-letters__body">
        {!data ? (
          <div className="pen-pal-letters__list" aria-busy="true">
            {[0, 1, 2].map((n) => (
              <Skeleton key={n} height={110} radius={22} />
            ))}
          </div>
        ) : (
          <>
            <p className="pen-pal-letters__count">{data.countLabel}</p>
            <ul className="pen-pal-letters__list">
              {data.items.map((item) => (
                <li key={item.id} className="pen-pal-letters__item">
                  <PenPalLetterCard item={item} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {data?.canReply && (
        <footer className="pen-pal-letters__footer">
          <Button onClick={() => navigate(data.replyPath)}>답장 쓰기</Button>
        </footer>
      )}
    </main>
  )
}

export default PenPalLettersPage
