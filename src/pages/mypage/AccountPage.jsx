import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import WithdrawDialog from '../../components/mypage/WithdrawDialog.jsx'
import { logout, withdraw } from '../../components/mypage/mypageApi.js'
import { MYPAGE_PATHS } from '../../components/mypage/mypagePaths.js'
import './AccountPage.css'

/**
 * 7-13 계정(로그아웃 · 회원 탈퇴). "회원 탈퇴"를 누르면 확인 다이얼로그("정말 떠나실 건가요?")가 열린다.
 * 데이터는 mock이다. 문서 레포 명세(api/auth.md 로그아웃, api/users.md 탈퇴)의 동작을 흉내 내지만 실제 API는 부르지 않는다.
 * 탈퇴는 아무것도 지우지 않는다(mock 동작).
 * 가정:
 *  - 설정 화면으로 들어오는 길이 시안에 없어서 /mypage/account 주소로 직접 연다.
 *  - 로그아웃은 시안에 확인 화면이 없어서 바로 하고, 토스트를 보여 준 뒤 시작 화면(/start)으로 보낸다. 탈퇴 뒤에도 같다. 토스트 문구는 시안에 없어서 정했다.
 * 개발 중 확인용: 주소 뒤에 ?dialog=withdraw 를 붙이면 다이얼로그가 열린 채로 시작한다(시안 7-13).
 */
function AccountPage() {
  const navigate = useNavigate()
  const { openDialog, showToast, close } = useOverlay()
  const [searchParams] = useSearchParams()
  const autoOpened = useRef(false)

  const openWithdrawDialog = () =>
    openDialog({
      label: '회원 탈퇴 확인',
      content: (
        <WithdrawDialog
          onStay={close}
          onWithdraw={async () => {
            await withdraw()
            close()
            showToast('탈퇴 처리했어요')
            navigate(MYPAGE_PATHS.start)
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
    // 처음 한 번만 연다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await logout()
    showToast('로그아웃했어요')
    navigate(MYPAGE_PATHS.start)
  }

  return (
    <main className="account-page">
      <Header title="계정" />

      <div className="account-page__body">
        <div className="account-page__card">
          <button type="button" className="account-page__row" onClick={handleLogout}>
            로그아웃
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
