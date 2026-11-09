import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import './MailboxEmpty.css'

/**
 * 우체통 비었을 때 화면(5-2 새 편지, 5-4 대화 중, 5-6 배송 중, 5-7-1 보관). 고향이 그림, 안내 문구, 버튼 하나(없을 수도 있다).
 * @param {'large'|'small'} [size='large'] large: 5-2(원 220, 설명 15), small: 나머지(원 150, 설명 13)
 * @param {string} pose 고향이 표정 (Mascot의 pose)
 * @param {string} title
 * @param {string[]} description 줄바꿈 단위로 나눈 안내 문구
 * @param {string} [actionLabel] 버튼 글자. 없으면 버튼을 그리지 않는다(5-7-1 보관).
 * @param {() => void} [onAction] 버튼을 눌렀을 때
 * @param {number} [mascotSize] 고향이 가로(px). 기본은 large 160, small 120
 * @param {number} [mascotShift] 고향이를 원 가운데에서 아래로 내리는 px(음수면 위로). 기본은 large 6, small 4
 */
function MailboxEmpty({
  size = 'large',
  pose,
  title,
  description,
  actionLabel,
  onAction,
  mascotSize = size === 'large' ? 160 : 120,
  mascotShift = size === 'large' ? 6 : 4,
}) {
  return (
    <section className={`mailbox-empty mailbox-empty--${size}`}>
      <div className="mailbox-empty__circle" style={{ '--mascot-shift': `${mascotShift}px` }}>
        <Mascot pose={pose} size={mascotSize} />
      </div>
      <h2 className="mailbox-empty__title">{title}</h2>
      <p className="mailbox-empty__description">
        {description.map((line, index) => (
          <span key={index}>
            {index > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
      {actionLabel && (
        <div className="mailbox-empty__action">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </section>
  )
}

export default MailboxEmpty
