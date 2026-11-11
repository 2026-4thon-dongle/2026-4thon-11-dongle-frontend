import { useEffect, useState } from 'react'
import Header from '../../shared/ui/Header.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import Toggle from '../../components/mypage/Toggle.jsx'
import { fetchSettings, updateSettings } from '../../components/mypage/mypageApi.js'
import './NotificationsPage.css'

/**
 * 7-11 알림 · 편지 설정. 스위치를 누르면 바로 바뀐다(저장 버튼 없음).
 * 데이터는 mock이다. 문서 레포 명세(api/users.md GET·PATCH /api/users/me/settings/)의 필드 이름을 따르지만 실제 API는 부르지 않는다.
 *   push_enabled, daily_digest_enabled, letter_paused, weekly_prompt_enabled
 * 시안에는 "편지 도착", "편지가 출발했을 때" 스위치도 있는데 명세에 없어서 mock 전용 필드(letter_arrival_enabled, letter_departure_enabled)로 두었다.
 * 가정:
 *  - 설정 화면으로 들어오는 길이 시안에 없어서 /mypage/notifications 주소로 직접 연다. 7-1의 "알림 · 편지 쉬기" 줄도 이 주소로 온다.
 *  - 스위치를 누르면 화면을 먼저 바꾸고 저장한다(실패하면 되돌린다). 스위치끼리 서로 영향을 주지 않는다(시안에 그런 규칙이 없다).
 *  - 시안의 안내 문구는 "푸시"인데 프레임 이름은 "이메일"이다. 화면에 보이는 글자(푸시)를 따랐다.
 */
function NotificationsPage() {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    fetchSettings().then(setRows)
  }, [])

  const handleChange = async (row, next) => {
    const previous = rows
    setRows((current) => current.map((item) => (item.id === row.id ? { ...item, checked: next } : item)))
    try {
      await updateSettings({ [row.field]: next })
    } catch {
      setRows(previous)
    }
  }

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
