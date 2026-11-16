import StepLayout from '../../app/layouts/StepLayout.jsx'
import StepFooter from '../../components/letter-write/StepFooter.jsx'
import PaperPreview from '../../components/letter-write/PaperPreview.jsx'
import useStepNavigation from '../../components/letter-write/useStepNavigation.js'
import useLetterDraft from '../../components/letter-write/useLetterDraft.js'
import useLetterMaterials, { findMaterial } from '../../components/letter-write/useLetterMaterials.js'
import useReplyDiary, { firstLineOf } from '../../components/letter-write/useReplyDiary.js'
import { LETTER_STEP_LABELS } from '../../components/letter-write/steps.js'
import { isLetterReply, letterWriteTitle } from '../../components/letter-write/replyTitle.js'
import { PAPERS } from '../../components/letter-write/data.js'
import Icon from '../../shared/ui/Icon.jsx'
import './PaperPage.css'

/** 4-1 편지지 선택 */
function PaperPage() {
  const { goNext, goBack } = useStepNavigation(1)
  const { draft, updateDraft } = useLetterDraft()
  const { reply } = draft
  // 잠금·새 편지지 표시는 서버 값을 따른다. 서버 값을 아직 못 받았으면 우표가 필요한 편지지는 잠가 두고 NEW는 표시하지 않는다.
  const { materials } = useLetterMaterials()
  // 답장하는 일기: 배너에 일기 작성자 닉네임과 본문 첫 줄을 서버에서 받은 값으로 보여 준다.
  const { diary } = useReplyDiary(reply.diaryId)
  const nickname = diary?.author.nickname ?? reply.nickname
  // 받은 편지에 답장(5-10): 일기 대신 받은 편지가 대상이다. 첫 줄은 우체통이 쿼리(preview)로 넘겨 준다.
  const letterReply = isLetterReply(reply)
  const bannerTitle = letterReply ? `Re. ${nickname}님의 편지` : `Re. ${nickname}님의 고향 일기`
  const excerpt = letterReply ? (reply.preview ?? '') : firstLineOf(diary?.body)

  return (
    <StepLayout
      title={letterWriteTitle(reply)}
      steps={LETTER_STEP_LABELS}
      current={1}
      onBack={goBack}
      footer={<StepFooter onNext={goNext} />}
    >
      {/* 일기나 받은 편지에 답장할 때만 무엇에 답장하는지 알려 준다. */}
      {(reply.diaryId || letterReply) && (
        <div className="paper-page__reply">
          <Icon name="letter" className="paper-page__reply-icon" />
          <div className="paper-page__reply-text">
            <p className="paper-page__reply-title">{bannerTitle}</p>
            {excerpt && <p className="paper-page__reply-excerpt">{excerpt}</p>}
          </div>
        </div>
      )}

      <h2 className="paper-page__heading">편지지를 골라주세요</h2>

      <ul className="paper-page__grid">
        {PAPERS.map((paper) => {
          const server = findMaterial(materials?.stationeries, paper.code)
          const locked = server ? !server.unlocked : Boolean(paper.lockedStamps)
          const badge = server?.is_new ? 'NEW' : null
          const lockLabel = server?.unlock_condition ?? `우표 ${paper.lockedStamps}개`
          const selected = draft.paperId === paper.id
          return (
            <li key={paper.id}>
              <button
                type="button"
                className={`paper-card paper-card--${paper.id}${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}`}
                aria-pressed={selected}
                aria-disabled={locked}
                onClick={() => !locked && updateDraft({ paperId: paper.id })}
              >
                <PaperPreview paperId={paper.id} />
                <span className="paper-card__name">{paper.name}</span>
                {badge && !locked && <span className="paper-card__badge">{badge}</span>}
                {locked && <span className="paper-card__badge paper-card__badge--stamps">{lockLabel}</span>}
                {selected && (
                  <span className="paper-card__check">
                    <Icon name="check" size={16} />
                  </span>
                )}
                {locked && (
                  <>
                    <span className="paper-card__cover" />
                    <span className="paper-card__lock">
                      <Icon name="lock" size={20} />
                    </span>
                  </>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {/* 개발 중에만 보인다(배포 빌드에는 들어가지 않는다): 잠긴 금박 엽서를 골라 바로 편지 쓰기 화면에서 확인한다. */}
      {import.meta.env.DEV && (
        <button
          type="button"
          className="paper-page__dev"
          onClick={() => {
            updateDraft({ paperId: 'gold' })
            goNext()
          }}
        >
          금박 편지지 확인하기
        </button>
      )}
    </StepLayout>
  )
}

export default PaperPage
