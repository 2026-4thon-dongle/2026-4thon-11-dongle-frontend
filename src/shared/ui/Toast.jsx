import './Overlay.css'

/**
 * 토스트 본문. 보통 useOverlay().showToast()로 띄운다.
 * 시안에 토스트 디자인이 없어 임시 모양이다. 시안이 나오면 Overlay.css의 .ui-toast만 고친다.
 * @param {string} message
 */
function Toast({ message }) {
  return (
    <div className="ui-toast" role="status">
      {message}
    </div>
  )
}

export default Toast
