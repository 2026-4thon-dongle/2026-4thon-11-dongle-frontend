// 마이 화면용 변환 함수. 서버(지금은 mock) 응답 → 화면용 데이터.
// 화면과 컴포넌트는 서버 필드 이름을 직접 쓰지 않고 이 파일의 결과만 쓴다.
// 명세(문서 레포 api/users.md)가 바뀌면 이 파일과 mypageApi.js만 고친다.
import { MYPAGE_PATHS } from './mypagePaths.js'

const DATE_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
})

/** "천안시" → "천안", "대전광역시" → "대전", "성북구" → "성북" */
export function shortRegionName(name = '') {
  const short = name.replace(/(특별자치시|특별자치도|특별시|광역시|시|군|구)$/, '')
  // "대구", "중구"처럼 떼고 나면 한 글자만 남는 이름은 그대로 둔다
  return short.length >= 2 ? short : name
}

/** "충남 천안시" → "충남", 도·시 구분이 없는 "대전광역시" → "대전" */
export function provinceOf(fullName = '') {
  const [first, ...rest] = fullName.split(' ')
  return rest.length > 0 ? first : shortRegionName(first)
}

/**
 * 마이(7-1) 화면용 데이터.
 * @param {object} me      GET /api/users/me/ 응답 (+ mock 전용 school_name, stamp_total)
 * @param {object} settings GET /api/users/me/settings/ 응답
 */
export function toMyPage(me, settings) {
  const { stats } = me
  const stampTotal = me.stamp_total
  const hometowns = me.hometowns ?? []

  return {
    nickname: me.nickname,
    // 명세에는 school_verified만 있다. 학교 이름(school_name)은 mock 전용이라 없으면 이름 없이 보여 준다.
    schoolLabel: me.school_verified ? `${me.school_name ? `${me.school_name} ` : ''}인증 완료` : '',
    letterSignature: `From. ${me.nickname} 으로 편지를 보내요`,
    hometownProvince: provinceOf(hometowns[0]?.full_name),
    residenceProvince: provinceOf(me.residence?.full_name),
    hometownLabel: `본가 ${hometowns.map((region) => shortRegionName(region.name)).join(' · ')}`,
    residenceLabel: `거주 ${shortRegionName(me.residence?.name)}`,
    stats: [
      { id: 'diary', value: stats.diary_count, label: '고향 일기' },
      { id: 'letter', value: stats.letter_count, label: '편지' },
      { id: 'stamp', value: stats.stamp_count, label: '우표' },
    ],
    menu: [
      { id: 'diaries', icon: 'image', label: '내 일기', value: '', to: MYPAGE_PATHS.myDiaries },
      {
        id: 'stamps',
        icon: 'stamp',
        label: '우표첩',
        value: stampTotal ? `${stats.stamp_count} / ${stampTotal}` : `${stats.stamp_count}`,
        to: MYPAGE_PATHS.stamps,
      },
      { id: 'penpals', icon: 'heart', label: '펜팔 친구', value: `${stats.penpal_count}명`, to: MYPAGE_PATHS.penPal },
      { id: 'drafts', icon: 'letter', label: '임시저장한 편지', value: `${stats.draft_count}통`, to: MYPAGE_PATHS.drafts },
      {
        id: 'notifications',
        icon: 'bell',
        label: '알림 · 편지 쉬기',
        // 시안은 "하루 한 번"만 보인다. 모아 받기를 끈 경우의 문구는 7-11을 구현할 때 정한다(지금은 비워 둔다).
        value: settings.daily_digest_enabled ? '하루 한 번' : '',
        to: MYPAGE_PATHS.notifications,
      },
    ],
  }
}

/**
 * 임시저장 카드(7-3) 하나. 화면용 필드:
 * id, kindLabel, title, preview, metaLabel("11월 6일 저장 · 86자"), resumePath
 * 이어 쓰기 경로는 docs/letter-write.md의 쿼리 규칙을 따른다.
 *   일기에 보내는 첫 편지: diaryId, nickname, region
 *   받은 편지에 대한 답장: letterId, nickname, region (문서의 제안 이름이며 채현님과 합의 전이다)
 */
