import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import Toggle from '../../components/mypage/Toggle.jsx'
import LoadError from '../../components/mypage/LoadError.jsx'
import useLoad from '../../components/mypage/useLoad.js'
import { fetchSettings, updateSettings } from '../../components/mypage/mypageApi.js'
import './NotificationsPage.css'

/**
 * 7-11 알림 · 편지 설정. 스위치를 누르면 바로 바뀐다(저장 버튼 없음).
 * 데이터는 서버(api/users.md GET·PATCH /api/users/me/settings/)에서 온다. 스위치 6개와 필드가 1:1이다.
 *   push_enabled, daily_digest_enabled, letter_arrival_push_enabled, letter_departure_push_enabled, letter_paused, weekly_prompt_enabled
 * 불러오기가 실패하면 오류 화면과 다시 시도를 보여 준다.
 * 가정:
 *  - 설정 화면으로 들어오는 길이 시안에 없어서 /mypage/notifications 주소로 직접 연다. 7-1의 "알림 · 편지 쉬기" 줄도 이 주소로 온다.
 *  - 스위치를 누르면 화면을 먼저 바꾸고 저장한다(실패하면 그 스위치만 되돌리고 토스트로 알린다). 스위치끼리 서로 영향을 주지 않는다(시안에 그런 규칙이 없다).
 *  - 시안의 안내 문구는 "푸시"인데 프레임 이름은 "이메일"이다. 화면에 보이는 글자(푸시)를 따랐다.
 */
function NotificationsPage() {
  const { showToast } = useOverlay()
  const { data: rows, error, reload, setData: setRows } = useLoad(fetchSettings)

  const setChecked = (id, checked) =>
    setRows((current) => current.map((item) => (item.id === id ? { ...item, checked } : item)))

  const handleChange = async (row, next) => {
    setChecked(row.id, next)
    try {
      await updateSettings({ [row.field]: next })
    } catch (saveError) {
      setChecked(row.id, !next)
      showToast(saveError.message)
    }
  }

  if (error) return <LoadError error={error} onRetry={reload} />

  return (
    <main className="notification-settings">
      <Header title="알림 설정" />

      <div className="notification-settings__body">
        <p className="notification-settings__notice">
          <Icon name="bell" size={26} />
          <span>
            편지가 도착하면
            <br />
            푸시 알림으로 알려드려요
          </span>
        </p>

        {rows ? (
          <ul className="notification-settings__card">
            {rows.map((row) => (
              <li key={row.id} className="notification-settings__row">
                <div className="notification-settings__text">
                  <span className="notification-settings__label">{row.label}</span>
                  {row.hint && <span className="notification-settings__hint">{row.hint}</span>}
                </div>
                <Toggle checked={row.checked} label={row.label} onChange={(next) => handleChange(row, next)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="notification-settings__loading" aria-busy="true">
            <Skeleton height={380} radius={24} />
          </div>
        )}
      </div>
    </main>
  )
}

export default NotificationsPage
