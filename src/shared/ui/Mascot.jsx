import face from '../assets/mascot/face.svg'
import smile from '../assets/mascot/smile.svg'
import sparkle from '../assets/mascot/sparkle.svg'
import shy from '../assets/mascot/shy.svg'
import sleepy from '../assets/mascot/sleepy.svg'
import wink from '../assets/mascot/wink.svg'
import surprised from '../assets/mascot/surprised.svg'
import teary from '../assets/mascot/teary.svg'
import heart from '../assets/mascot/heart.svg'
import pouty from '../assets/mascot/pouty.svg'
import curious from '../assets/mascot/curious.svg'
import sitting from '../assets/mascot/sitting.svg'
import letter from '../assets/mascot/letter.svg'
import greeting from '../assets/mascot/greeting.svg'

// 표정 11종(얼굴만): face 기본 / smile 웃음 / sparkle 반짝 / shy 부끄 / sleepy 졸림 / wink 윙크
//                    / surprised 놀람 / teary 울먹 / heart 하트 / pouty 삐짐 / curious 궁금
// 전신 3종: sitting 앉기 / letter 편지 / greeting 인사
const POSES = {
  face,
  smile,
  sparkle,
  shy,
  sleepy,
  wink,
  surprised,
  teary,
  heart,
  pouty,
  curious,
  sitting,
  letter,
  greeting,
}

// size는 가로(px)만 지정한다. 높이는 자동 (SVG가 찌그러지지 않게)
function Mascot({ pose = 'face', size = 120, alt = '', className }) {
  return (
    <img
      className={className}
      src={POSES[pose] ?? POSES.face}
      alt={alt}
      width={size}
      style={{ height: 'auto' }}
    />
  )
}

export default Mascot
