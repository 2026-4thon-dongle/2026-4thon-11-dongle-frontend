import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StepLayout from '../../app/layouts/StepLayout.jsx'
import StepFooter from '../../components/letter-write/StepFooter.jsx'
import StampSheet from '../../components/letter-write/StampSheet.jsx'
import LetterResult from '../../components/letter-write/LetterResult.jsx'
import useStepNavigation from '../../components/letter-write/useStepNavigation.js'
import { clearLetterDraft } from '../../components/letter-write/letterDraftStorage.js'
import useLetterDraft from '../../components/letter-write/useLetterDraft.js'
import { LETTER_STEP_LABELS } from '../../components/letter-write/steps.js'
import {
  MOCK_ARRIVAL,
  MOCK_LETTER_ID,
  MOCK_MY_REGION,
  MOCK_RECEIVER_REGION,
} from '../../components/letter-write/data.js'
import { getLetterFontFamily, loadLetterFont } from '../../shared/fonts/letterFonts.js'
import { MOCK_OWNED_STAMPS } from '../../shared/mocks/stamps.js'
import useOverlay from '../../shared/hooks/useOverlay.js'

/**
 * 4-6 우표 고르고 보내기, 4-7 우표가 1장일 때.
 * 화면에는 쓴 편지의 완성본(편지지·본문·서명)을 보여 주고, 들어오면 "편지를 보낼까요?" 바텀시트가 바로 열린다.
 * "다시 보기"로 시트를 닫으면 편지를 볼 수 있고, 아래 버튼으로 다시 시트를 연다.
 * 시트에서 우표를 고르면 편지 오른쪽 위에 바로 붙어 보인다.
 */
function StampPage() {
  const navigate = useNavigate()
  const { goBack } = useStepNavigation(4)
  const { draft, updateDraft } = useLetterDraft()
  const { openSheet, showToast, close } = useOverlay()
  const { reply, content, fontId, paperId, signature } = draft

  const recipient = reply.nickname ?? '고향 친구'
  // 편지에 붙여 보여 주는 우표: 시트에서 고른 우표, 아직 안 골랐으면 시트가 처음 골라 두는 첫 우표
  const previewStampId = draft.stampId ?? MOCK_OWNED_STAMPS[0]?.id

  useEffect(() => {
    loadLetterFont(fontId)
  }, [fontId])

  const openStampSheet = () =>
    openSheet({
      title: '편지를 보낼까요?',
      content: (
        <StampSheet
          stamps={MOCK_OWNED_STAMPS}
          selectedId={draft.stampId ?? undefined}
          from={MOCK_MY_REGION}
          to={reply.region ?? MOCK_RECEIVER_REGION}
          arrival={MOCK_ARRIVAL}
          onReview={close}
          onSelect={(stampId) => updateDraft({ stampId })}
          onAdd={() => showToast('우표 만들기는 준비 중이에요')}
          onGame={() => showToast('직접 배달하기는 준비 중이에요')}
          onSend={(stampId) => {
            // TODO: 편지 보내기 API(POST /api/letters/, multipart)를 연결하면 여기서 보내고 받은 편지 번호(letterId)로 이동한다.
            //   서명 PNG와 스티커 JSON은 buildSignatureParts(signature.ops)로 만든다(letterPayload.js).
            updateDraft({ stampId })
            clearLetterDraft(reply) // 보낸 편지는 임시저장에서 지운다.
            close()
            navigate(`/delivery/${MOCK_LETTER_ID}/sending`, { state: { stampId } })
          }}
        />
      ),
    })

  // 들어오면 시트를 바로 연다. 시트를 닫은 뒤에는 다시 열지 않는다.
  useEffect(() => {
    openStampSheet()
    // 처음 한 번만 연다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <StepLayout
      title="편지 쓰기"
      steps={LETTER_STEP_LABELS}
      current={4}
      onBack={goBack}
      footer={<StepFooter onNext={openStampSheet} nextLabel="우표 고르기" />}
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
