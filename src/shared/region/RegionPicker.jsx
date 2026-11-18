import { useState } from 'react'
import { isApiDemo } from '../api/client.js'
import { CITIES, DISTRICTS, METROPOLITAN, PROVINCES, regionLabel } from './regions.js'
import { buildRegionTree } from './regionTree.js'
import useRegions from './useRegions.js'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import route from '../assets/decorations/region-route.svg'
import './RegionPicker.css'

let demoTree = null
function getDemoTree() {
  if (demoTree) return demoTree
  let nextId = 1000
  const regions = PROVINCES.map((name, index) => {
    const metropolitan = METROPOLITAN.includes(name)
    const children = name === '세종' ? [] : (DISTRICTS[name] || []).map((district) => ({
      id: nextId++,
      name: district,
      can_be_hometown: !metropolitan && Boolean(CITIES[name]),
      can_be_residence: true,
    }))
    return { id: index + 1, name, short_name: name, is_metropolitan: metropolitan, can_be_hometown: metropolitan, can_be_residence: name === '세종', children }
  })
  demoTree = buildRegionTree(regions)
  return demoTree
}

export default function RegionPicker(props) {
  if (isApiDemo) return <RegionPickerView tree={getDemoTree()} {...props} />
  return <ServerRegionPicker {...props} />
}

function ServerRegionPicker(props) {
  const { tree, error, retry } = useRegions()
  if (error) {
    return <div className="region-picker"><p className="auth-caption auth-error" role="alert">{error.message}</p><Button variant="secondary" onClick={retry}>다시 시도</Button></div>
  }
  if (!tree) return <div className="region-picker" aria-busy="true"><p className="text-caption-11" role="status">지역을 불러오는 중이에요</p></div>
  return <RegionPickerView tree={tree} {...props} />
}

function RegionPickerView({ tree, mode, value, onChange, hometowns = [] }) {
  const { provinces, metropolitan, byProvince } = tree
  const home = mode === 'hometown'
  const [province, setProvince] = useState(byProvince[value[0]?.province] ? value[0].province : null)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState('')
  const current = byProvince[province]
  const details = current ? (home ? current.hometowns : current.residences) : []
  const shown = home || expanded ? details : details.slice(0, 8)
  const full = home && value.length >= 3
  const hasProvince = (name) => value.some((item) => item.province === name)
  const hasRegion = (district) => value.some((item) => item.province === province && item.district === district)
  const isDirect = (name) => byProvince[name].hometownDirect
  function choose(region) {
    setError('')
    if (!home) { onChange([region]); return }
    const exists = value.some((item) => regionLabel(item) === regionLabel(region))
    if (exists) onChange(value.filter((item) => regionLabel(item) !== regionLabel(region)))
    else if (value.length < 3) onChange([...value, region])
    else setError('본가 지역은 최대 3곳까지 고를 수 있어요. 먼저 선택한 지역을 삭제해주세요.')
  }
  function chooseProvince(next) {
    if (full && !hasProvince(next)) return
    setProvince(next); setExpanded(false); setError('')
    if (home && isDirect(next)) choose({ province: next, district: '', id: byProvince[next].id })
    if (!home && next !== province) onChange([])
    if (!home && byProvince[next].residenceDirect) onChange([{ province: next, district: byProvince[next].residences[0].district, id: byProvince[next].id }])
  }
  return <div className={`region-picker ${home ? 'region-picker--home' : ''}`}>
    {home && <><span className="region-count text-label-15" aria-live="polite">{value.length}/3</span><div className="region-selected" role="group" aria-label="선택한 본가 지역">{value.length ? value.map((item) => <button type="button" key={regionLabel(item)} onClick={() => onChange(value.filter((entry) => entry !== item))} aria-label={`${regionLabel(item)} 삭제`}>{regionLabel(item)}<Icon name="close" size={16} /></button>) : <span className="text-caption-11">본가 지역을 최대 3곳 골라주세요</span>}</div></>}
    <div className="region-chips" role="group" aria-label="시·도 선택">{provinces.map((item) => {
      const direct = home && byProvince[item].hometownDirect
      const selected = hasProvince(item)
      const active = !direct && province === item
      return <button type="button" key={item} disabled={full && !selected} aria-pressed={direct ? selected : undefined} aria-expanded={!direct ? province === item : undefined} className={`${active ? 'is-active' : ''} ${home && selected && !active ? 'is-picked' : ''}`} onClick={() => chooseProvince(item)}>{item}</button>
    })}</div>
    {home && <hr className="region-divider" />}
    {details.length > 0 && <section className="region-details" aria-label="상세 지역 선택"><h3 className={home ? 'text-label-15' : 'text-title-17'}>{home ? `${province}에서 고르기` : `${province}의 어느 ${metropolitan.includes(province) ? '구' : '시·군'}인가요?`}</h3>{home && <p className="text-caption-11">· 광역시는 시·군 없이 바로 선택돼요</p>}<div className="region-chips">{shown.map((item) => <button type="button" key={item.id} disabled={full && !hasRegion(item.district)} className={hasRegion(item.district) ? 'is-active' : ''} aria-pressed={hasRegion(item.district)} onClick={() => choose({ province, district: item.district, id: item.id })}>{item.district}</button>)}{!home && details.length > 8 && <button type="button" className="is-picked" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? '접기' : `+${details.length - 8}`}</button>}</div></section>}
    {error && <p className="auth-caption auth-error" role="alert">{error}</p>}
    {!home && value.length > 0 && <div className="region-summary"><div className="region-route"><span><Icon name="pin" size={16} />본가 {hometowns.length}곳</span><img className="region-route-line" src={route} alt="" /><span><Icon name="pin" size={16} />{value[0].province}</span></div><p className="text-label-15">{hometowns.map((item) => item.district || item.province).join(' · ')} → {value[0].district || value[0].province}</p></div>}
  </div>
}
