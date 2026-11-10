import Button from '../../shared/ui/Button.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import DiaryAchievementStamp from './DiaryAchievementStamp.jsx'
import FirstDiaryDecorations from './FirstDiaryDecorations.jsx'
import circle from './assets/complete-circle.svg'

/** @param {{profile: object|null, onNext: () => void, demo: boolean}} props */
export default function FirstDiaryComplete({ profile, onNext, demo }) {
  const hometowns = [...new Set(profile?.hometowns?.map((item) => item.province) || [])].join(' · ') || '그 동네'
  return <main className="first-diary-page first-diary-complete">
    <FirstDiaryDecorations complete />
    <h1 className="text-title-24">첫 일기가 날아갔어요!</h1><p className="first-diary-complete-description text-body-13">{hometowns}이 고향인 친구들의 피드에<br />가장 먼저 보여질 거예요</p>
    <div className="first-diary-stamp-scene"><img src={circle} alt="" /><div className="first-diary-earned-stamp"><DiaryAchievementStamp id="first-diary" size={129.6} label="첫 일기" number="02" alt="첫 일기 우표" /></div></div>
    <div className="first-diary-reward"><Mascot pose="greeting" size={84} alt="첫 일기를 축하하는 고향이" /><p className="text-label-15">「첫 일기」 우표를 받았어요</p></div>
    <p className="first-diary-complete-message text-body-15">이제 고향 일기를 읽고<br />마음에 닿은 글에 편지를 보내봐요</p>
    <footer className="first-diary-footer">{demo && <p className="first-diary-demo text-caption-11">개발용 완료 화면 · 실제 게시·우표 지급 전이에요</p>}<Button onClick={onNext}>동글 시작하기</Button></footer>
  </main>
}