export function toDraftCard(raw) {
  const isFirstLetter = raw.kind === 'first_letter'
  const query = new URLSearchParams()
  if (isFirstLetter) query.set('diaryId', raw.reply.diary_id)
  else query.set('letterId', raw.reply.letter_id)
  query.set('nickname', raw.reply.nickname)
  query.set('region', raw.reply.region)

  const savedAt = new Date(raw.saved_at)
  const savedLabel = Number.isNaN(savedAt.getTime()) ? '' : `${DATE_FORMAT.format(savedAt)} 저장`

  return {
    id: raw.id,
    kindLabel: isFirstLetter ? '첫 편지' : '답장',
    title: raw.title,
    preview: raw.content_preview,
    metaLabel: [savedLabel, `${raw.char_count}자`].filter(Boolean).join(' · '),
    resumePath: `${MYPAGE_PATHS.letterWrite}?${query.toString()}`,
  }
}

/**
 * 우표첩(7-4~7-6) 화면용 데이터.
 * @param {Array<{id: string, name: string, kind: 'basic'|'decoration'}>} stamps 우표 목록 (shared/mocks/stamps.js, 읽기만 한다)
 * @param {string[]} ownedCodes 보유한 우표 id 목록
 * @param {Array<{id: string, threshold: number, name: string, next_text?: string}>} rewards 수집 보상 (mock 전용)
 *
 * 우표는 "보유한 것을 앞에, 나머지는 원래 순서"로 늘어놓는다. 시안 7-4, 7-5, 7-6의 순서와 맞춘 가정이다.
 * 다음 보상과 받은 보상의 진행은 업적(기본) 우표 개수로 센다. 시안 7-5는 "꾸미기 우표도 수집 보상 개수에 포함돼요"라고
 * 적었지만 7-4의 "5 / 10"은 기본 우표 5개만 센 값이라 서로 맞지 않는다. 디자이너 확인이 필요하다.
 */
export function toStampCollection(stamps, ownedCodes, rewards) {
  const owned = new Set(ownedCodes)
  const byKind = (kind) => {
    const list = stamps
      .filter((stamp) => stamp.kind === kind)
      .map((stamp) => ({ id: stamp.id, name: stamp.name, owned: owned.has(stamp.id) }))
    return [...list.filter((stamp) => stamp.owned), ...list.filter((stamp) => !stamp.owned)]
  }

  const achievementStamps = byKind('basic')
  const decorationStamps = byKind('decoration')
  const achievementCount = achievementStamps.filter((stamp) => stamp.owned).length
  const decorationCount = decorationStamps.filter((stamp) => stamp.owned).length

  const sortedRewards = [...rewards].sort((a, b) => a.threshold - b.threshold)
  const next = sortedRewards.find((reward) => reward.threshold > achievementCount)
  const received = sortedRewards.filter((reward) => reward.threshold <= achievementCount)

  return {
    achievement: {
      count: achievementCount,
      title: `모은 우표 ${achievementCount}개`,
      subtitle: '성과를 낼 때마다 특별한 우표가 생겨요',
      stamps: achievementStamps,
      nextReward: next
        ? {
            text: `다음 보상 · ${next.next_text ?? `${next.threshold}개: ${next.name}`}`,
            current: achievementCount,
            target: next.threshold,
            ratio: Math.min(achievementCount / next.threshold, 1),
          }
        : null,
      receivedLabel: received.length > 0 ? `받은 보상: ${received.map((reward) => reward.name).join(' · ')}` : '',
      isEmpty: achievementCount === 0,
    },
    decoration: {
      count: decorationCount,
      title: `꾸미기 우표 ${decorationCount}개`,
      subtitle: '성과와 상관없이 예쁘고 갖고 싶은 우표예요',
      stamps: decorationStamps,
    },
  }
}

