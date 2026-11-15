import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Button from '../../shared/ui/Button.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import LetterArrival from '../../components/mailbox/LetterArrival.jsx'
import LetterPaper from '../../components/mailbox/LetterPaper.jsx'
import LetterMenuSheet from '../../components/mailbox/LetterMenuSheet.jsx'
import {
  fetchLetterDetail,
  markLetterRead,
  markLetterReplied,
  passLetter,
} from '../../components/mailbox/letterReceiveApi.js'
import './LetterPage.css'

const MAILBOX_PATH = '/mailbox'
// "붙일 우표가 없나요?" 줄(보류 기능 HOLD-02 진입점). 팀이 숨기기로 하면 false로 바꾼다. 켜도 지금은 토스트만 나온다.
const SHOW_STAMP_MAKE_ENTRY = true

/**
 * 5-8 새 편지 도착 · 5-9 편지 열람. 우체통 카드(/mailbox/:letterId)를 누르면 들어온다.
 * 데이터는 mock이다(문서 레포에 편지 API가 없다). 요청과 변환은 components/mailbox에서 한다.
 * 가정:
 *  - 읽지 않은 편지는 5-8, 읽은 편지는 5-9로 연다. 5-8에서 "봉투 열기"를 누르면 읽음 처리하고 5-9로 바꾼다.
 *  - "나중에 읽을래요"는 읽음 처리 없이 우체통(/mailbox)으로 돌아간다. 편지는 빨간 점이 유지된 채 새 편지 탭에 남는다.
 *  - 열어서 읽기만 한 편지는 새 편지 탭에 남되 빨간 점이 사라진다(읽음 상태는 mock 저장소에 있다).
 *  - "넘기기"는 보관 탭으로 옮기고 토스트를 보여 준 뒤 우체통으로 돌아간다. 토스트 문구는 시안에 없어서 정했다.
 *  - "답장하기"는 편지를 대화 중 탭으로 옮기고(mock) /letter-write?letterId=…&nickname=…&region=… 로 이동한다(5-10, 5-11은 편지 쓰기 흐름을 그대로 쓴다).
 *  - 오른쪽 위 "…"는 신고·차단 메뉴 시트를 열고, 항목은 토스트만 보여 준다(효령님 3-6~3-8과 연결 전).
 *  - 시안의 "붙일 우표가 없나요? 만들고 바로 답장해요" 줄은 보류 기능(HOLD-02) 진입점이다. SHOW_STAMP_MAKE_ENTRY로 켜고 끈다(눌러도 토스트만).
 * 개발 중 확인용 주소: /mailbox/101, /mailbox/102(읽지 않음 → 5-8), /mailbox/103, /mailbox/104(읽음 → 5-9)
 */
function LetterPage() {
  const { letterId } = useParams()
  const navigate = useNavigate()
  const { openSheet, showToast, close } = useOverlay()
  // undefined: 불러오는 중, null: 없는 편지
  const [detail, setDetail] = useState(undefined)
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchLetterDetail(letterId).then((result) => {
      if (!cancelled) setDetail(result)
    })
    return () => {
      cancelled = true
    }
  }, [letterId])

  const handleOpen = async () => {
    await markLetterRead(letterId)
    setOpened(true)
  }

  const handlePass = async () => {
    await passLetter(letterId)
    showToast('보관함으로 넘겼어요')
    navigate(MAILBOX_PATH, { replace: true })
  }

  // mock: 답장하기를 누르는 순간 대화 중 탭으로 옮긴다(실제 API에서는 서버가 답장 발송 후 옮긴다)
  const handleReply = async () => {
    await markLetterReplied(letterId)
    navigate(detail.view.replyPath)
  }

  const openMenu = () =>
    openSheet({
      content: (
        <LetterMenuSheet
          onSelect={(label) => {
            close()
            showToast(`${label}는 준비 중이에요`)
          }}
        />
      ),
    })

  if (detail === undefined) {
    return (
      <main className="letter-page">
        <Header title="편지" />
        <div className="letter-page__body" aria-busy="true">
          <Skeleton height={486} radius={24} />
        </div>
      </main>
    )
  }

  if (detail === null) {
    return (
      <main className="letter-page">
        <Header title="편지" />
        <p className="letter-page__missing">찾을 수 없는 편지예요</p>
      </main>
    )
  }

  if (!detail.arrival.isRead && !opened) {
    return (
      <main className="letter-page letter-page--arrival">
        <LetterArrival arrival={detail.arrival} onOpen={handleOpen} onLater={() => navigate(MAILBOX_PATH)} />
      </main>
    )
  }

  return (
    <main className="letter-page">
      <Header
        title="편지"
        right={
          <button type="button" className="letter-page__more" aria-label="더보기" onClick={openMenu}>
            <Icon name="more" />
          </button>
        }
      />

      <div className="letter-page__body">
        <LetterPaper letter={detail.view} />
      </div>

      {SHOW_STAMP_MAKE_ENTRY && (
        <button
          type="button"
          className="letter-page__stamp-make"
          onClick={() => showToast('우표 만들기는 준비 중이에요')}
        >
          <Icon name="stamp" size={22} />
          <span>붙일 우표가 없나요? 만들고 바로 답장해요 ›</span>
        </button>
      )}

      <footer className="letter-page__footer">
        <div className="letter-page__actions">
          <Button variant="ghost" className="letter-page__pass" onClick={handlePass}>
            넘기기
          </Button>
          <Button onClick={handleReply}>답장하기</Button>
        </div>
        <p className="letter-page__hint">넘겨도 상대에게 알림이 가지 않아요</p>
      </footer>
    </main>
  )
}

export default LetterPage
