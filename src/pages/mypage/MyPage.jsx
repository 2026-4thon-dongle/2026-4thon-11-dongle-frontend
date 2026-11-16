import { Link } from 'react-router-dom'
import Icon from '../../shared/ui/Icon.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import ProfileCard from '../../components/mypage/ProfileCard.jsx'
import HometownBox from '../../components/mypage/HometownBox.jsx'
import StatCards from '../../components/mypage/StatCards.jsx'
import MenuList from '../../components/mypage/MenuList.jsx'
import LoadError from '../../components/mypage/LoadError.jsx'
import useLoad from '../../components/mypage/useLoad.js'
import { fetchMyPage } from '../../components/mypage/mypageApi.js'
import { MYPAGE_PATHS } from '../../components/mypage/mypagePaths.js'
import './MyPage.css'

/**
 * 7-1 마이. 프로필, 본가·거주 지역, 활동 숫자, 메뉴.
 * 데이터는 서버(GET /api/users/me/, /settings/, /api/stamps/)에서 온다. 요청과 변환은 components/mypage에서 한다. 실패하면 오류 화면과 다시 시도를 보여 준다.
 * 오른쪽 위 설정 아이콘은 설정 화면(7-1-1, /mypage/settings)으로 간다.
 */
function MyPage() {
  const { data: profile, error, reload } = useLoad(fetchMyPage)

  if (error) return <LoadError error={error} onRetry={reload} />

  return (
    <main className="mypage">
      <header className="mypage__header">
        <h1 className="mypage__title">마이</h1>
        <Link to={MYPAGE_PATHS.settings} className="mypage__settings" aria-label="설정">
          <Icon name="settings" />
        </Link>
      </header>

      {profile ? (
        <div className="mypage__body">
          <ProfileCard profile={profile} />
          <HometownBox profile={profile} />
          <StatCards stats={profile.stats} />
          <MenuList items={profile.menu} />
        </div>
      ) : (
        <div className="mypage__body" aria-busy="true">
          <Skeleton height={128} radius={28} />
          <Skeleton height={86} radius={24} />
          <Skeleton height={72} radius={20} />
          <Skeleton height={236} radius={24} />
        </div>
      )}
    </main>
  )
}

export default MyPage
