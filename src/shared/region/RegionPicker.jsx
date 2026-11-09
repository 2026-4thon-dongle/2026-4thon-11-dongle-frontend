import { useState } from 'react'
import { CITIES, DISTRICTS, METROPOLITAN, PROVINCES, regionLabel } from './regions.js'
import Icon from '../ui/Icon.jsx'
import route from '../assets/decorations/region-route.svg'
import './RegionPicker.css'

/** @param {{mode: 'hometown'|'residence', value: Array<{province: string, district: string}>, onChange: (regions: Array<{province: string, district: string}>) => void, hometowns?: Array<{province: string, district: string}>}} props */
export default function RegionPicker({ mode, value, onChange, hometowns = [] }) {
  const home = mode === 'hometown'
  const [province, setProvince] = useState(value[0]?.province || (home ? '충남' : '서울'))
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState('')
  const details = home ? CITIES[province] || [] : DISTRICTS[province] || []
  const shown = home || expanded ? details : details.slice(0, 8)
  const full = home && value.length >= 3
  const hasProvince = (name) => value.some((item) => item.province === name)
  const hasRegion = (district) => value.some((item) => item.province === province && item.district === district)
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
    if (home && METROPOLITAN.includes(next)) choose({ province: next, district: '' })
    if (!home && next !== province) onChange([])
    if (!home && next === '세종') onChange([{ province: next, district: '세종 전체' }])
  }
  return <div className={`region-picker ${home ? 'region-picker--home' : ''}`}>
    {home && <><span className="region-count text-label-15" aria-live="polite">{value.length}/3</span><div className="region-selected" aria-label="선택한 본가 지역">{value.length ? value.map((item) => <button type="button" key={regionLabel(item)} onClick={() => onChange(value.filter((entry) => entry !== item))} aria-label={`${regionLabel(item)} 삭제`}>{regionLabel(item)}<Icon name="close" size={16} /></button>) : <span className="text-caption-11">본가 지역을 최대 3곳 골라주세요</span>}</div></>}
    <div className="region-chips" aria-label="시·도 선택">{PROVINCES.map((item) => {
      const direct = home && METROPOLITAN.includes(item)
      const selected = hasProvince(item)
      const active = !direct && province === item
      return <button type="button" key={item} disabled={full && !selected} aria-pressed={direct ? selected : undefined} aria-expanded={!direct ? province === item : undefined} className={`${active ? 'is-active' : ''} ${home && selected && !active ? 'is-picked' : ''}`} onClick={() => chooseProvince(item)}>{item}</button>
    })}</div>
    {home && <hr className="region-divider" />}
    {details.length > 0 && <section className="region-details" aria-label="상세 지역 선택"><h3 className={home ? 'text-label-15' : 'text-title-17'}>{home ? `${province}에서 고르기` : `${province}의 어느 ${METROPOLITAN.includes(province) ? '구' : '시·군'}인가요?`}</h3>{home && <p className="text-caption-11">· 광역시는 시·군 없이 바로 선택돼요</p>}<div className="region-chips">{shown.map((district) => <button type="button" key={district} disabled={full && !hasRegion(district)} className={hasRegion(district) ? 'is-active' : ''} aria-pressed={hasRegion(district)} onClick={() => choose({ province, district })}>{district}</button>)}{!home && details.length > 8 && <button type="button" className="is-picked" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? '접기' : `+${details.length - 8}`}</button>}</div></section>}
    {error && <p className="auth-caption auth-error" role="alert">{error}</p>}
    {!home && value.length > 0 && <div className="region-summary"><div className="region-route"><span><Icon name="pin" size={16} />본가 {hometowns.length}곳</span><img className="region-route-line" src={route} alt="" /><span><Icon name="pin" size={16} />{value[0].province}</span></div><p className="text-label-15">{hometowns.map((item) => item.district || item.province).join(' · ')} → {value[0].district || value[0].province}</p></div>}
  </div>
}
