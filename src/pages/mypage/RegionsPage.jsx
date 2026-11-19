import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import { regionLabel } from '../../shared/region/regions.js'
import HeaderSaveButton from '../../components/mypage/HeaderSaveButton.jsx'
import RegionSummaryCard from '../../components/mypage/RegionSummaryCard.jsx'
import useLeaveGuard from '../../components/mypage/useLeaveGuard.js'
import LoadError from '../../components/mypage/LoadError.jsx'
import RegionPickerSheet from '../../components/mypage/RegionPickerSheet.jsx'
import { fetchRegionSettings, saveRegions } from '../../components/mypage/mypageApi.js'
import { MYPAGE_PATHS } from '../../components/mypage/mypagePaths.js'
import './RegionsPage.css'

const sameRegions = (a, b) => a.length === b.length && a.every((item, index) => regionLabel(item) === regionLabel(b[index]))

/**
 * 지역 선택기(shared/region)의 id가 서버 지역 id라서 그대로 보낸다. VITE_API_MOCK=true(개발 전용)일 때만 mock이다.
 * 이미 저장된 지역에 id가 없으면(옛 프로필 값) 화면은 그대로 뜨고, 저장할 때 "지역을 다시 골라 주세요"로 안내한다. 다시 고르면 id가 채워진다.
 */
function RegionsPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { openSheet, showToast } = useOverlay()
  const [original, setOriginal] = useState(null)
  const [hometowns, setHometowns] = useState([])
  const [residence, setResidence] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoadError(null)
    fetchRegionSettings()
      .then((settings) => {
        if (cancelled) return
        setOriginal({ hometowns: settings.hometowns, residence: settings.residence })
        setHometowns(settings.hometowns)
        setResidence(settings.residence)
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const isReady = original !== null && residence !== null
  const isChanged =
    isReady &&
    (!sameRegions(hometowns, original.hometowns) || regionLabel(residence) !== regionLabel(original.residence))
  const canSave = isChanged && hometowns.length >= 1 && !isSaving

  const handleSave = async () => {
    if (!canSave) return
    setIsSaving(true)
    try {
      await saveRegions({ hometowns, residence })
      showToast('지역을 바꿨어요')
      navigate(state?.from === MYPAGE_PATHS.home ? MYPAGE_PATHS.home : MYPAGE_PATHS.settings, { replace: true })
    } catch (error) {
      showToast(error.message)
      setIsSaving(false)
    }
  }

  const handleBack = useLeaveGuard({ isChanged, isSaving })

  const openHometownSheet = () =>
    openSheet({
      title: '본가 지역',
      content: ({ close }) => (
        <RegionPickerSheet
          mode="hometown"
          initial={hometowns}
          onConfirm={(selected) => {
            setHometowns(selected)
            close()
          }}
        />
      ),
    })

  const openResidenceSheet = () =>
    openSheet({
      title: '거주 지역',
      content: ({ close }) => (
        <RegionPickerSheet
          mode="residence"
          initial={residence ? [residence] : []}
          hometowns={hometowns}
          onConfirm={(selected) => {
            setResidence(selected[0])
            close()
          }}
        />
      ),
    })

  if (loadError) return <LoadError error={loadError} onRetry={() => setAttempt((n) => n + 1)} />

  return (
    <main className="regions-page">
      <Header title="지역 설정" onBack={handleBack} right={<HeaderSaveButton onClick={handleSave} disabled={!canSave} />} />

      <div className="regions-page__body">
        {!isReady ? (
          <div className="regions-page__loading" aria-busy="true">
            <Skeleton height={64} radius={20} />
            <Skeleton height={64} radius={20} />
          </div>
        ) : (
          <>
            <h2 className="regions-page__label">본가 지역 (최대 3곳)</h2>
            <RegionSummaryCard
              chipLabel={`${hometowns.length}곳`}
              label={hometowns.map((region) => region.district || region.province).join(' · ')}
              ariaLabel="본가 지역 고르기"
              onClick={openHometownSheet}
            />

            <h2 className="regions-page__label regions-page__label--next">거주 지역</h2>
            <RegionSummaryCard
              chipLabel={residence.province}
              label={regionLabel(residence)}
              ariaLabel="거주 지역 고르기"
              onClick={openResidenceSheet}
            />

            <p className="regions-page__notice">
              <Mascot pose="face" size={56} />
              <span>
                바꾼 지역은 앞으로 쓰는 일기와
                <br />
                피드부터 적용돼요
              </span>
            </p>
          </>
        )}
      </div>
    </main>
  )
}

export default RegionsPage
