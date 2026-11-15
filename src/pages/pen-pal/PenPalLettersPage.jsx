import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Button from '../../shared/ui/Button.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import PenPalLetterCard from '../../components/pen-pal/PenPalLetterCard.jsx'
import { fetchPenPalLetters } from '../../components/pen-pal/penPalApi.js'
import './PenPalLettersPage.css'

/**
 * 5-15 (상대)와 주고받은 편지. 시작 일기와 주고받은 편지를 시간순으로 보여 준다. 아래 "답장 쓰기"는 편지 쓰기로 간다.
 * 데이터는 mock이다(문서 레포에 편지·펜팔 API가 없다). 요청과 변환은 components/pen-pal에서 한다.
 * 가정:
 *  - 경로는 /pen-pal/:friendId 이다.
 *  - "답장 쓰기"는 /letter-write?letterId=…&nickname=…&region=… 로 이동한다(5-10, 5-11은 편지 쓰기 흐름을 그대로 쓴다).
 *  - 카드를 눌러도 아무 일도 없다(시안에 이동이 없다).
 *  - 우체통 대화 중 카드(5-3)를 누르면 들어온다. 끝난 대화는 "답장 쓰기" 버튼을 숨긴다.
 * 개발 중 확인용 주소: /pen-pal/1, /pen-pal/2, /pen-pal/3, /pen-pal/4(끝난 대화)
 */
function PenPalLettersPage() {
  const { friendId } = useParams()
  const navigate = useNavigate()
  // undefined: 불러오는 중, null: 없는 친구
  const [data, setData] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    fetchPenPalLetters(friendId).then((result) => {
      if (!cancelled) setData(result)
    })
    return () => {
      cancelled = true
    }
  }, [friendId])

  if (data === null) {
    return (
      <main className="pen-pal-letters">
        <Header title="주고받은 편지" />
        <p className="pen-pal-letters__missing">찾을 수 없는 친구예요</p>
      </main>
    )
  }

  return (
    <main className="pen-pal-letters">
      <Header title={data?.title ?? '주고받은 편지'} />

      <div className="pen-pal-letters__body">
        {data === undefined ? (
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
