import { useContext, useEffect } from 'react'
import { OverlayContext } from '../../shared/ui/overlayContext.js'
import Loading from '../../shared/feedback/Loading.jsx'
import Button from '../../shared/ui/Button.jsx'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import Icon from '../../shared/ui/Icon.jsx'
import Chip from '../../shared/ui/Chip.jsx'
import Mascot from '../../shared/ui/Mascot.jsx'
import ErrorScreen from '../../shared/feedback/ErrorScreen.jsx'
import useReadingDiary from '../../shared/hooks/useReadingDiary.js'
import { isReadingDemo, visibleReadingDiaries, loadReadingFeed, startHomeVisit } from '../../shared/api/readingDiary.js'
import DiaryFeedCard from '../../components/home/DiaryFeedCard.jsx'
import EmptyDiaryFeed from '../../components/home/EmptyDiaryFeed.jsx'
import unreadDot from '../../shared/assets/reading/unread-dot.svg'
import './HomePage.css'

const ALL_REGIONS = ['전체', '강원', '부산', '제주', '전남', '경기', '서울', '대구', '인천', '광주', '대전', '울산', '세종', '충북', '충남', '전북', '경북', '경남']

export default function HomePage() {
  const state = useReadingDiary()
  const overlay = useContext(OverlayContext)
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const away = params.get('tab') === 'all'
  const hometowns = state.profile?.hometowns || []
  const homeRegions = ['전체', ...new Set(hometowns.map((region) => region.district || region.province))]
  const regions = away ? isReadingDemo ? ALL_REGIONS : ['전체', ...state.regions.map((item) => item.short_name)] : homeRegions
  const requested = params.get('region') || '전체'
  const selected = regions.includes(requested) ? requested : '전체'
  useEffect(() => { startHomeVisit() }, [])
  useEffect(() => { loadReadingFeed({ away, region: requested }) }, [away, requested])
  const diaries = visibleReadingDiaries(state).filter((diary) => {
    if (!isReadingDemo) return true
    if (diary.authorId === state.profile?.id) return !away && diary.visibility !== 'private' && (selected === '전체' || diary.province === selected || diary.district === selected)
    const match = hometowns.some((region) => region.province === diary.province && (!region.district || region.district === diary.district))
    const residence = state.profile?.residence
    if (away ? match || (residence?.province === diary.province && residence?.district === diary.district) : !match) return false
    return selected === '전체' || diary.province === selected || diary.district === selected
  })
  const items = isReadingDemo && params.get('empty') === '1' ? [] : diaries
  const newCount = isReadingDemo ? items.length : state.newCount
  const emptyHometown = !away && selected === '전체' && !items.length
  const unread = state.unreadCount > 0 || state.notifications.some((notice) => notice.unread && !state.blockedAuthorIds.includes(notice.authorId))
  const from = `${location.pathname}${location.search}`
  function changeTab(nextAway) { setParams(nextAway ? { tab: 'all' } : {}) }
  function changeRegion(region) { setParams({ ...(away ? { tab: 'all' } : {}), ...(region !== '전체' ? { region } : {}) }) }
  function tabKey(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? false : event.key === 'End' ? true : !away
    changeTab(next)
    event.currentTarget.querySelectorAll('[role="tab"]')[next ? 1 : 0]?.focus()
  }
  if (!isReadingDemo && state.error) return <ErrorScreen description={state.error.message} hint="" onRetry={() => loadReadingFeed({ away, region: requested })} />
  if (!isReadingDemo && (!state.profile || (state.loading && !items.length))) return <Loading />
  return <main className="reading-home">
    <header className="reading-home-header"><h1>동글</h1><div><Link className="reading-game" to="/delivery-game"><Icon name="game" size={24} /><span>배달 게임</span></Link><Link className="reading-bell" to="/notification" aria-label={unread ? '새 알림 보기' : '알림 보기'}><Icon name="bell" />{unread && <img src={unreadDot} alt="" />}</Link></div></header>
    <div className="reading-tabs" role="tablist" aria-label="일기 피드" onKeyDown={tabKey}><button type="button" role="tab" id="hometown-feed-tab" aria-selected={!away} tabIndex={away ? -1 : 0} aria-controls="reading-feed" onClick={() => changeTab(false)}>고향</button><button type="button" role="tab" id="away-feed-tab" aria-selected={away} tabIndex={away ? 0 : -1} aria-controls="reading-feed" onClick={() => changeTab(true)}>전체 타지</button></div>
    {away && <p className="reading-away-description text-caption-11">내 본가·거주지 말고, 다른 동네의 하루</p>}
    {<nav className="reading-region-filters" aria-label="지역 필터">{regions.map((region) => <Chip key={region} variant={region === selected ? 'selected' : 'default'} onClick={() => changeRegion(region)}>{region}</Chip>)}</nav>}
    {!away && <aside className={`reading-greeting ${emptyHometown ? 'reading-greeting--empty' : ''}`}><Mascot pose="smile" size={60} /><p className="text-label-15">{newCount > 0 ? <>{state.profile.nickname}님, {isReadingDemo && selected !== '전체' ? selected : homeRegions.slice(1).join(' · ')}에서<br />새 일기 {newCount}편이 도착했어요!</> : "도착한 일기가 아직 없어요!"}</p></aside>}
    <section id="reading-feed" role="tabpanel" aria-labelledby={away ? 'away-feed-tab' : 'hometown-feed-tab'}>
      {items.length ? <>{!away && <p className="reading-feed-label text-caption-11">오늘 우체통에 도착한 고향 소식</p>}<div className={away ? 'reading-feed-grid' : 'reading-feed-list'}>{items.map((diary) => <DiaryFeedCard key={diary.id} diary={diary} compact={away} from={from} />)}</div></> : <EmptyDiaryFeed region={selected === '전체' ? away ? '다른 동네' : [hometowns[0]?.province, hometowns[0]?.district].filter(Boolean).join(' ') : selected} onAll={() => changeTab(true)} />}
    </section>
    {!isReadingDemo && state.next && <Button className={away ? 'reading-away-load-more' : undefined} disabled={state.loading} onClick={() => loadReadingFeed({ away, region: requested, page: state.next }).catch((error) => overlay?.showToast(error.message))}>{state.loading ? '불러오는 중…' : '더 보기'}</Button>}
    {isReadingDemo && <p className="reading-demo text-caption-11">개발용 미리보기 · 사용자·일기·알림은 예시 데이터예요</p>}
  </main>
}
