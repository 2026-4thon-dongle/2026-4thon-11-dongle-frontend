import { useEffect, useState } from 'react'
import StepLayout from '../../app/layouts/StepLayout.jsx'
import StepFooter from '../../components/letter-write/StepFooter.jsx'
import SignaturePad from '../../components/letter-write/SignaturePad.jsx'
import SignatureTools from '../../components/letter-write/SignatureTools.jsx'
import StickerDrawer from '../../components/letter-write/StickerDrawer.jsx'
import SegmentTabs from '../../components/letter-write/SegmentTabs.jsx'
import useStepNavigation from '../../components/letter-write/useStepNavigation.js'
import useLetterDraft from '../../components/letter-write/useLetterDraft.js'
import { LETTER_STEP_LABELS } from '../../components/letter-write/steps.js'
import { letterWriteTitle } from '../../components/letter-write/replyTitle.js'
import {
  STICKER_SIZE,
  STICKER_TILT,
  defaultPenColorId,
  isDarkPaper,
  penColorsFor,
} from '../../components/letter-write/data.js'
import './SignaturePage.css'

const TABS = [
  { id: 'draw', label: '손글씨' },
  { id: 'sticker', label: '스티커' },
]

/** 4-4 손글씨 서명, 4-5 스티커 붙이기 */
function SignaturePage() {
  const { goNext, goBack } = useStepNavigation(3)
  const { draft, updateDraft } = useLetterDraft()
  const [tab, setTab] = useState('draw')
  const [tool, setTool] = useState('pen')
  // 어두운 편지지는 기본 펜 색이 흰색이다.
  const [colorId, setColorId] = useState(() => defaultPenColorId(draft.paperId))
  const [selectedId, setSelectedId] = useState(null) // 조정 중인 스티커

  const { ops } = draft.signature
  const setOps = (next) => updateDraft({ signature: { ops: next } })
  const hasSticker = ops.some((op) => op.type === 'sticker')

  // 어두운 편지지에서 흰색으로 쓴 서명이 밝은 편지지로 바꾼 뒤에 안 보이지 않게, 이 화면에 들어올 때 갈색으로 바꾼다.
  useEffect(() => {
    if (!isDarkPaper(draft.paperId) && ops.some((op) => op.color === 'white')) {
      setOps(ops.map((op) => (op.color === 'white' ? { ...op, color: 'brown' } : op)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 들어올 때 한 번만 맞춘다.
  }, [])

  const removeSticker = (id) => {
    setOps(ops.filter((op) => !(op.type === 'sticker' && op.id === id)))
    setSelectedId(null)
  }

  const changeTab = (next) => {
    setTab(next)
    setSelectedId(null)
  }

  // 스티커는 그림판 오른쪽 아래에 붙이고, 여러 장이면 왼쪽으로 조금씩 비켜 놓는다.
  const addSticker = (sticker) => {
    const count = ops.filter((op) => op.type === 'sticker').length
    setOps([
      ...ops,
      {
        type: 'sticker',
        id: `${sticker.id}-${Date.now()}`,
        pose: sticker.pose,
        x: 0.8 - (count % 5) * 0.12,
        y: 0.76,
        size: STICKER_SIZE.initial,
        rotate: STICKER_TILT.initial,
      },
    ])
  }

  return (
    <StepLayout
      title={letterWriteTitle(draft.reply)}
      steps={LETTER_STEP_LABELS}
      current={3}
      onBack={goBack}
      footer={<StepFooter onNext={goNext} onSkip={goNext} />}
    >
      <h2 className="signature-page__title">
        마지막 인사는
        <br />
        직접 써볼까요?
      </h2>
      <p className="signature-page__hint">손가락으로 서명이나 그림을 남겨요 (선택)</p>

      <SignaturePad
        ops={ops}
        onOpsChange={setOps}
        tool={tool}
        colorId={colorId}
        mode={tab === 'draw' ? 'draw' : 'sticker'}
        paperId={draft.paperId}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRemove={removeSticker}
      />

      <div className="signature-page__tabs">
        <SegmentTabs label="서명 방법" options={TABS} value={tab} onChange={changeTab} />
      </div>

      {tab === 'draw' ? (
        <div className="signature-page__panel signature-page__panel--tools">
          <SignatureTools
            tool={tool}
            onToolChange={setTool}
            onUndo={() => setOps(ops.slice(0, -1))}
            canUndo={ops.length > 0}
            colorId={colorId}
            onColorChange={setColorId}
            colors={penColorsFor(draft.paperId)}
          />
        </div>
      ) : (
        <div className="signature-page__panel">
          <StickerDrawer onPick={addSticker} />
          <p className="signature-page__sticker-hint">
            {hasSticker
              ? '붙인 스티커를 눌러 ✕로 지우고, 모서리를 끌어 크기·각도를 바꿔요'
              : '붙인 스티커는 끌어서 옮기고, 눌러서 크기·각도를 바꾸거나 지울 수 있어요'}
          </p>
        </div>
      )}
    </StepLayout>
  )
}

export default SignaturePage
