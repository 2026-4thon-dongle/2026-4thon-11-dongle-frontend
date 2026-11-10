import { useEffect } from 'react'
import StepLayout from '../../app/layouts/StepLayout.jsx'
import StepFooter from '../../components/letter-write/StepFooter.jsx'
import LetterCard from '../../components/letter-write/LetterCard.jsx'
import FontPicker from '../../components/letter-write/FontPicker.jsx'
import hasPhoneNumber from '../../components/letter-write/detectPrivateInfo.js'
import useStepNavigation from '../../components/letter-write/useStepNavigation.js'
import useLetterDraft from '../../components/letter-write/useLetterDraft.js'
import { LETTER_STEP_LABELS } from '../../components/letter-write/steps.js'
import { MAX_CONTENT_LENGTH } from '../../components/letter-write/data.js'
import { getLetterFontFamily, loadLetterFont } from '../../shared/fonts/letterFonts.js'
import './ContentPage.css'

/** 4-2 본문 쓰기, 4-3 글씨체 고르기 */
function ContentPage() {
  const { goNext, goBack } = useStepNavigation(2)
  const { draft, updateDraft } = useLetterDraft()

  // 고른 글씨체는 본문에 쓰이므로 이 화면에 들어올 때 불러온다.
  useEffect(() => loadLetterFont(draft.fontId), [draft.fontId])

  // 받는 사람: 일기에 답장하면 상대 닉네임, 아니면 고향 사람에게 띄우는 편지(가정: 문구는 임시)
  const recipient = draft.reply.nickname ?? '고향 친구'
  const warn = hasPhoneNumber(draft.content)

  return (
    <StepLayout
      title="편지 쓰기"
      steps={LETTER_STEP_LABELS}
      current={2}
      onBack={goBack}
      footer={<StepFooter onNext={goNext} nextDisabled={draft.content.trim() === ''} />}
    >
      <LetterCard
        paperId={draft.paperId}
        recipient={recipient}
        value={draft.content}
        onChange={(content) => updateDraft({ content })}
        fontFamily={getLetterFontFamily(draft.fontId)}
        maxLength={MAX_CONTENT_LENGTH}
      />

      <div className="content-page__font">
        <FontPicker fontId={draft.fontId} onChange={(fontId) => updateDraft({ fontId })} />
      </div>

      {/* 전화번호처럼 보이는 내용이 있으면 알려 준다. 막지는 않는다. */}
      {warn && (
        <p className="content-page__warning" role="alert">
          전화번호처럼 보이는 내용이 있어요
        </p>
      )}
    </StepLayout>
  )
}

export default ContentPage
