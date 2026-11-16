import { useEffect, useRef, useState } from 'react'
import Icon from '../../shared/ui/Icon.jsx'
import OwnedDiaryPhoto from './OwnedDiaryPhoto.jsx'

const TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** @param {{photo: object|null, onChange: (photo: object|null) => void, editing: boolean, province: string, disabled?: boolean}} props */
export default function OwnedDiaryPhotoField({ photo, onChange, editing, province, disabled = false }) {
  const input = useRef(null), generation = useRef(0)
  const [error, setError] = useState('')
  useEffect(() => () => { generation.current += 1 }, [])
  async function select(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const request = ++generation.current
    if (!TYPES.includes(file.type)) { setError('JPG, PNG, WEBP 사진을 선택해주세요'); return }
    if (file.size > 5 * 1024 * 1024) { setError('사진은 5MB 이하로 첨부해주세요'); return }
    const url = URL.createObjectURL(file)
    try { const image = new Image(); image.src = url; await image.decode(); if (generation.current === request) { onChange({ file }); setError('') } }
    catch { if (generation.current === request) setError('사진을 불러올 수 없어요. 다른 사진을 골라주세요') }
    finally { URL.revokeObjectURL(url) }
  }
  return <div className="owned-photo-field"><div className="owned-photo-row"><div className="owned-photo-control"><button type="button" className="owned-photo-add" disabled={disabled || Boolean(photo)} aria-label={photo ? '첨부한 일기 사진' : '일기 사진 추가'} onClick={() => input.current.click()}>{photo ? <OwnedDiaryPhoto photo={photo} thumbnail alt="첨부한 일기 사진" /> : <><Icon name="camera" size={32} /><span className="text-caption-11">0/1</span></>}</button>{photo && <button type="button" className="owned-photo-remove" aria-label="사진 삭제" disabled={disabled} onClick={() => { generation.current += 1; setError(''); onChange(null) }}><Icon name="close" size={20} /></button>}</div><p className="text-caption-11">{editing && photo ? <>사진을 바꾸려면 X를 누르고<br />새로 올려주세요</> : <>사진은 선택이에요 (최대 1장)<br />안 올리면 {province} 기본 이미지가 들어가요</>}</p></div><input type="file" ref={input} className="owned-sr-only" accept={TYPES.join(',')} aria-label="일기 사진 파일" onChange={select} disabled={disabled || Boolean(photo)} />{error && <p className="owned-error text-caption-11" role="alert">{error}</p>}</div>
}
