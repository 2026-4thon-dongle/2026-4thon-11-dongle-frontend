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
const SHOW_STAMP_MAKE_ENTRY = false

function LetterPage() {
  const { letterId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { openSheet, openDialog, showToast } = useOverlay()
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState(null)
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

  const handleLater = () => {
    if (location.key !== 'default') navigate(-1)
    else navigate(MAILBOX_PATH, { replace: true })
  }

  const handleOpen = async () => {
    try {
      const opened = await openLetter(letterId)
      const gain = await findRoundTripGain(loaded?.detail?.roundTripProbe)
      if (gain) {
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

  const returnToMailbox = (message) => {
    navigate(MAILBOX_PATH, { replace: true })
    showToast(message)
  }

  const openReport = (sender) =>
    openSheet({
      title: '어떤 점이 불편했나요?',
      content: ({ close: closeLayer }) => (
        <ReportForm
          nickname={sender.nickname}
          description="신고하면 내 화면에서 바로 숨겨지고, 3건이 쌓이면 모두에게 숨겨진 뒤 운영진이 확인해요"
          onSubmit={({ reason, details, block }) => reportLetter({ letterId, reason, details, block })}
          close={closeLayer}
          onDone={(report) => {
            if (report?.blocked) returnToMailbox('신고를 접수하고 차단했어요')
            else returnToMailbox('신고를 접수하고 편지를 숨겼어요')
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
          onDone={() => returnToMailbox('차단했어요')}
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
