import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import { IntroArt as Art, IntroStamp as Stamp } from '../../components/intro/IntroIllustration.jsx'
import './IntroPage.css'

// 서비스 소개(1-2·1-3)는 처음 한 번만 보여 준다(screens 1-2 「최초 1회만 노출」). 시작 화면(1-4)에 닿으면 본 것으로 적는다.
const INTRO_SEEN_KEY = 'dongle.intro-seen'
function introSeen() { try { return localStorage.getItem(INTRO_SEEN_KEY) === '1' } catch { return false } }
function markIntroSeen() { try { localStorage.setItem(INTRO_SEEN_KEY, '1') } catch { /* 저장하지 못하면 다음에도 소개를 보여 준다. */ } }

export function SplashPage() {
  const navigate = useNavigate()
  const next = introSeen() ? '/start' : '/intro'
  useEffect(() => { const timer = setTimeout(() => navigate(next, { replace: true }), 1800); return () => clearTimeout(timer) }, [navigate, next])
  return <main className="intro-page splash-page">
    <Art name="peachLarge" className="splash-peach-one" /><Art name="peachMedium" className="splash-peach-two" /><Art name="creamLarge" className="splash-cream-one" /><Art name="creamSmall" className="splash-cream-two" />
    <div className="splash-mascot"><Mascot pose="greeting" size={180} alt="인사하는 고향이" /></div>
    <h1 className="splash-brand">동글</h1><p className="splash-subtitle text-title-20">동네에서 온 글</p>
    <Link to={next} className="splash-caption text-body-13" aria-label="다음 화면으로 계속하기">서로의 고향을 바꿔 읽는 느린 편지</Link>
  </main>
}

export default function IntroPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const second = pathname === '/intro/2'
  // 좌우로 밀어 넘긴다(screens 1-2 「스와이프 또는 다음」). 왼쪽으로 밀면 다음, 오른쪽으로 밀면 이전.
  const touchStart = useRef(null)
  function handleTouchStart(event) { const touch = event.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY } }
  function handleTouchEnd(event) {
    const start = touchStart.current
    touchStart.current = null
    const touch = event.changedTouches[0]
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(touch.clientY - start.y)) return
    if (dx < 0) navigate(second ? '/start' : '/intro/2')
    else if (second) navigate('/intro')
  }
  return <main className="intro-page introduction-page" key={pathname} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
    <div className="intro-skip">{!second && <Link to="/start">건너뛰기</Link>}</div>
    <div className={`intro-scene ${second ? 'intro-scene--second' : ''}`}>
      <Art name={second ? 'peachCircle' : 'butterCircle'} className="intro-circle" />
      <div className="intro-scene-mascot"><Mascot pose={second ? 'smile' : 'letter'} size={second ? 160 : 180} alt={second ? '반갑게 웃는 고향이' : '편지를 든 고향이'} /></div>
      {second ? <><div className="intro-letter intro-letter--from">From. 충남</div><div className="intro-letter intro-letter--to">To. 서울</div></> : <><Stamp name="firstLetter" label="첫 편지" number="03" className="intro-stamp--first" /><Stamp name="firstRoundtrip" label="첫 왕복" number="04" className="intro-stamp--second" /></>}
    </div>
    <h1 className="intro-title text-title-24">{second ? <>그 동네가 고향인 누군가에게<br />내 일기가 닿아요</> : <>멀리 떠나온 우리,<br />고향 소식이 그리울 때</>}</h1>
    <p className="intro-description text-body-15">{second ? <>댓글 대신 느린 손편지로 답장해요.<br />편지는 실제 거리만큼 천천히 배달돼요</> : <>자취방 창밖 풍경, 학교 앞 붕어빵 트럭…<br />지금 사는 동네의 하루를 일기로 남겨요</>}</p>
    <nav className="intro-pagination" aria-label="서비스 소개 단계">
      {[0, 1, 2].map((item) => item === (second ? 1 : 0) ? <span key={item} className="intro-current" role="img" aria-current="step" aria-label={`3단계 중 ${item + 1}단계`} /> : <Art key={item} name="paginationDot" />)}
    </nav>
    <div className="intro-bottom"><Button onClick={() => navigate(second ? '/start' : '/intro/2')}>{second ? '시작하기' : '다음'}</Button></div>
  </main>
}

export function StartPage() {
  const navigate = useNavigate()
  useEffect(() => { markIntroSeen() }, [])
  return <main className="intro-page start-page">
    <Art name="startCircle" className="start-circle" />
    <div className="start-mascot"><Mascot pose="smile" size={150} alt="웃으며 맞이하는 고향이" /></div>
    <h1 className="start-brand">동글</h1><p className="start-subtitle text-title-17">동네에서 온 글</p>
    <p className="start-description text-body-15">서로의 고향을 바꿔 읽는<br />느린 편지 서비스</p>
    <div className="start-actions"><Button onClick={() => navigate('/signup')}>학교 이메일로 시작하기</Button><p className="text-caption-11">대학생 인증 후 가입할 수 있어요</p><Link className="text-label-15" to="/login">이미 계정이 있나요?&nbsp; 로그인</Link></div>
  </main>
}
