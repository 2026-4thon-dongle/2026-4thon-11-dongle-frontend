import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepLayout from '../../app/layouts/StepLayout.jsx'
import StepFooter from '../../components/letter-write/StepFooter.jsx'
import StampSheet from '../../components/letter-write/StampSheet.jsx'
import LetterResult from '../../components/letter-write/LetterResult.jsx'
import useStepNavigation from '../../components/letter-write/useStepNavigation.js'
import { clearLetterDraft } from '../../components/letter-write/letterDraftStorage.js'
import { sendLetter } from '../../components/letter-write/letterApi.js'
import { buildSignatureParts } from '../../components/letter-write/letterPayload.js'
import { loadSendInfo } from '../../components/letter-write/sendInfo.js'
import useLetterDraft from '../../components/letter-write/useLetterDraft.js'
import { LETTER_STEP_LABELS } from '../../components/letter-write/steps.js'
import { fontCodeOf, paperCodeOf } from '../../components/letter-write/data.js'
import { getLetterFontFamily, loadLetterFont } from '../../shared/fonts/letterFonts.js'
import useOverlay from '../../shared/hooks/useOverlay.js'

/**
 * 4-6 우표 고르고 보내기, 4-7 우표가 1장일 때.
 * 화면에는 쓴 편지의 완성본(편지지·본문·서명)을 보여 주고, 서버에서 우표·도착 시간을 받으면 "편지를 보낼까요?" 바텀시트가 열린다.
 * "다시 보기"로 시트를 닫으면 편지를 볼 수 있고, 아래 버튼으로 다시 시트를 연다.
 * 시트에서 우표를 고르면 편지 오른쪽 위에 바로 붙어 보인다.
 * 명세: api/letters.md의 GET /api/letters/materials/, GET /api/letters/estimate/, POST /api/letters/
 */
function StampPage() {
  const navigate = useNavigate()
  const { goBack } = useStepNavigation(4)
  const { draft, updateDraft } = useLetterDraft()
  const { openSheet, showToast, close } = useOverlay()
  const { reply, content, fontId, paperId, signature } = draft

  const recipient = reply.nickname ?? '고향 친구'
  // 서버에서 받은 우표·지역·도착 시간. 받기 전에는 null이다.
  const [info, setInfo] = useState(null)
  // 보내는 중에 보내기를 또 누르지 못하게 한다(보낸 편지는 취소할 수 없다).
  const sendingRef = useRef(false)
  // 편지에 붙여 보여 주는 우표: 시트에서 고른 우표, 아직 안 골랐으면 시트가 처음 골라 두는 첫 우표
  const previewStampId = draft.stampId ?? info?.stamps[0]?.id ?? null

  useEffect(() => {
    loadLetterFont(fontId)
  }, [fontId])

  // 첫 편지는 diary_id, 받은 편지에 대한 답장은 reply_to로 보낸다.
  const diaryId = reply.diaryId ? Number(reply.diaryId) : null
  const replyTo = reply.letterId ? Number(reply.letterId) : null

  const send = async (stampId) => {
    if (sendingRef.current) return
    sendingRef.current = true
    try {
      const { signature: signatureFile, stickers } = await buildSignatureParts(signature.ops)
      const letter = await sendLetter({
        diaryId,
        replyTo,
        body: content,
        stationery: paperCodeOf(paperId),
        font: fontCodeOf(fontId),
        stamp: stampId,
        signature: signatureFile,
        stickers,
        draftId: draft.draftId,
      })
      updateDraft({ stampId })
      // 이어 쓴 임시저장은 서버가 지운다. 그 밖에 이 대상에 남은 임시저장이 있으면 지운다.
      if (!draft.draftId) clearLetterDraft(reply)
      close()
      navigate(`/delivery/${letter.id}/sending`, { state: { stampId, letter } })
    } catch (error) {
      showToast(error.message)
    } finally {
      sendingRef.current = false
    }
  }

  const openStampSheet = (sheetInfo) =>
    openSheet({
      title: '편지를 보낼까요?',
      content: (
        <StampSheet
          stamps={sheetInfo.stamps}
          selectedId={draft.stampId ?? undefined}
          from={sheetInfo.from}
          to={sheetInfo.to}
          arrival={sheetInfo.arrival}
          onReview={close}
          onSelect={(stampId) => updateDraft({ stampId })}
          onAdd={() => showToast('우표 만들기는 준비 중이에요')}
          onGame={() => showToast('직접 배달하기는 준비 중이에요')}
          onSend={send}
        />
      ),
    })

  // 들어오면 서버에서 우표와 도착 시간을 받고 시트를 연다. 시트를 닫은 뒤에는 다시 열지 않는다.
  useEffect(() => {
    let cancelled = false
    loadSendInfo({ diaryId, replyTo }).then((loaded) => {
      if (cancelled) return
      setInfo(loaded)
      if (loaded.failed) showToast(loaded.failed.message)
      openStampSheet(loaded)
    })
    return () => {
      cancelled = true
    }
    // 처음 한 번만 받는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <StepLayout
      title="편지 쓰기"
      steps={LETTER_STEP_LABELS}
      current={4}
      onBack={goBack}
      footer={<StepFooter onNext={() => info && openStampSheet(info)} nextLabel="우표 고르기" />}
    >
      {/* 편지 완성본: 1 편지지 + 2 내용 + 3 서명을 합친 보내기 전 모습. 시트에서 우표를 고르면 오른쪽 위에 바로 붙는다. */}
      <LetterResult
        paperId={paperId}
        recipient={recipient}
        content={content}
        fontFamily={getLetterFontFamily(fontId)}
        signatureOps={signature.ops}
        stampId={previewStampId}
      />
    </StepLayout>
  )
}

export default StampPage
