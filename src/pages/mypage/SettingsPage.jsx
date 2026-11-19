import { useNavigate } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import MenuList from '../../components/mypage/MenuList.jsx'
import SettingsInfoCard from '../../components/mypage/SettingsInfoCard.jsx'
import DemoModeCard from '../../components/mypage/DemoModeCard.jsx'
import LoadError from '../../components/mypage/LoadError.jsx'
import useLoad from '../../components/mypage/useLoad.js'
import { fetchSettingsHome } from '../../components/mypage/mypageApi.js'
import { MYPAGE_PATHS } from '../../components/mypage/mypagePaths.js'
import './SettingsPage.css'

/**
 * 가정:
 *  - "이용약관 · 개인정보 처리방침"은 7-1-2(약관 화면)로 간다. 시안에 "문의하기"는 없다.
 *  - "동글 v1.0.0"은 시안의 글자를 그대로 쓴 값이다(실제 앱 버전과 연결하지 않았다).
 */
function SettingsPage() {
  const navigate = useNavigate()
  const { data: home, error, reload } = useLoad(fetchSettingsHome)

  if (error) return <LoadError error={error} onRetry={reload} />

  return (
    <main className="settings-page">
      <Header title="설정" onBack={() => navigate(MYPAGE_PATHS.home)} />

      {home ? (
        <div className="settings-page__body">
          <h2 className="settings-page__label">내 정보</h2>
          <MenuList items={home.menu} ariaLabel="설정 메뉴" />

          <h2 className="settings-page__label settings-page__label--next">정보</h2>
          <SettingsInfoCard items={home.infoItems} onSelect={(item) => navigate(item.to)} />

          <h2 className="settings-page__label settings-page__label--next">시연용</h2>
          <DemoModeCard />

          <p className="settings-page__version">{home.versionLabel}</p>
        </div>
      ) : (
        <div className="settings-page__body" aria-busy="true">
          <Skeleton height={236} radius={24} />
          <Skeleton height={61} radius={24} />
        </div>
      )}
    </main>
  )
}

export default SettingsPage
