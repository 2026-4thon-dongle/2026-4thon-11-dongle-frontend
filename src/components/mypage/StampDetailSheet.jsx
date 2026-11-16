import Button from '../../shared/ui/Button.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import useLoad from './useLoad.js'
import { fetchStampDetail } from './mypageApi.js'
import './StampDetailSheet.css'

/**
 * 우표 상세 바텀시트의 내용(7-7). 열고 닫는 틀(핸들, 딤)은 shared의 useOverlay().openSheet가 맡는다.
 * 우표를 누른 쪽(우표첩 화면)이 openSheet({ content: ({ close }) => <StampDetailSheet … /> })로 연다.
 * 데이터는 서버(GET /api/stamps/{code}/)에서 온다. "(5 / 10)" 같은 보상 진행도 이 응답의 owned_count·next_reward이다.
 * 실패하면 시트 안에 오류 문구와 "다시 시도"를 보여 준다.
 * @param {string} stampId 서버 우표 code
 * @param {(path: string) => void} onWriteLetter "이 우표 붙여서 편지 쓰기"를 눌렀을 때. 이동할 경로를 넘겨 준다.
 */
function StampDetailSheet({ stampId, onWriteLetter }) {
  const { data: detail, error, reload } = useLoad(() => fetchStampDetail(stampId), [stampId])

  if (error) {
    return (
      <div className="stamp-detail stamp-detail--error" role="alert">
        <p>{error.message}</p>
        <Button variant="secondary" onClick={reload}>
          다시 시도
        </Button>
      </div>
    )
  }
  if (!detail) return <div className="stamp-detail stamp-detail--loading" aria-busy="true" />

  return (
    <div className="stamp-detail">
      <div className="stamp-detail__top">
        <div className="stamp-detail__stamp">
          <Stamp id={detail.artId} size={120} alt={detail.name} className="stamp-detail__stamp-img" />
        </div>
        <div className="stamp-detail__info">
          <h2 className="stamp-detail__name">{detail.name}</h2>
          <p className="stamp-detail__badges">
            {detail.gradeLabel && <span className="stamp-detail__grade">{detail.gradeLabel}</span>}
            {detail.numberLabel && <span className="stamp-detail__number">{detail.numberLabel}</span>}
          </p>
          <p className="stamp-detail__description">{detail.description}</p>
          {detail.obtainedLabel && <p className="stamp-detail__obtained">{detail.obtainedLabel}</p>}
        </div>
      </div>

      <section className="stamp-detail__uses">
        <h3 className="stamp-detail__uses-title">이 우표로 할 수 있는 것</h3>
        <ul className="stamp-detail__uses-list">
          {detail.abilities.map((ability) => (
            <li key={ability}>· {ability}</li>
          ))}
        </ul>
      </section>

      <div className="stamp-detail__action">
        <Button onClick={() => onWriteLetter(detail.letterWritePath)}>이 우표 붙여서 편지 쓰기</Button>
      </div>
    </div>
  )
}

export default StampDetailSheet
