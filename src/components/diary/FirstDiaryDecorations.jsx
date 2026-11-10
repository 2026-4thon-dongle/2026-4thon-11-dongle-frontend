import orange from './assets/dot-orange.svg'
import sage from './assets/dot-sage.svg'
import sky from './assets/dot-sky.svg'
import berry from './assets/dot-berry.svg'
import peach from './assets/dot-peach.svg'
import smallOrange from './assets/dot-orange-small.svg'
import smallPeach from './assets/dot-peach-small.svg'

/** @param {{complete?: boolean}} props 장식 점은 Figma 원본 크기를 유지한다. */
export default function FirstDiaryDecorations({ complete = false }) {
  return <div className={`first-diary-confetti ${complete ? 'first-diary-confetti--complete' : ''}`} aria-hidden="true">
    <img className="first-diary-dot first-diary-dot--orange" src={orange} alt="" />
    <img className="first-diary-dot first-diary-dot--sage" src={sage} alt="" />
    <img className="first-diary-dot first-diary-dot--sky" src={sky} alt="" />
    <img className="first-diary-dot first-diary-dot--berry" src={berry} alt="" />
    <img className="first-diary-dot first-diary-dot--peach" src={peach} alt="" />
    {!complete && <><img className="first-diary-dot first-diary-dot--small-orange" src={smallOrange} alt="" /><img className="first-diary-dot first-diary-dot--small-sage" src={sage} alt="" /><img className="first-diary-dot first-diary-dot--small-peach" src={smallPeach} alt="" /></>}
  </div>
}
