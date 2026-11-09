import Icon from '../../shared/ui/Icon.jsx'
import { PEN_COLORS } from './data.js'
import './SignatureTools.css'

/**
 * 손글씨 도구(시안 4-4): 펜 · 지우개 · 되돌리기, 그리고 펜 색.
 * @param {'pen'|'eraser'} tool 지금 고른 도구
 * @param {(tool: 'pen'|'eraser') => void} onToolChange
 * @param {() => void} onUndo 되돌리기(마지막 선·스티커 하나를 지운다)
 * @param {boolean} canUndo 되돌릴 것이 있는지
 * @param {string} colorId 지금 고른 펜 색
 * @param {(id: string) => void} onColorChange
 */
function SignatureTools({ tool, onToolChange, onUndo, canUndo, colorId, onColorChange }) {
  return (
    <div className="signature-tools">
      <div className="signature-tools__row">
        <button
          type="button"
          className="signature-tools__tool"
          aria-pressed={tool === 'pen'}
          onClick={() => onToolChange('pen')}
        >
          <span className={`signature-tools__circle${tool === 'pen' ? ' is-active' : ''}`}>
            <Icon name="pencil" />
          </span>
          <span className="signature-tools__label">펜</span>
        </button>

        <button
          type="button"
          className="signature-tools__tool"
          aria-pressed={tool === 'eraser'}
          onClick={() => onToolChange('eraser')}
        >
          <span className={`signature-tools__circle${tool === 'eraser' ? ' is-active' : ''}`}>
            <Icon name="eraser" />
          </span>
          <span className="signature-tools__label">지우개</span>
        </button>

        <button type="button" className="signature-tools__tool" disabled={!canUndo} onClick={onUndo}>
          <span className="signature-tools__circle">
            <Icon name="undo" />
          </span>
          <span className="signature-tools__label">되돌리기</span>
        </button>
      </div>

      <div className="signature-tools__colors" role="radiogroup" aria-label="펜 색">
        {PEN_COLORS.map((color) => (
          <button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={colorId === color.id}
            aria-label={color.label}
            className={`signature-tools__color${colorId === color.id ? ' is-selected' : ''}`}
            style={{ '--dot': `var(${color.token})` }}
            onClick={() => {
              onColorChange(color.id)
              onToolChange('pen')
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default SignatureTools
