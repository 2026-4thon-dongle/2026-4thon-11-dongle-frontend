import { useEffect, useRef, useState } from 'react'
import Icon from '../../shared/ui/Icon.jsx'
import { DIARY_IMAGE_MAX_BYTES, DIARY_IMAGE_TYPES as PHOTO_TYPES } from '../../shared/api/ownedDiary.js'

/** @param {{file: File|null, onChange: (file: File|null) => void, disabled?: boolean}} props */
export default function DiaryPhotoInput({ file, onChange, disabled = false }) {
  const input = useRef(null)
  const preview = useRef(null)
  const [error, setError] = useState('')
  const request = useRef(0)
  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    preview.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])
  useEffect(() => () => { request.current += 1 }, [])
  async function select(event) {
    const next = event.target.files?.[0]
    event.target.value = ''
    if (!next) return
    const version = ++request.current
    if (!PHOTO_TYPES.includes(next.type)) { setError('JPG, PNG, WEBP 사진을 선택해주세요'); return }
    if (next.size > DIARY_IMAGE_MAX_BYTES) { setError('사진은 5MB 이하로 첨부해주세요'); return }
    const url = URL.createObjectURL(next)
    try {
      const image = new Image()
      image.src = url
      await image.decode()
      if (version === request.current) { setError(''); onChange(next) }
    } catch { if (version === request.current) setError('사진을 불러올 수 없어요. 다른 사진을 선택해주세요') }
    finally { URL.revokeObjectURL(url) }
  }
  return <div className="diary-photo-field">
    <div className="diary-photo-row"><button type="button" className={`diary-photo-add ${file ? 'has-photo' : ''}`} disabled={disabled} aria-label={file ? '일기 사진 바꾸기' : '일기 사진 추가'} onClick={() => input.current.click()}>{file ? <img ref={preview} alt="첨부한 일기 사진" /> : <Icon name="camera" size={36} />}</button><p className="text-caption-11">사진은 선택이에요 (최대 1장){file && <span className="diary-photo-name">{file.name}</span>}</p>{file && <button type="button" className="diary-photo-remove" disabled={disabled} aria-label="사진 삭제" onClick={() => { request.current += 1; setError(''); onChange(null) }}><Icon name="close" size={20} /></button>}</div>
    <input className="first-diary-visually-hidden" ref={input} type="file" accept={PHOTO_TYPES.join(',')} aria-label="일기 사진 파일" disabled={disabled} onChange={select} />
    {error && <p className="first-diary-error text-caption-11" role="alert">{error}</p>}
  </div>
}
