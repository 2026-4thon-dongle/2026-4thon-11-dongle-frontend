import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import DiaryAchievementStamp from './DiaryAchievementStamp.jsx'
import FirstDiaryDecorations from './FirstDiaryDecorations.jsx'
import circle from './assets/welcome-circle.svg'

/** @param {{profile: {nickname: string, hometowns: object[], residence: object}, onNext: () => void, demo: boolean}} props */
export default function FirstDiaryWelcome({ profile, onNext, demo }) {
  const residence = profile?.residence?.district || profile?.residence?.province || '우리 동네'
  const hometown = profile?.hometowns?.[0]?.province || '고향'
  return <main className="first-diary-page first-diary-welcome">
    <FirstDiaryDecorations />
    <div className="first-diary-welcome-scene"><img className="first-diary-scene-circle" src={circle} alt="" /><Mascot pose="greeting" size={138.667} alt="반갑게 인사하는 고향이" /></div>
    <h1 className="text-title-24">환영해요, {profile?.nickname || '친구'}님!</h1>
    <p className="first-diary-welcome-description text-body-15">이제 {residence}{residence === '성북' ? '구' : ''}의 하루를 {hometown}에 보낼 수 있어요</p>
    <section className="first-diary-gift" aria-label="가입 선물"><DiaryAchievementStamp id="first-step" size={55.04} label="첫 걸음" number="01" alt="첫 걸음 우표" /><div className="first-diary-gift-content"><h2 className="text-title-17">가입 선물 도착!</h2><p className="text-body-13">「첫 걸음」 우표를 받았어요<br />편지에 붙여 보낼 수 있어요</p></div></section>
    <footer className="first-diary-footer">{demo && <p className="first-diary-demo text-caption-11">개발용 미리보기 · 실제 가입·저장 정보가 아니에요</p>}<Button onClick={onNext}>첫 고향 일기 쓰러 가기</Button></footer>
  </main>
}
