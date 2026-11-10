import { Link } from 'react-router-dom'
import Icon from '../../shared/ui/Icon.jsx'
import { DiaryPhoto, PostcardStamp, Postmark } from '../../shared/ui/DiaryPostcardParts.jsx'
import { diaryDetailUrl, diaryReplyUrl } from '../../shared/utils/readingDiaryRoutes.js'

/** @param {{diary: object, compact?: boolean, from: string}} props */
export default function DiaryFeedCard({ diary, compact = false, from }) {
  const target = diaryDetailUrl(diary.id)
  return <article className={`feed-postcard ${compact ? 'feed-postcard--compact' : ''}`} aria-label={`${diary.nickname}의 일기`}>
    <div className="postcard-airmail" aria-hidden="true" />
    <div className="feed-postcard-stamp"><PostcardStamp stamp={diary.stamp} size={compact ? 36 : 46} /></div>
    <div className="feed-postcard-postmark"><Postmark province={diary.province} date={diary.postmarkDate} small={compact} waves={!compact} /></div>
    <Link className="feed-postcard-content" to={target} state={{ from }} aria-label={`${diary.nickname}의 일기 읽기`}><h2>{compact ? <>From.<br />{diary.nickname}</> : `From. ${diary.nickname}`}</h2>{!compact && <p className="feed-postcard-meta text-caption-11">{diary.province} {diary.district} · {diary.ago}</p>}<p className="feed-postcard-preview">{diary.preview}</p></Link>
    {!compact && diary.photo && <Link className="feed-postcard-photo" to={target} state={{ from }} aria-label={`${diary.nickname}의 사진과 일기 보기`}><DiaryPhoto /></Link>}
    <div className="feed-postcard-actions"><Link className="feed-postcard-reply" to={diaryReplyUrl(diary)}>{!compact && <Icon name="mail" size={18} />}{compact ? '편지로 답장' : '편지로 답장하기'}</Link>{!compact && <Link className="feed-postcard-more" to={target} state={{ from }}>읽기 ›</Link>}</div>
    {!compact && <div className="postcard-airmail postcard-airmail--bottom" aria-hidden="true" />}
  </article>
}
