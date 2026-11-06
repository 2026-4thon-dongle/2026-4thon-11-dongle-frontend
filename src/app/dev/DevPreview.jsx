// 개발 전용 확인 화면 (/preview) — 공용 컴포넌트·토큰을 눈으로 확인하는 용도
import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'

const COLORS = [
  'bg-cream', 'bg-surface', 'bg-butter', 'bg-peach',
  'brand-orange', 'brand-orange-deep', 'brand-sage', 'brand-sky', 'brand-berry', 'brand-blush',
  'text-brown', 'text-sub', 'text-hint', 'line-soft', 'white',
]

const TEXTS = [
  ['text-display-32', 'Display/32 Jua 동네에서 온 글'],
  ['text-title-24', 'Title/24 Jua 동네에서 온 글'],
  ['text-title-20', 'Title/20 Jua 동네에서 온 글'],
  ['text-title-17', 'Title/17 Jua 동네에서 온 글'],
  ['text-label-15', 'Label/15 Jua 동네에서 온 글'],
  ['text-body-15', 'Body/15 Gowun Dodum 동네에서 온 글 일기를 남겨요'],
  ['text-body-13', 'Body/13 Gowun Dodum 동네에서 온 글 일기를 남겨요'],
  ['text-caption-11', 'Caption/11 Gowun Dodum 동네에서 온 글 일기를 남겨요'],
  ['text-letter-22', 'Letter/22 Nanum Pen 사랑하는 고향 친구에게, 잘 지내니?'],
]

function Title({ children }) {
  return <h2 className="text-title-20" style={{ margin: '32px 0 12px' }}>{children}</h2>
}

function DevPreview() {
  return (
    <main style={{ padding: 24 }}>
      <h1 className="text-display-32" style={{ margin: 0 }}>공용 요소 확인</h1>

      <Title>버튼</Title>
      <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </div>

      <Title>마스코트</Title>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {['face', 'smile', 'sleepy', 'letter', 'greeting'].map((pose) => (
          <figure key={pose} style={{ margin: 0, textAlign: 'center' }}>
            <Mascot pose={pose} size={100} />
            <figcaption className="text-caption-11">{pose}</figcaption>
          </figure>
        ))}
      </div>

      <Title>색상</Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
        {COLORS.map((name) => (
          <div key={name}>
            <div style={{ height: 48, borderRadius: 12, background: `var(--${name})`, border: '1px solid var(--line-soft)' }} />
            <div className="text-caption-11">--{name}</div>
          </div>
        ))}
      </div>

      <Title>폰트</Title>
      <div style={{ display: 'grid', gap: 10 }}>
        {TEXTS.map(([cls, sample]) => (
          <div key={cls} className={cls}>{sample}</div>
        ))}
      </div>
    </main>
  )
}

export default DevPreview
