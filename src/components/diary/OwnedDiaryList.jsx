import { Link } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import OwnedDiaryPhoto from './OwnedDiaryPhoto.jsx'

/** @param {{diaries: object[], profile: object, onBack: () => void}} props */
export default function OwnedDiaryList({ diaries, profile, onBack }) {
  return <main className="owned-page owned-list"><Header title="내 일기" onBack={onBack} /><div className="owned-list-body"><h2 className="text-label-15">{profile.province} {profile.district}에서 쓴 일기 {diaries.length}편</h2><div className="owned-list-grid">{diaries.map((diary) => <Link className="owned-list-card" key={diary.id} to={`/diary/mine/${encodeURIComponent(diary.id)}`}><OwnedDiaryPhoto photo={diary.photo} alt={`${diary.title} 사진`} /><h3>{diary.title}</h3><p className="text-caption-11">{diary.dateLabel}</p></Link>)}</div>{!diaries.length && <p className="owned-list-empty text-body-15">아직 쓴 일기가 없어요.<br />우리 동네의 하루를 남겨보세요.</p>}<p className="owned-demo text-caption-11">개발용 목록 · 이 브라우저에 저장된 일기예요</p></div><div className="owned-list-floating"><Link to="/diary/write" aria-label="새 일기 쓰기"><Icon name="pencil" /></Link></div></main>
}
