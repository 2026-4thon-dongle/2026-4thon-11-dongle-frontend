import Header from '../../shared/ui/Header.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import MenuList from '../../components/mypage/MenuList.jsx'
import SettingsInfoCard from '../../components/mypage/SettingsInfoCard.jsx'
import LoadError from '../../components/mypage/LoadError.jsx'
import useLoad from '../../components/mypage/useLoad.js'
import { fetchSettingsHome } from '../../components/mypage/mypageApi.js'
import './SettingsPage.css'

/**
 * 7-1-1 설정. 7-1 오른쪽 위 설정 아이콘으로 들어온다. "내 정보" 메뉴 5줄은 하위 화면으로 가고, "정보" 2줄은 임시 처리한다.
 * 데이터는 서버(GET /api/users/me/, /settings/, /api/blocks/)에서 온다(mypageApi → mypageMapper). 들어올 때마다 새로 읽어서 줄의 오른쪽 값에 7-9~7-12에서 바꾼 값이 보인다. 실패하면 오류 화면과 다시 시도를 보여 준다.
 * 연결: 닉네임 변경 → 7-9, 지역 설정 → 7-10, 알림 · 편지 설정 → 7-11, 차단 목록 → 7-12, 계정 → 7-13.
 * 가정:
 *  - "이용약관 · 개인정보 처리방침", "문의하기"는 시안에 연결 화면이 없어서 누르면 토스트("준비 중이에요")만 보여 준다.
 *  - "동글 v1.0.0"은 시안의 글자를 그대로 쓴 값이다(실제 앱 버전과 연결하지 않았다).
 *  - 시안에 켜고 끄는 스위치가 없어서 Toggle은 쓰지 않았다.
 */
function SettingsPage() {
  const { showToast } = useOverlay()
  const { data: home, error, reload } = useLoad(fetchSettingsHome)

  if (error) return <LoadError error={error} onRetry={reload} />

  return (
    <main className="settings-page">
      <Header title="설정" />

      {home ? (
        <div className="settings-page__body">
          <h2 className="settings-page__label">내 정보</h2>
          <MenuList items={home.menu} ariaLabel="설정 메뉴" />

          <h2 className="settings-page__label settings-page__label--next">정보</h2>
          <SettingsInfoCard items={home.infoItems} onSelect={() => showToast('준비 중이에요')} />

          <p className="settings-page__version">{home.versionLabel}</p>
        </div>
      ) : (
        <div className="settings-page__body" aria-busy="true">
          <Skeleton height={236} radius={24} />
          <Skeleton height={120} radius={24} />
        </div>
      )}
    </main>
  )
}

export default SettingsPage
