import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import WithdrawDialog from '../../components/mypage/WithdrawDialog.jsx'
import { logout, withdraw } from '../../components/mypage/mypageApi.js'
import { MYPAGE_PATHS } from '../../components/mypage/mypagePaths.js'
import './AccountPage.css'

/**
 * 7-13 계정(로그아웃 · 회원 탈퇴). "회원 탈퇴"를 누르면 확인 다이얼로그("정말 떠나실 건가요?")가 열린다.
 * 서버 연동: 로그아웃 POST /api/auth/logout/(api/auth.md), 탈퇴 DELETE /api/users/me/(api/users.md). 요청과 토큰 정리는 mypageApi의 logout·withdraw.
 *  - 로그아웃은 서버 호출이 실패해도 이 기기의 토큰을 지우고 로그아웃한다.
 *  - 탈퇴는 서버가 성공해야 토큰을 지운다. 실패하면 다이얼로그 안에 오류와 "다시 시도"를 보여 주고 계정은 그대로다.
 * 가정:
 *  - 설정 화면으로 들어오는 길이 시안에 없어서 /mypage/account 주소로 직접 연다.
 *  - 로그아웃은 시안에 확인 화면이 없어서 바로 하고, 토스트를 보여 준 뒤 시작 화면(/start)으로 보낸다. 탈퇴 뒤에도 같다. 토스트 문구는 시안에 없어서 정했다.
 *  - 이동(/start)은 토큰을 지우기 직전에 한다. 먼저 지우면 SessionGate가 /login으로 보낸다.
 * 개발 중 확인용: 주소 뒤에 ?dialog=withdraw 를 붙이면 다이얼로그가 열린 채로 시작한다(시안 7-13).
 */
function AccountPage() {
  const navigate = useNavigate()
  const { openDialog, showToast, close } = useOverlay()
  const [searchParams] = useSearchParams()
  const autoOpened = useRef(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const openWithdrawDialog = () =>
    openDialog({
      label: '회원 탈퇴 확인',
      content: (
        <WithdrawDialog
          onStay={close}
          onWithdraw={async () => {
            await withdraw({ beforeClear: () => navigate(MYPAGE_PATHS.start, { replace: true }) })
            close()
            showToast('탈퇴 처리했어요')
          }}
        />
      ),
    })

  useEffect(() => {
    if (!import.meta.env.DEV || autoOpened.current) return
    if (searchParams.get('dialog') === 'withdraw') {
      autoOpened.current = true
      openWithdrawDialog()
    }

  }, [])

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    const { serverOk } = await logout({ beforeClear: () => navigate(MYPAGE_PATHS.start, { replace: true }) })
    showToast(serverOk ? '로그아웃했어요' : '이 기기에서 로그아웃했어요. 서버에는 알리지 못했어요')
  }

  return (
    <main className="account-page">
      <Header title="계정" />

      <div className="account-page__body">
        <div className="account-page__card">
          <button type="button" className="account-page__row" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? '로그아웃하는 중…' : '로그아웃'}
          </button>
          <button type="button" className="account-page__row account-page__row--danger" onClick={openWithdrawDialog}>
            회원 탈퇴
          </button>
        </div>
      </div>
    </main>
  )
}

export default AccountPage
