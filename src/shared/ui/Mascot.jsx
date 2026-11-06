import face from '../assets/mascot/face.svg'
import smile from '../assets/mascot/smile.svg'
import sleepy from '../assets/mascot/sleepy.svg'
import letter from '../assets/mascot/letter.svg'
import greeting from '../assets/mascot/greeting.svg'

// 포즈: face 얼굴 / smile 웃음 / sleepy 졸림 / letter 편지 / greeting 인사
const POSES = { face, smile, sleepy, letter, greeting }

// size는 가로(px)만 지정한다. 높이는 자동 (SVG가 찌그러지지 않게)
function Mascot({ pose = 'face', size = 120, alt = '', className }) {
  return (
    <img
      className={className}
      src={POSES[pose]}
      alt={alt}
      width={size}
      style={{ height: 'auto' }}
    />
  )
}

export default Mascot
