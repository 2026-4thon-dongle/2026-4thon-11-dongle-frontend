import Mascot from '../../shared/ui/Mascot.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import { STICKERS, STICKER_UNLOCK_STAMPS, MOCK_STAMP_COUNT } from './data.js'
import useLetterMaterials, { findMaterial } from './useLetterMaterials.js'
import './StickerDrawer.css'

/**
 * 스티커 서랍(시안 4-5). 스티커를 누르면 서명 그림판에 붙는다.
 * @param {(sticker: {id: string, pose: string}) => void} onPick
 * @param {string} reward 오른쪽에 보여주는 스티커를 얻은 곳(예: '우표 3개 보상')
 */
function StickerDrawer({ onPick, reward }) {
  // 잠긴 스티커는 서버 값을 따른다(우표 3개를 모으면 열린다). 서버에서 못 받았으면 모두 고를 수 있게 둔다.
  const { materials } = useLetterMaterials()

  return (
    <section className="sticker-drawer" aria-label="스티커 서랍">
      <header className="sticker-drawer__header">
        <h3 className="sticker-drawer__title">고향이 표정 스티커</h3>
        <span className="sticker-drawer__reward">{reward}</span>
      </header>
      <ul className="sticker-drawer__list">
        {STICKERS.map((sticker) => {
          const server = findMaterial(materials?.stickers, sticker.code)
          // 서버 값이 있으면 따르고, 없으면 모은 우표가 3개 미만일 때 잠근다.
          const locked = server ? !server.unlocked : MOCK_STAMP_COUNT < STICKER_UNLOCK_STAMPS
          const condition = server?.unlock_condition ?? `우표 ${STICKER_UNLOCK_STAMPS}개`
          return (
            <li key={sticker.id}>
              <button
                type="button"
                className={`sticker-drawer__item${locked ? ' is-locked' : ''}`}
                aria-label={locked ? `${sticker.label} 스티커 (${condition}를 모으면 열려요)` : `${sticker.label} 스티커 붙이기`}
                aria-disabled={locked}
                onClick={() => !locked && onPick(sticker)}
              >
                <Mascot pose={sticker.pose} size={40} />
                {locked && <span className="sticker-drawer__lock"><Icon name="lock" size={15} /></span>}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default StickerDrawer
