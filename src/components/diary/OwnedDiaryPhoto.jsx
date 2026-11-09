import { useEffect, useRef } from 'react'
import snow from './assets/snow-scene.svg'
import snowThumbnail from './assets/snow-thumbnail.svg'
import hotteok from './assets/hotteok-scene.svg'
import trail from './assets/trail-scene.svg'
import campus from './assets/campus-scene.svg'

const SCENES = { snow, hotteok, trail, campus }

/** @param {{photo: object|null, thumbnail?: boolean, alt?: string, className?: string}} props */
export default function OwnedDiaryPhoto({ photo, thumbnail = false, alt = '내 동네 풍경', className = '' }) {
  const image = useRef(null)
  const source = photo?.url || (thumbnail && photo?.key === 'snow' ? snowThumbnail : SCENES[photo?.key] || snow)
  useEffect(() => {
    if (!photo?.file || photo.url) return
    const url = URL.createObjectURL(photo.file)
    image.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [photo])
  return <img ref={image} className={className} src={source} alt={alt} />
}
