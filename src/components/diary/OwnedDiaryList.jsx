import { Link } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Button from '../../shared/ui/Button.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import { Postmark } from '../../shared/ui/DiaryPostcardParts.jsx'
import { isOwnedDiaryDemo } from '../../shared/api/ownedDiary.js'

const CARD_STAMPS = ['bungeoppang', 'first-diary', 'steady-letter']
/** Figma 158:1842 — 6-6, server-owned diary values with decorative stamps. */
export default function OwnedDiaryList({ diaries, profile, count, onBack, next, loading, onMore }) {
  return <main className="owned-page owned-list">
    <Header title="내 일기" onBack={onBack} />
    <div className="owned-list-body">
      <h2 className="text-label-15">{profile.province} {profile.district}에서 쓴 일기 {count ?? diaries.length}편</h2>
      <div className="owned-list-grid">{diaries.map((diary, index) => {
        const received = diary.receivedLetterCount ?? 0
        return <Link className="owned-list-card" key={diary.id} to={`/diary/mine/${encodeURIComponent(diary.id)}`} aria-label={`${diary.title} 읽기`}>
          <span className="owned-card-airmail" aria-hidden="true" />
          <span className="owned-card-meta text-caption-11">{diary.district || diary.province} · {diary.postmarkDate}</span>
          <span className="owned-card-stamp" aria-hidden="true"><Stamp id={CARD_STAMPS[index % CARD_STAMPS.length]} size={36} /></span>
          <span className="owned-card-postmark"><Postmark small province={diary.province} date={diary.postmarkDate} /></span>
          <h3>{diary.title}</h3>
          <span className={`owned-card-letter-count ${received ? '' : 'is-empty'}`}>{received ? `받은 편지 ${received}통` : '아직 편지 없음'}</span>
        </Link>
      })}</div>
      {!diaries.length && <p className="owned-list-empty text-body-15">아직 쓴 일기가 없어요.<br />우리 동네의 하루를 남겨보세요.</p>}
      {next && <Button disabled={loading} onClick={onMore}>더 보기</Button>}
      {isOwnedDiaryDemo && <p className="owned-demo text-caption-11">개발용 목록 · 예시 일기예요</p>}
    </div>
    <div className="owned-list-floating"><Link to="/diary/write" aria-label="새 일기 쓰기"><Icon name="pencil" /></Link></div>
  </main>
}
