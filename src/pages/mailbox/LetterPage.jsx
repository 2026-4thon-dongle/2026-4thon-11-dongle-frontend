import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Button from '../../shared/ui/Button.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import { isApiDemo } from '../../shared/api/client.js'
import ReportForm from '../../shared/ui/ReportForm.jsx'
import BlockDialog from '../../shared/ui/BlockDialog.jsx'
import LetterArrival from '../../components/mailbox/LetterArrival.jsx'
import LetterPaper from '../../components/mailbox/LetterPaper.jsx'
import LetterMenuSheet from '../../components/mailbox/LetterMenuSheet.jsx'
import {
  blockLetterSender,
  fetchLetterDetail,
  openLetter,
  markLetterReplied,
  passLetter,
  reportLetter,
} from '../../components/mailbox/letterReceiveApi.js'
import { findRoundTripGain } from '../../components/mailbox/stampRewardApi.js'
import './LetterPage.css'

const MAILBOX_PATH = '/mailbox'
// "붙일 우표가 없나요?" 줄(보류 기능 HOLD-02 진입점). 2026-11-17 팀 결정으로 HOLD-02는 범위에서 빼고 숨긴다(문서 레포 requests/1110_be2fe_hold-entry-points.md).
const SHOW_STAMP_MAKE_ENTRY = false

/**
 * 5-8 새 편지 도착 · 5-9 편지 열람. 우체통 카드(/mailbox/:letterId)를 누르면 들어온다.
 * 데이터는 서버(GET /api/letters/{id}/, api/mailbox.md)에서 받는다. 요청과 변환은 components/mailbox에서 한다. VITE_API_MOCK=true(개발 전용)일 때만 mock이다.
 * 로딩은 스켈레톤이다. 실패하면 mock으로 채우지 않고 에러 안내를 보여 준다: 아직 도착하지 않은 편지(403 NOT_ARRIVED)와 없는 편지(404)는 안내 문구만,
 * 그 밖의 실패(네트워크 등)는 "다시 시도"가 있는 에러 화면이다.
 * 가정:
 *  - 내가 받은 편지이고 아직 열지 않았으면(direction이 received, is_read가 false) 5-8, 그 밖에는 5-9로 연다. 5-8에서 "봉투 열기"를 누르면 서버가 읽음 처리하고(POST open) 5-9로 바꾼다.
 *  - 5-8에서 열기에 성공한 직후, 안 읽은 받은 답장(is_first가 false)이면 「첫 왕복」 우표(GET /api/stamps/first-roundtrip/)를 확인해 이 답장이 완성한 왕복이면 5-12로 간다(보상은 GET /api/stamps/rewards/의 unlocked && !seen). 서버가 받는 쪽에 "새로 받음"을 알려 주지 않아 granted_with·granted_at으로 추론한다(허용 오차 stampRewardMapper.ROUND_TRIP_TOLERANCE_MS). 시안의 "열기 → 5-12" 순서는 이 위치로 가정했다. 확인이 실패하면 조용히 5-9로 연다. 5-12의 "확인"은 이 편지로 돌아온다.
 *  - "나중에 읽을래요"는 읽음 처리 없이 한 칸 뒤로 돌아가 보던 탭에 머문다(주소로 바로 들어왔으면 /mailbox). 편지는 빨간 점이 유지된 채 새 편지 탭에 남는다.
 *  - 열어서 읽기만 한 편지는 새 편지 탭에 남되 빨간 점이 사라진다(서버가 읽음을 반영한 목록을 준다).
 *  - "넘기기"(POST pass)는 보관으로 옮기고 토스트("보관함으로 옮겼어요")를 보여 준 뒤 우체통의 보관 탭으로 이동한다. 토스트 문구는 시안에 없어서 정했다. 실패하면 서버 메시지를 토스트로 보여 준다.
 *  - "답장하기"는 /letter-write?letterId=…&nickname=…&region=… 로 이동한다(5-10, 5-11은 편지 쓰기 흐름을 그대로 쓴다). 편지를 대화 중으로 옮기는 것은 서버가 답장을 보낼 때 한다.
 *  - "답장하기"·"넘기기" 버튼은 서버가 준 can_reply·can_pass일 때만 보인다. 둘 다 없으면(보관한 편지 등) 읽기만 할 수 있다.
 *  - 오른쪽 위 "…"는 신고·차단 메뉴 시트를 연다. 내가 받은 편지에만 보인다(서버는 받은 편지만 신고를 받는다, api/safety.md).
 *    신고하기는 3-7과 같은 신고 시트(POST /api/reports/ target_type letter), 차단하기는 3-8과 같은 차단 팝업(POST /api/blocks/ 보낸 사람)이다.
 *    차단하면(신고와 함께 차단 포함) 이 편지가 더 보이지 않으므로 우체통으로 돌아간다. 차단 없이 신고만 하면 편지를 그대로 둔다(서버가 편지를 숨기지 않는다).
 *  - 시안의 "붙일 우표가 없나요? 만들고 바로 답장해요" 줄은 보류 기능(HOLD-02) 진입점이라 숨긴다(SHOW_STAMP_MAKE_ENTRY).
 * 개발 중 확인용 주소(VITE_API_MOCK=true일 때): /mailbox/101, /mailbox/102(읽지 않음 → 5-8), /mailbox/103, /mailbox/104(읽음 → 5-9)
 */
