import Stamp from '../../shared/ui/Stamp.jsx'

/** @param {{id: 'first-step'|'first-diary', size: number, label: string, number: string, alt: string}} props 공용 Stamp 그림에 화면의 이름 띠·번호만 조합한다. */
export default function DiaryAchievementStamp({ id, size, label, number, alt }) {
  return <div className="diary-achievement-stamp" style={{ '--achievement-size': `${size}px` }}>
    <Stamp id={id} size={size} alt={alt} />
    <span className="diary-achievement-brand" aria-hidden="true">동글</span>
    <span className="diary-achievement-number" aria-hidden="true">No.{number}</span>
    <span className="diary-achievement-label" aria-hidden="true">{label}</span>
  </div>
}
