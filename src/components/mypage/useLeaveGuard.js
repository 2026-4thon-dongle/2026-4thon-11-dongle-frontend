import { createElement, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useOverlay from '../../shared/hooks/useOverlay.js'
import LeaveEditDialog from './LeaveEditDialog.jsx'
import { MYPAGE_PATHS } from './mypagePaths.js'

/**
 * 저장하지 않고 나가기(7-10-3) 확인. 7-9 닉네임·7-10 지역 설정이 같이 쓴다. 헤더 뒤로 가기에 넘길 함수를 돌려준다.
 *  - 바꾼 값이 있고 저장 중이 아니면 "저장하지 않고 나갈까요?"를 띄운다. "계속 수정할게요"는 팝업만 닫고,
 *    "저장 안 하고 나갈게요"는 바꾼 내용을 버리고 이전 화면으로 간다. 저장 중에는 저장이 끝나면 알아서 이동하므로 묻지 않는다.
 *  - 주소로 바로 들어와 앞 기록이 없으면 이전 화면 대신 설정(7-1-1)으로 간다(앱 밖으로 나가지 않게).
 *  - 앱이 BrowserRouter라서 브라우저·기기 뒤로 가기, 주소 이동, 새로고침은 막지 못한다.
 *  - 개발 중 확인용: 주소 뒤에 ?dialog=leave 를 붙이면 확인 팝업이 열린 채로 시작한다. 바꾼 값이 없어도 열린다.
 * @param {{ isChanged: boolean, isSaving: boolean }} state
 */
export default function useLeaveGuard({ isChanged, isSaving }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { openDialog, close } = useOverlay()
  const [searchParams] = useSearchParams()
  const autoOpened = useRef(false)

  const goBack = () => {
    if (location.key === 'default') navigate(MYPAGE_PATHS.settings, { replace: true })
    else navigate(-1)
  }

  const openLeaveDialog = () =>
    openDialog({
      label: '저장하지 않고 나가기 확인',
      content: createElement(LeaveEditDialog, {
        onStay: close,
        onLeave: () => {
          close()
          goBack()
        },
      }),
    })

  useEffect(() => {
    if (!import.meta.env.DEV || autoOpened.current) return
    if (searchParams.get('dialog') === 'leave') {
      autoOpened.current = true
      openLeaveDialog()
    }
    // 처음 한 번만 연다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return () => {
    if (isChanged && !isSaving) openLeaveDialog()
    else goBack()
  }
}
