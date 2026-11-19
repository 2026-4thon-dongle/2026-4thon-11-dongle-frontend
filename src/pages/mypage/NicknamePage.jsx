import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Button from '../../shared/ui/Button.jsx'
import Icon from '../../shared/ui/Icon.jsx'
import Input from '../../shared/ui/Input.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import HeaderSaveButton from '../../components/mypage/HeaderSaveButton.jsx'
import useLeaveGuard from '../../components/mypage/useLeaveGuard.js'
import LetterSignaturePreview from '../../components/mypage/LetterSignaturePreview.jsx'
import LoadError from '../../components/mypage/LoadError.jsx'
import { checkNickname, fetchNickname, updateNickname } from '../../components/mypage/mypageApi.js'
import { nicknameErrorMessage } from '../../components/mypage/mypageMapper.js'
import { MYPAGE_PATHS } from '../../components/mypage/mypagePaths.js'
import './NicknamePage.css'

const MAX_LENGTH = 10

/**
 *  - 확인: { available, code }  code는 INVALID_NICKNAME(2~10자 아님) / NICKNAME_TAKEN(이미 있음)
 *  - 입력을 멈추고 0.4초 뒤에 확인한다(글자마다 서버를 부르지 않는다). 확인하지 못하면 안내 문구로 알리고 저장할 수 없다.
 * 가정:
 *  - 개발용(VITE_API_MOCK=true) 닉네임 중복 확인: 하늘빛, 갈매기, 귤껍질, 감자왕, 별빛, 바람은 이미 쓰는 닉네임으로 처리한다.
 */
function NicknamePage() {
  const navigate = useNavigate()
  const { showToast } = useOverlay()
  const [original, setOriginal] = useState(null)
  const [value, setValue] = useState('')
  const [status, setStatus] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoadError(null)
    fetchNickname()
      .then((nickname) => {
        if (cancelled) return
        setOriginal(nickname)
        setValue(nickname)
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const trimmed = value.trim()

  // 입력을 멈추면 사용할 수 있는지 확인한다. 그 사이 입력이 또 바뀌면 이전 확인 결과는 버린다.
  useEffect(() => {
    setStatus(null)
    if (original === null || trimmed === original || trimmed === '') return undefined
    let cancelled = false
    const timer = setTimeout(() => {
      checkNickname(trimmed)
        .then((result) => {
          if (!cancelled) setStatus(result)
        })
        .catch(() => {
          if (!cancelled) setStatus({ available: false, tone: 'error', message: '닉네임을 확인하지 못했어요. 잠시 후 다시 입력해주세요' })
        })
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [trimmed, original])

  const handleChange = (event) => {
    setValue(event.target.value.slice(0, MAX_LENGTH))
  }

  const isChanged = original !== null && trimmed !== original
  const canSave = isChanged && status?.available === true && !isSaving
  const message = isChanged ? status : null

  const handleSave = async () => {
    if (!canSave) return
    setIsSaving(true)
    try {
      await updateNickname(trimmed)
      showToast('닉네임을 바꿨어요')
      navigate(MYPAGE_PATHS.settings)
    } catch (error) {
      setStatus({ available: false, tone: 'error', message: nicknameErrorMessage(error.code) ?? error.message })
      setIsSaving(false)
    }
  }

  const handleBack = useLeaveGuard({ isChanged, isSaving })

  if (loadError) return <LoadError error={loadError} onRetry={() => setAttempt((n) => n + 1)} />

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
