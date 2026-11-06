import face from '../assets/mascot/face.svg'
import smile from '../assets/mascot/smile.svg'
import sleepy from '../assets/mascot/sleepy.svg'
import letter from '../assets/mascot/letter.svg'
import greeting from '../assets/mascot/greeting.svg'

/** 포즈 이름 → 이미지 (Figma `고향이` 5포즈: 얼굴/웃음/졸림/편지/인사) */
const POSES = { face, smile, sleepy, letter, greeting }

/**
 * 마스코트 `고향이`
 *
 * SVG에 preserveAspectRatio="none"이 있어 가로·세로를 함께 지정하면 찌그러진다.
 * 크기는 `size`(가로 px)만 지정하고 높이는 자동으로 둔다.
 *
 * @example <Mascot pose="smile" size={120} />
 *
 * @param {object} props
 * @param {'face' | 'smile' | 'sleepy' | 'letter' | 'greeting'} [props.pose='face']
 *   face 얼굴 / smile 웃음 / sleepy 졸림 / letter 편지 / greeting 인사
 * @param {number} [props.size=120] 가로 크기(px). 높이는 비율에 맞춰 자동
 * @param {string} [props.alt=''] 장식용이면 빈 문자열 유지
 * @param {string} [props.className]
 */
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
