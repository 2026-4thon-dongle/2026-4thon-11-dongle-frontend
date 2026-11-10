import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Chip from '../../shared/ui/Chip.jsx'
import OwnedDiaryPhoto from './OwnedDiaryPhoto.jsx'

/** @param {{diary: object, onBack: () => void, onMenu: () => void}} props */
export default function OwnedDiaryDetail({ diary, onBack, onMenu }) {
  return <main className="owned-page owned-detail"><Header title="내 일기" onBack={onBack} right={<button type="button" className="owned-icon-button" aria-label="내 일기 메뉴" onClick={onMenu}><Icon name="more" /></button>} /><div className="owned-detail-body"><OwnedDiaryPhoto photo={diary.photo} className="owned-detail-photo" alt="일기에 첨부한 동네 풍경" /><p className="owned-detail-content text-body-15">{diary.content}</p><div className="owned-detail-meta"><span className="text-caption-11">{diary.province} {diary.district} · {diary.dateLabel}</span><Chip variant="light">{diary.visibility === 'private' ? '나만 보기' : diary.visibility === 'hometown' ? '고향 사람만' : '모두에게'}</Chip></div><p className="text-caption-11">이 일기로 편지 받기: {diary.receiveLetters ? '켜짐' : '꺼짐'}</p><p className="owned-demo text-caption-11">개발용 미리보기 · 실제 사용자 일기가 아니에요</p></div></main>
}
