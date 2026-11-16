import { isOwnedDiaryDemo } from '../../shared/api/ownedDiary.js'
import { Link } from 'react-router-dom'
import Mascot from '../../shared/ui/Mascot.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import circle from './assets/success-circle.svg'
import postmark from './assets/postmark.png'

/** @param {{diary: object}} props */
export default function OwnedDiaryPublished({ diary }) {
  return <main className="owned-page owned-published"><div className="owned-published-scene"><img src={circle} alt="" /><Mascot pose="smile" size={170} alt="일기 등록을 축하하는 고향이" />{['one', 'two', 'three', 'four'].map((position) => <Icon key={position} name="sparkle" className={`owned-published-sparkle owned-published-sparkle--${position}`} />)}</div><h1 className="text-title-24">일기가 등록됐어요!</h1><p className="owned-published-description text-body-15">{diary.province}이 고향인 친구들의 피드에<br />가장 먼저 보여질 거예요</p><article className="owned-published-preview" aria-label="등록한 일기 미리보기"><div className="owned-preview-airmail" aria-hidden="true" /><h2>{diary.title}</h2><p className="text-caption-11">{diary.province} {diary.district} · 방금 부쳤어요</p><div className="owned-preview-stamp"><Stamp id="first-diary" size={32} label={false} alt="첫 일기 우표" /><span className="owned-preview-stamp-brand" aria-hidden="true">동글</span><span className="owned-preview-stamp-number" aria-hidden="true">No.02</span><span className="owned-preview-stamp-label" aria-hidden="true">첫 일기</span></div><div className="owned-preview-postmark" aria-hidden="true"><img src={postmark} alt="" width={36} height={36} /><span>{diary.province}<br />{diary.postmarkDate}</span></div></article><footer className="owned-published-actions"><Link className="ui-button ui-button--secondary" to={`/diary/mine/${encodeURIComponent(diary.id)}`}>내 일기 보기</Link><Link className="ui-button ui-button--primary" to="/home">홈으로</Link>{isOwnedDiaryDemo && <p className="owned-demo text-caption-11">개발용 완료 화면 · 실제 게시·우표 지급 전이에요</p>}</footer></main>
}
