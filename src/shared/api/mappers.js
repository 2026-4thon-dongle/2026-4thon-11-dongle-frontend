// Server contracts stay snake_case; existing screens keep their view models.
export function mapRegion(region) {
  if (!region) return null
  const parts = (region.full_name || region.name || '').split(' ')
  return { ...region, province: region.sido || ({ 서울특별시: '서울', 부산광역시: '부산', 대구광역시: '대구', 인천광역시: '인천', 광주광역시: '광주', 대전광역시: '대전', 울산광역시: '울산', 세종특별자치시: '세종', 경기도: '경기', 강원특별자치도: '강원', 충청북도: '충북', 충청남도: '충남', 전북특별자치도: '전북', 전라남도: '전남', 경상북도: '경북', 경상남도: '경남', 제주특별자치도: '제주' }[parts[0]] || parts[0]), district: parts.length > 1 ? parts.slice(1).join(' ').replace(/([가-힣]{2,})[시군구]$/, '$1') : '' }
}
export function mapProfile(user) {
  return { ...user, id: String(user.id), hometowns: (user.hometowns || []).map(mapRegion), residence: mapRegion(user.residence) }
}
// 3-5 「{작성자 지역}까지 약 6시간 걸려 도착해요」. 1시간이 안 되면(데모 모드 1분 등) 분으로 쓴다.
function deliveryLabel(delivery) {
  if (!delivery) return '편지는 실제 거리만큼 천천히 배달돼요'
  const minutes = delivery.duration_minutes
  const time = minutes < 60 ? `${minutes}분` : `${Math.round(minutes / 60)}시간`
  const place = mapRegion(delivery.to_region)?.province
  return `${place ? `${place}까지 ` : ''}약 ${time} 걸려 도착해요`
}
export function mapDiary(raw) {
  const region = mapRegion(raw.region)
  const date = new Date(raw.created_at)
  const dateLabel = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' }).format(date)
  return { ...raw, id: String(raw.id), authorId: String(raw.author.id), nickname: raw.author.nickname,
    province: region.province, district: region.district, region, title: raw.body.split('\n')[0].slice(0, 24), content: raw.body, preview: raw.body.slice(0, 80),
    stamp: { id: 'first-letter', label: '첫 편지', number: '03' }, photo: raw.image ? { url: raw.image } : null, receiveLetters: raw.accepts_letters, canReply: raw.can_reply,
    visibility: raw.visibility === 'same_hometown' ? 'hometown' : raw.visibility || 'all', receivedLetterCount: raw.received_letter_count,
    createdAt: raw.created_at, dateLabel, ago: dateLabel, postmarkDate: new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' }).format(date).replace('/', '.'),
    deliveryLabel: deliveryLabel(raw.delivery) }
}
