import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import './MailboxEmpty.css'

/**
 * 우체통 비었을 때 화면(5-2 새 편지, 5-4 대화 중). 고향이 그림, 안내 문구, 버튼 하나.
 * @param {'large'|'small'} [size='large'] large: 5-2(원 220, 설명 15), small: 5-4(원 150, 설명 13)
 * @param {string} pose 고향이 표정 (Mascot의 pose)
 * @param {string} title
 * @param {string[]} description 줄바꿈 단위로 나눈 안내 문구
 * @param {string} actionLabel 버튼 글자
 * @param {() => void} onAction 버튼을 눌렀을 때
 */
function MailboxEmpty({ size = 'large', pose, title, description, actionLabel, onAction }) {
  const mascotSize = size === 'large' ? 160 : 120
  return (
    <section className={`mailbox-empty mailbox-empty--${size}`}>
      <div className="mailbox-empty__circle">
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
      <div className="mailbox-empty__action">
        <Button onClick={onAction}>{actionLabel}</Button>
      </div>
    </section>
  )
}

export default MailboxEmpty
