import Icon from '../../shared/ui/Icon.jsx'
import Stamp from '../../shared/ui/Stamp.jsx'
import './StampGrid.css'

/**
 * 우표 모음 격자(7-4~7-6). 한 줄에 4개. 아직 갖지 못한 우표는 흐리게 보이고 자물쇠가 올라간다.
 * 우표 그림은 shared의 Stamp(artId = assets/stamp 파일 이름)로 그린다. 우표 이름 띠와 번호는 그림 안에 들어 있다.
 * @param {Array<{id: string, artId: string, name: string, owned: boolean}>} stamps mypageMapper.toStampCollection의 stamps
 * @param {'compact'|'roomy'} [spacing='compact'] 줄 사이 간격. 업적 17px(compact), 꾸미기 25px(roomy)로 시안이 다르다.
 * @param {(code: string) => void} [onSelect] 서버 우표 code(stamp.id)를 넘긴다. 가진 우표를 눌렀을 때(7-7 상세). 없으면 누를 수 없다. 가지지 못한 우표는 누를 수 없다.
 */
function StampGrid({ stamps, spacing = 'compact', onSelect }) {
  return (
    <ul className={`stamp-grid stamp-grid--${spacing}`}>
      {stamps.map((stamp) => {
        const picture = (
          <Stamp
            id={stamp.artId ?? stamp.id}
            size={68}
            alt={stamp.owned ? stamp.name : ''}
            className={`stamp-grid__stamp${stamp.owned ? '' : ' is-locked'}`}
          />
        )
        return (
          <li key={stamp.id} className="stamp-grid__cell">
            {onSelect && stamp.owned ? (
              <button
                type="button"
                className="stamp-grid__button"
                aria-label={`${stamp.name} 자세히 보기`}
                onClick={() => onSelect(stamp.id)}
              >
                {picture}
              </button>
            ) : (
              picture
            )}
            {!stamp.owned && (
              <span className="stamp-grid__lock" role="img" aria-label={`${stamp.name} 잠김`}>
                <Icon name="lock" size={20} />
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default StampGrid
