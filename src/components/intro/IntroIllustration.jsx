import peachLarge from '../../shared/assets/decorations/peach-circle-large.svg'
import peachMedium from '../../shared/assets/decorations/peach-circle-medium.svg'
import creamLarge from '../../shared/assets/decorations/cream-circle-large.svg'
import creamSmall from '../../shared/assets/decorations/cream-circle-small.svg'
import butterCircle from '../../shared/assets/decorations/butter-circle.svg'
import peachCircle from '../../shared/assets/decorations/peach-circle.svg'
import paginationDot from '../../shared/assets/decorations/pagination-dot.svg'
import startCircle from '../../shared/assets/decorations/start-circle.svg'
import firstLetter from '../../shared/assets/stamps/first-letter.svg'
import firstRoundtrip from '../../shared/assets/stamps/first-roundtrip.svg'

const ART = { peachLarge, peachMedium, creamLarge, creamSmall, butterCircle, peachCircle, paginationDot, startCircle, firstLetter, firstRoundtrip }

/** @param {{name: keyof typeof ART, className?: string, alt?: string}} props */
export function IntroArt({ name, className = '', alt = '' }) {
  return <img className={className} src={ART[name]} alt={alt} />
}

/** @param {{name: 'firstLetter'|'firstRoundtrip', label: string, number: string, className?: string}} props */
export function IntroStamp({ name, label, number, className = '' }) {
  return <div className={`intro-stamp ${className}`}><IntroArt name={name} /><span className="intro-stamp-brand">동글</span><span className="intro-stamp-number">No.{number}</span><span className="intro-stamp-label">{label}</span></div>
}
