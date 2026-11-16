import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Button from '../../shared/ui/Button.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import LetterArrival from '../../components/mailbox/LetterArrival.jsx'
import LetterPaper from '../../components/mailbox/LetterPaper.jsx'
import LetterMenuSheet from '../../components/mailbox/LetterMenuSheet.jsx'
import {
  fetchLetterDetail,
  openLetter,
  markLetterReplied,
  passLetter,
} from '../../components/mailbox/letterReceiveApi.js'
import './LetterPage.css'

const MAILBOX_PATH = '/mailbox'
// "붙일 우표가 없나요?" 줄(보류 기능 HOLD-02 진입점). 팀이 숨기기로 하면 false로 바꾼다. 켜도 지금은 토스트만 나온다.
const SHOW_STAMP_MAKE_ENTRY = true

/**
 * 5-8 새 편지 도착 · 5-9 편지 열람. 우체통 카드(/mailbox/:letterId)를 누르면 들어온다.
 * 데이터는 서버(GET /api/letters/{id}/, api/mailbox.md)에서 받는다. 요청과 변환은 components/mailbox에서 한다. VITE_API_MOCK=true(개발 전용)일 때만 mock이다.
 * 로딩은 스켈레톤이다. 실패하면 mock으로 채우지 않고 에러 안내를 보여 준다: 아직 도착하지 않은 편지(403 NOT_ARRIVED)와 없는 편지(404)는 안내 문구만,
 * 그 밖의 실패(네트워크 등)는 "다시 시도"가 있는 에러 화면이다.
 * 가정:
 *  - 내가 받은 편지이고 아직 열지 않았으면(direction이 received, is_read가 false) 5-8, 그 밖에는 5-9로 연다. 5-8에서 "봉투 열기"를 누르면 서버가 읽음 처리하고(POST open) 5-9로 바꾼다.
 *  - "나중에 읽을래요"는 읽음 처리 없이 한 칸 뒤로 돌아가 보던 탭에 머문다(주소로 바로 들어왔으면 /mailbox). 편지는 빨간 점이 유지된 채 새 편지 탭에 남는다.
 *  - 열어서 읽기만 한 편지는 새 편지 탭에 남되 빨간 점이 사라진다(서버가 읽음을 반영한 목록을 준다).
 *  - "넘기기"(POST pass)는 보관으로 옮기고 토스트("보관함으로 옮겼어요")를 보여 준 뒤 우체통의 보관 탭으로 이동한다. 토스트 문구는 시안에 없어서 정했다. 실패하면 서버 메시지를 토스트로 보여 준다.
 *  - "답장하기"는 /letter-write?letterId=…&nickname=…&region=… 로 이동한다(5-10, 5-11은 편지 쓰기 흐름을 그대로 쓴다). 편지를 대화 중으로 옮기는 것은 서버가 답장을 보낼 때 한다.
 *  - "답장하기"·"넘기기" 버튼은 서버가 준 can_reply·can_pass일 때만 보인다. 둘 다 없으면(보관한 편지 등) 읽기만 할 수 있다.
 *  - 오른쪽 위 "…"는 신고·차단 메뉴 시트를 열고, 항목은 토스트만 보여 준다(효령님 3-6~3-8과 연결 전).
 *  - 시안의 "붙일 우표가 없나요? 만들고 바로 답장해요" 줄은 보류 기능(HOLD-02) 진입점이다. SHOW_STAMP_MAKE_ENTRY로 켜고 끈다(눌러도 토스트만).
 * 개발 중 확인용 주소(VITE_API_MOCK=true일 때): /mailbox/101, /mailbox/102(읽지 않음 → 5-8), /mailbox/103, /mailbox/104(읽음 → 5-9)
 */
function LetterPage() {
  const { letterId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { openSheet, showToast, close } = useOverlay()
  const [reloadKey, setReloadKey] = useState(0)
  // 불러온 결과. 어떤 편지·시도(key)로 받았는지 같이 둔다: 지금 key와 다르면 아직 불러오는 중이다.
  //   detail: 편지 상세, null이면 없는 편지. error: 불러오지 못한 이유(ApiError)
  const [result, setResult] = useState(null)

  const requestKey = `${letterId}|${reloadKey}`
  const loaded = result?.key === requestKey ? result : null

  useEffect(() => {
    let cancelled = false
    fetchLetterDetail(letterId)
      .then((detail) => {
        if (!cancelled) setResult({ key: requestKey, detail, error: null })
      })
      .catch((error) => {
        if (!cancelled) setResult({ key: requestKey, detail: null, error })
      })
    return () => {
      cancelled = true
    }
  }, [letterId, requestKey])

  // 5-8 "나중에 읽을래요": 우체통에서 들어왔으면 한 칸 뒤로(보던 탭 그대로), 주소로 바로 들어왔으면 우체통으로
  const handleLater = () => {
    if (location.key !== 'default') navigate(-1)
    else navigate(MAILBOX_PATH, { replace: true })
  }

  const handleOpen = async () => {
    try {
      const opened = await openLetter(letterId)
      if (opened) setResult((prev) => (prev?.key === requestKey ? { ...prev, detail: opened } : prev))
    } catch (error) {
      showToast(error.message)
    }
  }

  const handlePass = async () => {
    try {
      await passLetter(letterId)
    } catch (error) {
      showToast(error.message)
      return
    }
    showToast('보관함으로 옮겼어요')
    // 우체통은 보관 탭으로 연다(탭은 주소가 아니라 화면 상태라 location.state로 넘긴다)
    navigate(MAILBOX_PATH, { replace: true, state: { tab: 'stored' } })
  }

  const handleReply = async () => {
    try {
      await markLetterReplied(letterId)
    } catch (error) {
      showToast(error.message)
      return
    }
    navigate(loaded.detail.view.replyPath)
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

  if (!loaded) {
    return (
      <main className="letter-page">
        <Header title="편지" />
        <div className="letter-page__body" aria-busy="true">
          <Skeleton height={486} radius={24} />
        </div>
      </main>
    )
  }

  const { detail, error } = loaded

  if (error?.code === 'NOT_ARRIVED') {
    return (
      <main className="letter-page">
        <Header title="편지" />
        <p className="letter-page__missing">아직 도착하지 않은 편지예요</p>
      </main>
    )
  }

  if (error) {
    return (
      <ErrorScreen description={error.message} hint="" onRetry={() => setReloadKey((value) => value + 1)} />
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

  if (detail.needsOpen) {
    return (
      <main className="letter-page letter-page--arrival">
        <LetterArrival arrival={detail.arrival} onOpen={handleOpen} onLater={handleLater} />
      </main>
    )
  }

  const { canReply, canPass } = detail.view

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

      {SHOW_STAMP_MAKE_ENTRY && canReply && (
        <button
          type="button"
          className="letter-page__stamp-make"
          onClick={() => showToast('우표 만들기는 준비 중이에요')}
        >
          <Icon name="stamp" size={22} />
          <span>붙일 우표가 없나요? 만들고 바로 답장해요 ›</span>
        </button>
      )}

      {(canReply || canPass) && (
        <footer className="letter-page__footer">
          <div className="letter-page__actions">
            {canPass && (
              <Button variant="ghost" className="letter-page__pass" onClick={handlePass}>
                넘기기
              </Button>
            )}
            {canReply && <Button onClick={handleReply}>답장하기</Button>}
          </div>
          {canPass && <p className="letter-page__hint">넘겨도 상대에게 알림이 가지 않아요</p>}
        </footer>
      )}
    </main>
  )
}

export default LetterPage
