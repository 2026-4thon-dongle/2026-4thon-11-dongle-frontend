import Stamp from './Stamp.jsx'
import postmark from '../assets/reading/postmark.png'
import smallPostmark from '../assets/reading/postmark-small.png'
import wave from '../assets/reading/postmark-wave.svg'
import preview from '../assets/reading/photo-preview.svg'
import detail from '../assets/reading/photo-detail.svg'
import './DiaryPostcardParts.css'

/** @param {{stamp: {id: string, label: string, number: string}, size?: number}} props */
export function PostcardStamp({ stamp, size = 46 }) {
  return <div className="postcard-stamp" style={{ '--postcard-stamp-size': `${size}px` }}><Stamp id={stamp.id} size={size} alt={`${stamp.label} 우표`} /><span className="postcard-stamp-brand" aria-hidden="true">동글</span><span className="postcard-stamp-number" aria-hidden="true">No.{stamp.number}</span><span className="postcard-stamp-label" aria-hidden="true">{stamp.label}</span></div>
}

/** @param {{province: string, date: string, small?: boolean, waves?: boolean}} props */
export function Postmark({ province, date, small = false, waves = false }) {
  return <div className={`postcard-postmark ${small ? 'postcard-postmark--small' : ''}`} aria-hidden="true"><img src={small ? smallPostmark : postmark} alt="" width={small ? 40.56 : 52} height={small ? 40.56 : 52} /><span>{province}<br />{date}</span>{waves && <div className="postcard-postmark-waves"><img src={wave} alt="" /><img src={wave} alt="" /></div>}</div>
}

/** @param {{large?: boolean}} props */
export function DiaryPhoto({ large = false }) {
  return <div className={`postcard-photo ${large ? 'postcard-photo--large' : ''}`}><img src={large ? detail : preview} alt="노을 아래 초록 언덕을 담은 동네 풍경 일러스트" />{large && <span className="postcard-photo-tape" aria-hidden="true" />}</div>
}
