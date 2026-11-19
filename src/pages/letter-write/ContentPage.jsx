import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StepLayout from '../../app/layouts/StepLayout.jsx'
import StepFooter from '../../components/letter-write/StepFooter.jsx'
import LetterCard from '../../components/letter-write/LetterCard.jsx'
import FontPicker from '../../components/letter-write/FontPicker.jsx'
import { detectContactTypes } from '../../components/letter-write/detectPrivateInfo.js'
import useStepNavigation from '../../components/letter-write/useStepNavigation.js'
import useLetterDraft from '../../components/letter-write/useLetterDraft.js'
import { LETTER_STEP_LABELS } from '../../components/letter-write/steps.js'
import { isLetterReply, letterWriteTitle } from '../../components/letter-write/replyTitle.js'
import { MAX_CONTENT_LENGTH } from '../../components/letter-write/data.js'
import { getLetterFontFamily, loadLetterFont } from '../../shared/fonts/letterFonts.js'
import Icon from '../../shared/ui/Icon.jsx'
import './ContentPage.css'

/** 4-2 본문 쓰기, 4-3 글씨체 고르기 */
function ContentPage() {
  const { goNext, goBack } = useStepNavigation(2)
  const { draft, updateDraft } = useLetterDraft()
  const navigate = useNavigate()
  const location = useLocation()

  // 고른 글씨체는 본문에 쓰이므로 이 화면에 들어올 때 불러온다.
  useEffect(() => loadLetterFont(draft.fontId), [draft.fontId])

  // 받는 사람: 답장하는 상대 닉네임. 쿼리 없이 들어온 경우만 임시 문구를 쓴다.
  const recipient = draft.reply.nickname ?? '고향 친구'
  // 전화번호는 전화번호 문구, 이메일·카카오톡·인스타그램은 「연락처」 문구로 알린다.
  const contacts = detectContactTypes(draft.content)
  const warn = contacts.length === 0 ? '' : contacts.includes('phone') ? '전화번호처럼 보이는 내용이 있어요' : '연락처처럼 보이는 내용이 있어요'
  // 받은 편지에 답장할 때(5-11)만 받은 편지를 다시 볼 수 있다.
  const letterId = isLetterReply(draft.reply) ? draft.reply.letterId : null

  // 받은 편지를 보러 갔다가 돌아와도 쓰던 내용이 남도록, 지금 주소의 history 기록에 작성 상태를 실어 둔다.
  // 돌아오면 LetterDraftProvider가 이 상태(resumeDraft)로 시작한다.
  const viewReceivedLetter = () => {
    navigate(`${location.pathname}${location.search}`, { replace: true, state: { resumeDraft: draft } })
    navigate(`/mailbox/${letterId}`)
  }

  return (
    <StepLayout
      title={letterWriteTitle(draft.reply)}
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

      {/* 연락처처럼 보이는 내용이 있으면 알려 준다. 막지는 않는다. */}
      {warn && (
        <p className="content-page__warning" role="alert">
          {warn}
        </p>
      )}

      {/* 오류 안내가 있으면 그 아래에 둔다. */}
      {letterId && (
        <button type="button" className="content-page__view-letter" onClick={viewReceivedLetter}>
          <Icon name="letter" size={22} />
          <span className="content-page__view-letter-text">
            {draft.reply.nickname ?? '상대'}님 편지 다시 보기
          </span>
          <Icon name="chevron" size={20} />
        </button>
      )}
    </StepLayout>
  )
}

export default ContentPage