const OBTAINED_DATE = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' })

/**
 * 우표 상세(7-7) 화면용 데이터.
 * @param {{id: string, name: string}} stamp 우표 (이름은 shared/mocks/stamps.js)
 * @param {object} detail mock 전용 상세 정보 (stampCollection.MOCK_STAMP_DETAILS)
 * @param {{current: number, target: number} | null} progress 수집 보상 진행. 없으면 "(n / m)" 문구를 뺀다.
 */
export function toStampDetail(stamp, detail = {}, progress = null) {
  const obtainedAt = detail.obtained?.at ? new Date(detail.obtained.at) : null
  const obtainedLabel =
    obtainedAt && !Number.isNaN(obtainedAt.getTime())
      ? [OBTAINED_DATE.format(obtainedAt), detail.obtained.from].filter(Boolean).join(' · ')
      : ''

  return {
    id: stamp.id,
    name: stamp.name,
    gradeLabel: detail.grade ?? '',
    numberLabel: detail.number ? `No.${String(detail.number).padStart(2, '0')}` : '',
    description: detail.description ?? '',
    obtainedLabel,
    abilities: [
      '편지 봉투에 붙여서 보내기',
      `우표첩 보상 개수에 포함돼요${progress ? ` (${progress.current} / ${progress.target})` : ''}`,
    ],
    // 편지 쓰기로 넘기는 값. stampId 쿼리는 docs/letter-write.md에 없는 제안이라 채현님과 합의가 필요하다.
    letterWritePath: `${MYPAGE_PATHS.letterWrite}?${new URLSearchParams({ stampId: stamp.id }).toString()}`,
  }
}

/**
 * 수집 보상(7-8) 화면용 데이터. 우표를 모은 개수는 업적(기본) 우표 개수이다(7-4와 같은 기준).
 * @param {number} count 모은 우표 개수
 * @param {Array<{id: string, threshold: number, name: string, kind: string}>} rewards 수집 보상 (mock 전용)
 */
export function toStampRewards(count, rewards) {
  const sorted = [...rewards].sort((a, b) => a.threshold - b.threshold)
  const next = sorted.find((reward) => reward.threshold > count)
  return {
    title: `모은 우표 ${count}개`,
    nextLabel: next ? `다음 보상까지 ${next.threshold - count}개` : '',
    rewards: sorted.map((reward) => ({
      id: reward.id,
      kind: reward.kind,
      name: reward.name,
      thresholdLabel: `우표 ${reward.threshold}개`,
      received: reward.threshold <= count,
      progressLabel: `${count} / ${reward.threshold} 모음`,
    })),
  }
}

/**
 * 서버 지역({id, name, full_name}) → 지역 선택기(shared/region RegionPicker)가 쓰는 {province, district}.
 * "충남 천안시" → { province: '충남', district: '천안' }, "대전광역시" → { province: '대전', district: '' }
 */
export function toPickerRegion(region) {
  const [first, ...rest] = (region.full_name ?? region.name ?? '').split(' ')
  if (rest.length === 0) return { province: shortRegionName(first), district: '' }
  return { province: first, district: shortRegionName(rest.join(' ')) }
}

/**
 * 지역 설정(7-10) 화면용 데이터.
 * @param {object} me GET /api/users/me/ 응답 (hometowns[], residence)
 * @param {Array<{name: string, level: number}>} frequentAreas 자주 다니던 동네 (mock 전용)
 */
export function toRegionSettings(me, frequentAreas = []) {
  const hometowns = (me.hometowns ?? []).map(toPickerRegion)
  const residence = me.residence ? toPickerRegion(me.residence) : null
  return {
    hometowns,
    residence,
    hometownCountLabel: `${hometowns.length}곳`,
    hometownLabel: (me.hometowns ?? []).map((region) => shortRegionName(region.name)).join(' · '),
    residenceProvince: residence?.province ?? '',
    residenceLabel: me.residence?.full_name ?? '',
    frequentAreas: frequentAreas.map((area) => ({ name: area.name, label: `${area.name} ${'●'.repeat(area.level)}` })),
  }
}

