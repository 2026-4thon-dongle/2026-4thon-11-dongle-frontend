import { Link } from 'react-router-dom'
import RegionChip from '../../shared/ui/RegionChip.jsx'
import { MYPAGE_PATHS } from './mypagePaths.js'
import './HometownBox.css'

/**
 * 본가·거주 지역 요약 박스(7-1). 양쪽에 지역 칩, 가운데에 본가·거주 이름과 "지역 수정" 링크.
 * 시안은 "거주 성북"과 "지역 수정 ›"이 같은 자리에 겹쳐 있어서, 한 줄에 나란히 놓았다.
 * @param {object} profile mypageMapper.toMyPage의 일부
 */
function HometownBox({ profile }) {
  const { hometownProvince, residenceProvince, hometownLabel, residenceLabel } = profile

  return (
    <section className="hometown-box" aria-label="내 지역">
      <RegionChip region={hometownProvince} />
      <div className="hometown-box__text">
        <p className="hometown-box__line">{hometownLabel}</p>
        <p className="hometown-box__line hometown-box__line--row">
          {residenceLabel}
          <Link to={MYPAGE_PATHS.regions} state={{ from: MYPAGE_PATHS.home }} className="hometown-box__edit">
            지역 수정 ›
          </Link>
        </p>
      </div>
      <RegionChip region={residenceProvince} />
    </section>
  )
}

export default HometownBox
