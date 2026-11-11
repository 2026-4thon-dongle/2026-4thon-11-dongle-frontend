import { Link } from 'react-router-dom'
import Icon from '../../shared/ui/Icon.jsx'
import './DraftCard.css'

/**
 * 임시저장한 편지 카드(7-3). 편지 종류 알약, 제목, 본문 미리보기(손글씨체 두 줄), 저장 정보, 삭제, 이어 쓰기.
 * @param {object} draft mypageMapper.toDraftCard의 결과
 * @param {(id: number) => void} onDelete 휴지통을 눌렀을 때
 */
function DraftCard({ draft, onDelete }) {
  const { id, kindLabel, title, preview, metaLabel, resumePath } = draft

  return (
    <article className="draft-card">
      <header className="draft-card__head">
        <span className="draft-card__kind">{kindLabel}</span>
        <h2 className="draft-card__title">{title}</h2>
      </header>
      <p className="draft-card__preview">{preview}</p>
      <footer className="draft-card__foot">
        <span className="draft-card__meta">{metaLabel}</span>
        <button type="button" className="draft-card__delete" aria-label={`${title} 삭제`} onClick={() => onDelete(id)}>
          <Icon name="trash" size={20} />
        </button>
        <Link to={resumePath} className="draft-card__resume">
          이어 쓰기
        </Link>
      </footer>
    </article>
  )
}

export default DraftCard
