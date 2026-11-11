import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StepLayout from '../../app/layouts/StepLayout.jsx'
import StepFooter from '../../components/letter-write/StepFooter.jsx'
import StampSheet from '../../components/letter-write/StampSheet.jsx'
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
import './StampPage.css'

/**
 * 4-6 우표 고르고 보내기, 4-7 우표가 1장일 때.
 * 화면에는 쓴 편지를 보여 주고, 들어오면 "편지를 보낼까요?" 바텀시트가 바로 열린다.
 * "다시 보기"로 시트를 닫으면 편지를 볼 수 있고, 아래 버튼으로 다시 시트를 연다.
 */
function StampPage() {
  const navigate = useNavigate()
  const { goBack } = useStepNavigation(4)
  const { draft, updateDraft } = useLetterDraft()
  const { openSheet, showToast, close } = useOverlay()
  const { reply, content, fontId } = draft

  const recipient = reply.nickname ?? '고향 친구'
  const firstLine = content.split('\n').find((line) => line.trim() !== '') ?? ''

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
          onAdd={() => showToast('우표 만들기는 준비 중이에요')}
          onGame={() => showToast('직접 배달하기는 준비 중이에요')}
          onSend={(stampId) => {
            // TODO: 편지 보내기 API가 정해지면 여기서 보내고 받은 편지 번호(letterId)로 이동한다.
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
      {/* 쓴 편지 미리보기: 받는 사람과 본문 첫 줄 */}
      <div className="stamp-page__letter">
        <div className="stamp-page__card" />
        <p className="stamp-page__to" style={{ fontFamily: getLetterFontFamily(fontId) }}>
          To. {recipient}
        </p>
        {firstLine && (
          <p className="stamp-page__excerpt" style={{ fontFamily: getLetterFontFamily(fontId) }}>
            {firstLine}
          </p>
        )}
      </div>
    </StepLayout>
  )
}

export default StampPage
