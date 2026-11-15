import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Button from '../../shared/ui/Button.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Input from '../../shared/ui/Input.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import HeaderSaveButton from '../../components/mypage/HeaderSaveButton.jsx'
import LeaveEditDialog from '../../components/mypage/LeaveEditDialog.jsx'
import LetterSignaturePreview from '../../components/mypage/LetterSignaturePreview.jsx'
import { checkNickname, fetchNickname, updateNickname } from '../../components/mypage/mypageApi.js'
import { MYPAGE_PATHS } from '../../components/mypage/mypagePaths.js'
import './NicknamePage.css'

const MAX_LENGTH = 10

/**
 * 7-9 닉네임 변경. 입력하면 편지 서명 미리보기가 바뀌고, 사용할 수 있는지 확인한다.
 * 데이터는 mock이다. 문서 레포 명세(api/auth.md 닉네임 확인, api/users.md 닉네임 변경)의 필드·코드를 따르지만 실제 API는 부르지 않는다.
 *  - 확인: { available, code }  code는 INVALID_NICKNAME(2~10자 아님) / NICKNAME_TAKEN(이미 있음)
 * 가정:
 *  - 설정 화면으로 들어오는 길이 시안에 없어서 /mypage/nickname 주소로 직접 연다.
 *  - 바뀐 게 없거나 사용할 수 없으면 저장 버튼(헤더, 아래)을 누를 수 없다.
 *  - 저장하면 토스트를 보여 주고 마이(/mypage)로 간다. 오류 문구(2~10자, 이미 사용 중)와 토스트 문구는 시안에 없어서 정했다.
 *  - 개발용 닉네임 중복 확인: 하늘빛, 갈매기, 귤껍질, 감자왕, 별빛, 바람은 이미 쓰는 닉네임으로 처리한다.
 *  - 저장하지 않고 나가기(7-10-3 팝업을 같이 쓴다): 닉네임을 처음 값과 다르게 바꾼 채(앞뒤 공백을 뺀 값 기준) 헤더 뒤로 가기를 누르면
 *    "저장하지 않고 나갈까요?"를 띄운다. "계속 수정할게요"는 팝업만 닫고, "저장 안 하고 나갈게요"는 바꾼 내용을 버리고 이전 화면으로 간다.
 *    앱이 BrowserRouter라서 브라우저·기기 뒤로 가기, 주소 이동, 새로고침은 막지 못한다.
 * 개발 중 확인용: 주소 뒤에 ?dialog=leave 를 붙이면 확인 팝업이 열린 채로 시작한다. 바꾼 값이 없어도 열린다.
 */
function NicknamePage() {
  const navigate = useNavigate()
  const { openDialog, showToast, close } = useOverlay()
  const [searchParams] = useSearchParams()
  const autoOpened = useRef(false)
  const [original, setOriginal] = useState(null)
  const [value, setValue] = useState('')
  const [status, setStatus] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const latestValue = useRef('')

  useEffect(() => {
    fetchNickname().then((nickname) => {
      setOriginal(nickname)
      setValue(nickname)
      latestValue.current = nickname
    })
  }, [])

  const handleChange = async (event) => {
    const next = event.target.value.slice(0, MAX_LENGTH)
    setValue(next)
    latestValue.current = next
    const result = await checkNickname(next)
    // 입력이 그 사이에 또 바뀌었다면 이전 확인 결과는 버린다
    if (latestValue.current === next) setStatus(result)
  }

  const trimmed = value.trim()
  const isChanged = original !== null && trimmed !== original
  const canSave = isChanged && status?.available === true && !isSaving
  // 처음 값 그대로이면 안내 문구를 숨긴다
  const message = isChanged ? status : null

  const handleSave = async () => {
    if (!canSave) return
    setIsSaving(true)
    try {
      await updateNickname(trimmed)
      showToast('닉네임을 바꿨어요')
      navigate(MYPAGE_PATHS.home)
    } catch (error) {
      setStatus({ available: false, tone: 'error', message: error.message })
      setIsSaving(false)
    }
  }

  const openLeaveDialog = () =>
    openDialog({
      label: '저장하지 않고 나가기 확인',
      content: (
        <LeaveEditDialog
          onStay={close}
          onLeave={() => {
            close()
            navigate(-1)
          }}
        />
      ),
    })

  // 바꾼 값이 있을 때만 확인한다. 저장 중에는 저장이 끝나면 알아서 이동하므로 건드리지 않는다.
  const handleBack = () => {
    if (isChanged && !isSaving) openLeaveDialog()
    else navigate(-1)
  }

  useEffect(() => {
    if (!import.meta.env.DEV || autoOpened.current) return
    if (searchParams.get('dialog') === 'leave') {
      autoOpened.current = true
      openLeaveDialog()
    }
    // 처음 한 번만 연다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="nickname-page">
      <Header title="닉네임 변경" onBack={handleBack} right={<HeaderSaveButton onClick={handleSave} disabled={!canSave} />} />

      <div className="nickname-page__body">
        <LetterSignaturePreview nickname={trimmed || original || ''} />

        <div className="nickname-page__field">
          <Input
            value={value}
            onChange={handleChange}
            maxLength={MAX_LENGTH}
            placeholder="닉네임을 입력해주세요"
            aria-label="닉네임"
            autoComplete="nickname"
            invalid={message?.tone === 'error'}
            className="nickname-page__input"
          />
          {message?.available && (
            <span className="nickname-page__check" aria-hidden="true">
              <Icon name="check" size={20} />
            </span>
          )}
        </div>

        <div className="nickname-page__help">
          <p className={`nickname-page__message${message ? ` is-${message.tone}` : ''}`} role="status">
            {message?.message ?? ''}
          </p>
          <span className="nickname-page__count">
            {value.length} / {MAX_LENGTH}
          </span>
        </div>

        <p className="nickname-page__notice">
          바꾼 닉네임은 이후에 보내는 편지부터
          <br />
          적용돼요. 이미 보낸 편지는 그대로예요
        </p>
      </div>

      <footer className="nickname-page__footer">
        <Button onClick={handleSave} disabled={!canSave}>
          저장하기
        </Button>
      </footer>
    </main>
  )
}

export default NicknamePage
