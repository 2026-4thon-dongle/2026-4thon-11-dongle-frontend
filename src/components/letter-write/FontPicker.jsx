import { useEffect, useState } from 'react'
import Dropdown from '../../shared/ui/Dropdown.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import {
  LETTER_FONTS,
  LOCKED_LETTER_FONTS,
  LETTER_FONT_SAMPLE,
  getLetterFont,
  getLetterFontFamily,
  loadLetterFont,
} from '../../shared/fonts/letterFonts.js'
import { fontCodeOf, fontIdOf } from './data.js'
import useLetterMaterials, { findMaterial } from './useLetterMaterials.js'
import './FontPicker.css'

/**
 * 글씨체 고르기(시안 4-2 닫힌 모습, 4-3 열린 모습).
 * 열면 화면이 어두워지고, 드롭다운 바로 위에 글씨체 목록이 뜬다. 목록의 글씨체는 열 때 불러온다.
 * @param {string} fontId 지금 고른 글씨체 id
 * @param {(fontId: string) => void} onChange
 */
function FontPicker({ fontId, onChange }) {
  const [open, setOpen] = useState(false)
  const current = getLetterFont(fontId)

  // 잠금은 서버 값을 따른다. 서버에서 못 받았으면(서버 없이 화면만 볼 때) 기존 mock 목록을 쓴다.
  const { materials } = useLetterMaterials()
  const isLocked = (font) => {
    const server = findMaterial(materials?.fonts, fontCodeOf(font.id))
    return server ? !server.unlocked : false
  }
  const fonts = LETTER_FONTS.filter((font) => !isLocked(font))
  const lockedFonts = materials
    ? materials.fonts
        .filter((font) => !font.unlocked)
        .map((font) => ({ id: fontIdOf(font.code), name: font.name, condition: font.unlock_condition }))
    : LOCKED_LETTER_FONTS.map((font) => ({ id: font.id, name: font.name, condition: `우표 ${font.unlockCondition.count}개` }))

  // 목록에서 모든 글씨체를 미리보기로 보여 주므로, 열 때 파일을 받는다.
  useEffect(() => {
    if (open) fonts.forEach((font) => loadLetterFont(font.id))
    // fonts는 렌더마다 새로 만들어지므로 목록이 바뀌는 때(서버 응답)만 따른다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, materials])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const choose = (id) => {
    onChange(id)
    setOpen(false)
  }

  return (
    <div className={`font-picker${open ? ' is-open' : ''}`}>
      {open && (
        <>
          <button
            type="button"
            className="font-picker__dim"
            aria-label="글씨체 목록 닫기"
            onClick={() => setOpen(false)}
          />
          <div className="font-picker__panel" role="listbox" aria-label="글씨체">
            {fonts.map((font) => {
              const selected = font.id === fontId
              return (
                <button
                  key={font.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`font-picker__item${selected ? ' is-selected' : ''}`}
                  onClick={() => choose(font.id)}
                >
                  <span className="font-picker__item-text">
                    <span className="font-picker__item-name">{font.name}</span>
                    <span
                      className="font-picker__item-sample"
                      style={{ fontFamily: getLetterFontFamily(font.id), fontSize: font.sampleSize }}
                    >
                      {LETTER_FONT_SAMPLE}
                    </span>
                  </span>
                  {selected && <Icon name="check" size={18} className="font-picker__item-check" />}
                </button>
              )
            })}

            {/* 잠긴 글씨체: 우표를 모으면 열린다. 해제 조건 문구는 서버가 준다. */}
            {lockedFonts.map((font) => (
              <div key={font.id} className="font-picker__locked">
                <Icon name="lock" size={16} />
                <span>
                  {font.name} · {font.condition} 모으면 열려요
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <Dropdown
        label="글씨체"
        value={current.name}
        valueStyle={{ fontFamily: getLetterFontFamily(fontId) }}
        expanded={open}
        onClick={() => setOpen((value) => !value)}
      />
    </div>
  )
}

export default FontPicker
