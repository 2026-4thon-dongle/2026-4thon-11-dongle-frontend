import { useState } from 'react'
import StepLayout from '../../app/layouts/StepLayout.jsx'
import StepFooter from '../../components/letter-write/StepFooter.jsx'
import SignaturePad from '../../components/letter-write/SignaturePad.jsx'
import SignatureTools from '../../components/letter-write/SignatureTools.jsx'
import StickerDrawer from '../../components/letter-write/StickerDrawer.jsx'
import SegmentTabs from '../../components/letter-write/SegmentTabs.jsx'
import useStepNavigation from '../../components/letter-write/useStepNavigation.js'
import useLetterDraft from '../../components/letter-write/useLetterDraft.js'
import { LETTER_STEP_LABELS } from '../../components/letter-write/steps.js'
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
  const [colorId, setColorId] = useState('brown')

  const { ops } = draft.signature
  const setOps = (next) => updateDraft({ signature: { ops: next } })

  // 스티커는 그림판 오른쪽 아래에 붙이고, 여러 장이면 왼쪽으로 조금씩 비켜 놓는다.
  const addSticker = (sticker) => {
    const count = ops.filter((op) => op.type === 'sticker').length
    setOps([
      ...ops,
      { type: 'sticker', id: `${sticker.id}-${Date.now()}`, pose: sticker.pose, x: 0.8 - (count % 5) * 0.12, y: 0.76 },
    ])
  }

  return (
    <StepLayout
      title="편지 쓰기"
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
      />

      <div className="signature-page__tabs">
        <SegmentTabs label="서명 방법" options={TABS} value={tab} onChange={setTab} />
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
          />
        </div>
      ) : (
        <div className="signature-page__panel">
          {/* mock: 스티커를 얻은 조건은 우표 보상 데이터가 연결되면 실제 값으로 바꾼다. */}
          <StickerDrawer onPick={addSticker} reward="우표 3개 보상" />
        </div>
      )}
    </StepLayout>
  )
}

export default SignaturePage