function LetterPage() {
  const { letterId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { openSheet, openDialog, showToast } = useOverlay()
  const [reloadKey, setReloadKey] = useState(0)
  // 불러온 결과. 어떤 편지·시도(key)로 받았는지 같이 둔다: 지금 key와 다르면 아직 불러오는 중이다.
  //   detail: 편지 상세, null이면 없는 편지. error: 불러오지 못한 이유(ApiError)
  const [result, setResult] = useState(null)
  // 봉투 열기·넘기기·답장하기는 서버 요청 하나가 끝날 때까지 다시 누를 수 없다(두 번 누르면 409로 오류 토스트가 덮였다).
  const busyRef = useRef(false)
  const [busy, setBusy] = useState(false)
  const guard = (action) => async () => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    try {
      await action()
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

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
      // 안 읽은 받은 답장이면 이 답장이 「첫 왕복」을 완성했는지 확인하고, 맞으면 5-12로 간다. 확인이 실패해도 편지 읽기는 막지 않는다(findRoundTripGain은 던지지 않는다).
      const gain = await findRoundTripGain(loaded?.detail?.roundTripProbe)
      if (gain) {
        // replace: 5-8 자리를 5-12로 바꾼다. 5-12의 "확인"이 returnTo(이 편지)로 replace 해서 돌아오면 이 편지는 읽힌 상태(5-9)로 다시 열린다.
        navigate('/mailbox/stamp-gained', { replace: true, state: { ...gain, returnTo: location.pathname } })
        return
      }
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

  // 차단하면 이 편지와 보낸 사람의 편지가 보이지 않으므로 우체통으로 돌아간다.
  const leaveAfterBlock = (message) => {
    navigate(MAILBOX_PATH, { replace: true })
    showToast(message)
  }

  const openReport = (sender) =>
    openSheet({
      title: '어떤 점이 불편했나요?',
      content: ({ close: closeLayer }) => (
        <ReportForm
          nickname={sender.nickname}
          description="신고 내용은 운영진이 확인해요"
          onSubmit={({ reason, details, block }) => reportLetter({ letterId, reason, details, block })}
          close={closeLayer}
          onDone={(report) => {
            if (report?.blocked) leaveAfterBlock('신고를 접수하고 차단했어요')
            else showToast('신고를 접수했어요')
          }}
          demoNote={isApiDemo ? '개발용 미리보기 · 실제 운영진에게 전송되지 않아요' : undefined}
        />
      ),
    })

  const openBlock = (sender) =>
    openDialog({
      label: `${sender.nickname}님 차단 확인`,
      content: ({ close: closeLayer }) => (
        <BlockDialog
          nickname={sender.nickname}
          onConfirm={() => blockLetterSender(sender.id)}
          close={closeLayer}
          onDone={() => leaveAfterBlock('차단했어요')}
          demoNote={isApiDemo ? '개발용 차단 · 서버에는 저장되지 않아요' : undefined}
        />
      ),
    })

  const openMenu = (sender) =>
    openSheet({
      content: (
        <LetterMenuSheet onSelect={(key) => (key === 'report' ? openReport(sender) : openBlock(sender))} />
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
        <LetterArrival arrival={detail.arrival} onOpen={guard(handleOpen)} onLater={handleLater} />
      </main>
    )
  }

  const { canReply, canPass } = detail.view
  // 신고·차단은 내가 받은 편지에서만 한다(보낸 사람 id가 있어야 차단할 수 있다)
  const canModerate = detail.isReceived && detail.sender.id != null

  return (
    <main className="letter-page">
      <Header
        title="편지"
        right={
          canModerate && (
            <button type="button" className="letter-page__more" aria-label="더보기" onClick={() => openMenu(detail.sender)}>
              <Icon name="more" />
            </button>
          )
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
              <Button variant="ghost" className="letter-page__pass" onClick={guard(handlePass)} disabled={busy}>
                넘기기
              </Button>
            )}
            {canReply && <Button onClick={guard(handleReply)} disabled={busy}>답장하기</Button>}
          </div>
          {canPass && <p className="letter-page__hint">넘겨도 상대에게 알림이 가지 않아요</p>}
        </footer>
      )}
    </main>
  )
}

export default LetterPage
