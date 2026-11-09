import Mascot from '../../shared/ui/Mascot.jsx'
import { STICKERS } from './data.js'
import './StickerDrawer.css'

/**
 * 스티커 서랍(시안 4-5). 스티커를 누르면 서명 그림판에 붙는다.
 * @param {(sticker: {id: string, pose: string}) => void} onPick
 * @param {string} reward 오른쪽에 보여주는 스티커를 얻은 곳(예: '우표 3개 보상')
 */
function StickerDrawer({ onPick, reward }) {
  return (
    <section className="sticker-drawer" aria-label="스티커 서랍">
      <header className="sticker-drawer__header">
        <h3 className="sticker-drawer__title">고향이 표정 스티커</h3>
        <span className="sticker-drawer__reward">{reward}</span>
      </header>
      <ul className="sticker-drawer__list">
        {STICKERS.map((sticker) => (
          <li key={sticker.id}>
            <button
              type="button"
              className="sticker-drawer__item"
              aria-label={`${sticker.label} 스티커 붙이기`}
              onClick={() => onPick(sticker)}
            >
              <Mascot pose={sticker.pose} size={40} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default StickerDrawer
