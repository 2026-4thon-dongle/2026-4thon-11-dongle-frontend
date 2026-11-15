import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import Skeleton from '../../shared/ui/Skeleton.jsx'
import useOverlay from '../../shared/hooks/useOverlay.js'
import { regionLabel } from '../../shared/region/regions.js'
import HeaderSaveButton from '../../components/mypage/HeaderSaveButton.jsx'
import RegionSummaryCard from '../../components/mypage/RegionSummaryCard.jsx'
import LeaveEditDialog from '../../components/mypage/LeaveEditDialog.jsx'
import RegionPickerSheet from '../../components/mypage/RegionPickerSheet.jsx'
import { fetchRegionSettings, saveRegions } from '../../components/mypage/mypageApi.js'
import { MYPAGE_PATHS } from '../../components/mypage/mypagePaths.js'
import './RegionsPage.css'

const sameRegions = (a, b) => a.length === b.length && a.every((item, index) => regionLabel(item) === regionLabel(b[index]))

/**
 * 7-10 지역 설정 수정. 본가 지역(1~3곳), 거주 지역(1곳)을 고르고 저장한다.
 * 데이터는 mock이다. 문서 레포 명세(api/users.md PUT /api/users/me/regions/: hometown_region_ids[1~3], residence_region_id)를
 * 따르지만 실제 API는 부르지 않는다. 지역 id는 임시 값이다.
 * 가정:
 *  - 설정 화면으로 들어오는 길이 시안에 없어서 /mypage/regions 주소로 직접 연다. 7-1의 "지역 수정 ›"도 이 주소로 온다.
 *  - 지역 카드를 누르면 바텀시트에 공용 지역 선택기(shared/region)를 띄운다. 이 시트는 시안에 없다.
 *  - 바뀐 게 없으면 저장을 누를 수 없다. 저장하면 토스트를 보여 주고 마이(/mypage)로 간다. 토스트 문구는 시안에 없어서 정했다.
 *  - 저장하지 않고 나가기(7-10-3): 바꾼 값이 있을 때 헤더의 뒤로 가기를 누르면 확인 팝업("저장하지 않고 나갈까요?")을 띄운다.
 *    "계속 수정할게요"는 팝업만 닫고, "저장 안 하고 나갈게요"는 바꾼 내용을 버리고 이전 화면으로 간다. 딤이나 Esc로 닫으면 계속 수정하는 것과 같다.
 *    시안에 닫기 방법이 따로 없어서 shared 팝업의 기본 동작을 따랐다.
 *    앱이 BrowserRouter라서 useBlocker를 쓸 수 없다. 브라우저·기기 뒤로 가기와 주소창 이동, 새로고침은 막지 못한다.
 * 개발 중 확인용: 주소 뒤에 ?dialog=leave 를 붙이면 확인 팝업이 열린 채로 시작한다(시안 7-10-3). 바꾼 값이 없어도 열린다.
 */
function RegionsPage() {
  const navigate = useNavigate()
  const { openSheet, openDialog, showToast, close } = useOverlay()
  const [searchParams] = useSearchParams()
  const autoOpened = useRef(false)
  const [original, setOriginal] = useState(null)
  const [hometowns, setHometowns] = useState([])
  const [residence, setResidence] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchRegionSettings().then((settings) => {
      if (cancelled) return
      setOriginal({ hometowns: settings.hometowns, residence: settings.residence })
      setHometowns(settings.hometowns)
      setResidence(settings.residence)
    })
    return () => {
      cancelled = true
    }
  }, [])

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
      navigate(MYPAGE_PATHS.home)
    } catch (error) {
      showToast(error.message)
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
