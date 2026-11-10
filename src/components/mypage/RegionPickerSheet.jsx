import { useState } from 'react'
import Button from '../../shared/ui/Button.jsx'
import RegionPicker from '../../shared/region/RegionPicker.jsx'
import './RegionPickerSheet.css'

/**
 * 바텀시트 안에서 지역을 고르는 내용(7-10). 열고 닫는 틀은 shared의 useOverlay().openSheet가 맡는다.
 * 시안에 이 시트 화면이 없어서, 공용 지역 선택기(shared/region의 RegionPicker)를 그대로 넣었다. (가정)
 * @param {'hometown'|'residence'} mode 본가(1~3곳) / 거주(1곳)
 * @param {Array<{province: string, district: string}>} initial 처음 선택된 지역
 * @param {Array<{province: string, district: string}>} [hometowns] 거주 지역을 고를 때 보여 줄 본가 지역
 * @param {(regions: Array<{province: string, district: string}>) => void} onConfirm "선택 완료"를 눌렀을 때
 */
function RegionPickerSheet({ mode, initial, hometowns = [], onConfirm }) {
  const [selected, setSelected] = useState(initial)

  return (
    <div className="region-sheet">
      <RegionPicker mode={mode} value={selected} onChange={setSelected} hometowns={hometowns} />
      <div className="region-sheet__action">
        <Button disabled={selected.length === 0} onClick={() => onConfirm(selected)}>
          선택 완료
        </Button>
      </div>
    </div>
  )
}

export default RegionPickerSheet
