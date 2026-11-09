import StepLayout from '../../app/layouts/StepLayout.jsx'
import StepFooter from '../../components/letter-write/StepFooter.jsx'
import PaperPreview from '../../components/letter-write/PaperPreview.jsx'
import useStepNavigation from '../../components/letter-write/useStepNavigation.js'
import useLetterDraft from '../../components/letter-write/useLetterDraft.js'
import { LETTER_STEP_LABELS } from '../../components/letter-write/steps.js'
import { PAPERS, MOCK_STAMP_COUNT, MOCK_DIARY_EXCERPT } from '../../components/letter-write/data.js'
import Icon from '../../shared/ui/Icon.jsx'
import './PaperPage.css'

/** 4-1 편지지 선택 */
function PaperPage() {
  const { goNext, goBack } = useStepNavigation(1)
  const { draft, updateDraft } = useLetterDraft()
  const { reply } = draft

  return (
    <StepLayout
      title="편지 쓰기"
      steps={LETTER_STEP_LABELS}
      current={1}
      onBack={goBack}
      footer={<StepFooter onNext={goNext} />}
    >
      {/* 일기에 답장할 때만 어떤 일기인지 알려 준다. */}
      {reply.diaryId && (
        <div className="paper-page__reply">
          <Icon name="letter" className="paper-page__reply-icon" />
          <div className="paper-page__reply-text">
            <p className="paper-page__reply-title">Re. {reply.nickname}님의 고향 일기</p>
            {/* mock: 일기 데이터가 연결되면 일기 본문 앞부분으로 바꾼다. */}
            <p className="paper-page__reply-excerpt">{MOCK_DIARY_EXCERPT}</p>
          </div>
        </div>
      )}

      <h2 className="paper-page__heading">편지지를 골라주세요</h2>

      <ul className="paper-page__grid">
        {PAPERS.map((paper) => {
          const locked = paper.lockedStamps > MOCK_STAMP_COUNT
          const selected = draft.paperId === paper.id
          return (
            <li key={paper.id}>
              <button
                type="button"
                className={`paper-card${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}`}
                aria-pressed={selected}
                aria-disabled={locked}
                onClick={() => !locked && updateDraft({ paperId: paper.id })}
              >
                <PaperPreview paperId={paper.id} />
                <span className="paper-card__name">{paper.name}</span>
                {paper.badge && <span className="paper-card__badge">{paper.badge}</span>}
                {locked && (
                  <span className="paper-card__badge paper-card__badge--stamps">
                    우표 {paper.lockedStamps}개
                  </span>
                )}
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
    </StepLayout>
  )
}

export default PaperPage