// 닉네임 확인 결과(code)별 안내 문구. available일 때는 시안 7-9의 문구이고, 나머지 문구는 시안에 없어서 정한 것이다.
const NICKNAME_MESSAGES = {
  available: '사용할 수 있는 닉네임이에요',
  INVALID_NICKNAME: '2~10자로 입력해주세요',
  NICKNAME_TAKEN: '이미 사용 중인 닉네임이에요',
}

/**
 * 닉네임 확인(7-9) 결과 → 화면 상태. 서버 응답(GET /api/auth/nickname/check/)은 { available, code }.
 * @param {{available: boolean, code: string | null}} result
 */
export function toNicknameStatus(result) {
  if (result.available) return { available: true, tone: 'ok', message: NICKNAME_MESSAGES.available }
  return { available: false, tone: 'error', message: NICKNAME_MESSAGES[result.code] ?? NICKNAME_MESSAGES.INVALID_NICKNAME }
}

// 알림·편지 설정(7-11)의 줄 정의. field는 GET/PATCH /api/users/me/settings/의 필드 이름이다. (mockOnly: 명세에 없는 필드)
const SETTING_ROWS = [
  { id: 'push', field: 'push_enabled', label: '푸시 알림 받기' },
  { id: 'digest', field: 'daily_digest_enabled', label: '하루 한 번 모아서 받기', hint: '매일 저녁 8시' },
  { id: 'arrival', field: 'letter_arrival_enabled', mockOnly: true, label: '편지 도착' },
  { id: 'departure', field: 'letter_departure_enabled', mockOnly: true, label: '편지가 출발했을 때' },
  { id: 'paused', field: 'letter_paused', label: '편지 잠시 쉬기', hint: '켜면 새 첫 편지를 받지 않아요 (답장은 그대로)' },
  { id: 'weekly', field: 'weekly_prompt_enabled', label: '매주 월요일 글감 알림', hint: '한 주 동안 써볼 동네 이야기 글감을 보내드려요' },
]

/** 알림·편지 설정(7-11) 화면용 데이터. 줄마다 { id, field, label, hint, checked }. */
export function toNotificationSettings(settings) {
  return SETTING_ROWS.map((row) => ({
    id: row.id,
    field: row.field,
    label: row.label,
    hint: row.hint ?? '',
    checked: Boolean(settings[row.field]),
  }))
}

// 차단한 사람의 프로필 원: 닉네임마다 정해진 그림이 없어서 목록 순서대로 돌려 쓴다. 시안 7-12(별빛 = 삐짐·연두, 바람 = 궁금·하늘)와 맞췄다. mock 전용.
const BLOCK_AVATARS = [
  { pose: 'pouty', tone: 'sage' },
  { pose: 'curious', tone: 'sky' },
]

/**
 * 차단 목록(7-12) 화면용 데이터. 서버 응답은 GET /api/blocks/의 { count, next, previous, results[] }.
 * 카드마다 { userId, nickname, infoLabel("경북 경주 · 11월 1일 차단"), avatarPose, avatarTone }.
 */
export function toBlockedUsers(response) {
  return (response.results ?? []).map((item, index) => {
    const blockedAt = new Date(item.created_at)
    const dateLabel = Number.isNaN(blockedAt.getTime()) ? '' : `${DATE_FORMAT.format(blockedAt)} 차단`
    const avatar = BLOCK_AVATARS[index % BLOCK_AVATARS.length]
    return {
      userId: item.user.id,
      nickname: item.user.nickname,
      infoLabel: [item.region, dateLabel].filter(Boolean).join(' · '),
      avatarPose: avatar.pose,
      avatarTone: avatar.tone,
    }
  })
}
