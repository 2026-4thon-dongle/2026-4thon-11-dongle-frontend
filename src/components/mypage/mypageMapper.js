// 마이 화면용 변환 함수. 서버 응답(mock 모드도 같은 모양) → 화면용 데이터.
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
 * @param {object} me      GET /api/users/me/ 응답
 * @param {object} settings GET /api/users/me/settings/ 응답
 * @param {{owned_count: number, total_count: number}} stamps GET /api/stamps/ 응답. 우표첩 줄의 "n / 전체"에 서버 값을 그대로 쓴다.
 */
export function toMyPage(me, settings, stamps) {
  const { stats } = me
  const hometowns = me.hometowns ?? []

  return {
    nickname: me.nickname,
    // school_name은 4호선톤 참가 대학이 아니면 null이다. 이때는 "인증 완료"만 보여 준다.
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
        value: `${stamps.owned_count} / ${stamps.total_count}`,
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
 * 임시저장 카드(7-3) 하나. 서버 항목: id, kind(first/reply), diary_id, reply_to, recipient{id,nickname}, body_preview, body_length, saved_at.
 * 화면용 필드: id, kindLabel, title, preview, metaLabel("11월 6일 저장 · 86자"), resumePath
 * 이어 쓰기 경로는 docs/letter-write.md의 쿼리 규칙을 따른다.
 *   일기에 보내는 첫 편지: diaryId, nickname / 받은 편지에 대한 답장: letterId(= reply_to), nickname
 * 서버는 지역을 주지 않아 region은 넘기지 않는다(편지 쓰기가 estimate로 알아낸다).
 */
export function toDraftCard(raw) {
  const isFirstLetter = raw.kind === 'first'
  const nickname = raw.recipient?.nickname ?? ''
  const query = new URLSearchParams()
  if (isFirstLetter) query.set('diaryId', raw.diary_id)
  else query.set('letterId', raw.reply_to)
  if (nickname) query.set('nickname', nickname)

  const savedAt = new Date(raw.saved_at)
  const savedLabel = Number.isNaN(savedAt.getTime()) ? '' : `${DATE_FORMAT.format(savedAt)} 저장`

  return {
    id: raw.id,
    kindLabel: isFirstLetter ? '첫 편지' : '답장',
    title: isFirstLetter ? `Re. ${nickname}님의 고향 일기` : `Re. ${nickname}님의 편지`,
    preview: raw.body_preview,
    metaLabel: [savedLabel, `${raw.body_length}자`].filter(Boolean).join(' · '),
    resumePath: `${MYPAGE_PATHS.letterWrite}?${query.toString()}`,
  }
}

// 서버 우표 code → 우표 그림 id(shared/assets/stamp 파일 이름). 두 개만 이름이 다르다(api/stamps.md 코드 표 ↔ 그림 파일).
const STAMP_ART_ID_BY_CODE = { 'long-delivery': 'long-way', 'cat-birthday': 'hometown-birthday' }
const artIdOf = (code) => STAMP_ART_ID_BY_CODE[code] ?? code

const GRADE_LABELS = { common: '일반', rare: '희귀', legendary: '전설' }

/**
 * 우표첩(7-4~7-6) 화면용 데이터. 서버 GET /api/stamps/ 응답(kind 없이 전부) 하나로 만든다.
 * 개수는 서버 값을 그대로 쓴다: owned_count는 업적+꾸미기를 합한 수집 보상 기준 개수이다(api/stamps.md).
 *   - 업적 탭의 "모은 우표 N개"와 다음 보상 진행은 owned_count 기준이다. (시안 7-4는 업적만 센 값처럼 보여 어긋날 수 있다. 백엔드·디자이너 확인 필요)
 *   - 꾸미기 탭의 "꾸미기 우표 N개"는 stamps[]에서 꾸미기이면서 owned인 개수를 센다.
 * 우표는 "보유한 것을 앞에, 나머지는 서버 순서"로 늘어놓는다. 시안 7-4, 7-5, 7-6의 순서와 맞춘 가정이다.
 * 우표 하나: { id(서버 code), artId(그림 id), name, owned }
 */
export function toStampCollection(data) {
  const byKind = (kind) => {
    const list = (data.stamps ?? [])
      .filter((stamp) => stamp.kind === kind)
      .map((stamp) => ({ id: stamp.code, artId: artIdOf(stamp.code), name: stamp.name, owned: Boolean(stamp.owned) }))
    return [...list.filter((stamp) => stamp.owned), ...list.filter((stamp) => !stamp.owned)]
  }

  const decorationStamps = byKind('decoration')
  const decorationCount = decorationStamps.filter((stamp) => stamp.owned).length
  const next = data.next_reward
  const received = data.received_rewards ?? []

  return {
    achievement: {
      count: data.owned_count,
      title: `모은 우표 ${data.owned_count}개`,
      subtitle: '성과를 낼 때마다 특별한 우표가 생겨요',
      stamps: byKind('achievement'),
      nextReward: next
        ? {
            text: `다음 보상 · ${next.threshold}개: ${next.name}`,
            current: data.owned_count,
            target: next.threshold,
            ratio: Math.min(data.owned_count / next.threshold, 1),
          }
        : null,
      receivedLabel: received.length > 0 ? `받은 보상: ${received.map((reward) => reward.name).join(' · ')}` : '',
      isEmpty: data.owned_count === 0,
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
 * 우표 상세(7-7) 화면용 데이터. 서버 GET /api/stamps/{code}/ 응답: 우표 객체 + owned, granted_at, granted_with{id,nickname}|null, owned_count, next_reward.
 * 받은 날짜·계기 문구는 서버 값(granted_at, granted_with)으로 만든다. 꾸미기 우표는 등급 자리에 "꾸미기"를 보이고 번호는 숨긴다(시안).
 */
export function toStampDetail(stamp) {
  const grantedAt = stamp.granted_at ? new Date(stamp.granted_at) : null
  const dateLabel = grantedAt && !Number.isNaN(grantedAt.getTime()) ? OBTAINED_DATE.format(grantedAt) : ''
  const isAchievement = stamp.kind === 'achievement'
  const progress = stamp.next_reward ? ` (${stamp.owned_count} / ${stamp.next_reward.threshold})` : ''

  return {
    id: stamp.code,
    artId: artIdOf(stamp.code),
    name: stamp.name,
    gradeLabel: isAchievement ? (GRADE_LABELS[stamp.grade] ?? '') : '꾸미기',
    numberLabel: isAchievement ? `No.${String(stamp.number).padStart(2, '0')}` : '',
    description: stamp.description ?? '',
    obtainedLabel: [dateLabel, stamp.granted_with ? `${stamp.granted_with.nickname}님과의 편지로 받음` : ''].filter(Boolean).join(' · '),
    abilities: ['편지 봉투에 붙여서 보내기', `우표첩 보상 개수에 포함돼요${progress}`],
    // 편지 쓰기로 넘기는 값(서버 우표 code). stampId 쿼리는 docs/letter-write.md에 없는 제안이라 채현님과 합의가 필요하다.
    letterWritePath: `${MYPAGE_PATHS.letterWrite}?${new URLSearchParams({ stampId: stamp.code }).toString()}`,
  }
}

// 서버 보상 code → 7-8 카드 미리보기 그림 종류. 서버는 그림 종류를 주지 않아 code로 정한다.
const REWARD_KIND_BY_CODE = {
  'stickers-cat': 'sticker',
  'stationery-night-sky': 'paper',
  'collector-and-font': 'collector',
  'stationery-gold-postcard': 'postcard',
}

/**
 * 수집 보상(7-8) 화면용 데이터. 서버 GET /api/stamps/rewards/ 응답: { owned_count, rewards[{code, threshold, name, unlocked, ...}] }.
 * 모은 우표 수는 서버 owned_count이다(7-4와 같은 기준).
 */
export function toStampRewards(data) {
  const sorted = [...(data.rewards ?? [])].sort((a, b) => a.threshold - b.threshold)
  const next = sorted.find((reward) => !reward.unlocked)
  return {
    title: `모은 우표 ${data.owned_count}개`,
    nextLabel: next ? `다음 보상까지 ${Math.max(next.threshold - data.owned_count, 0)}개` : '',
    rewards: sorted.map((reward) => ({
      id: reward.code,
      kind: REWARD_KIND_BY_CODE[reward.code] ?? 'sticker',
      name: reward.name,
      thresholdLabel: `우표 ${reward.threshold}개`,
      received: Boolean(reward.unlocked),
      progressLabel: `${data.owned_count} / ${reward.threshold} 모음`,
    })),
  }
}

/**
 * 서버 지역({id, name, full_name}) → 지역 선택기(shared/region RegionPicker)가 쓰는 {province, district, id}.
 * "충남 천안시" → { province: '충남', district: '천안', id }, "대전광역시" → { province: '대전', district: '', id }
 * id는 GET /api/regions/의 지역 id와 같다. 정수가 아니면 id를 넣지 않는다(저장 때 다시 고르게 한다).
 */
export function toPickerRegion(region) {
  const [first, ...rest] = (region.full_name ?? region.name ?? '').split(' ')
  const picked = rest.length === 0 ? { province: shortRegionName(first), district: '' } : { province: first, district: shortRegionName(rest.join(' ')) }
  return Number.isInteger(region.id) ? { ...picked, id: region.id } : picked
}

/**
 * 지역 설정(7-10) 화면용 데이터.
 * @param {object} me GET /api/users/me/ 응답 (hometowns[], residence)
 */
export function toRegionSettings(me) {
  const hometowns = (me.hometowns ?? []).map(toPickerRegion)
  const residence = me.residence ? toPickerRegion(me.residence) : null
  return {
    hometowns,
    residence,
    hometownCountLabel: `${hometowns.length}곳`,
    hometownLabel: (me.hometowns ?? []).map((region) => shortRegionName(region.name)).join(' · '),
    residenceProvince: residence?.province ?? '',
    residenceLabel: me.residence?.full_name ?? '',
  }
}

// 닉네임 확인 결과(code)별 안내 문구. available일 때는 시안 7-9의 문구이고, 나머지 문구는 시안에 없어서 정한 것이다.
const NICKNAME_MESSAGES = {
  available: '사용할 수 있는 닉네임이에요',
  INVALID_NICKNAME: '2~10자로 입력해주세요',
  NICKNAME_TAKEN: '이미 사용 중인 닉네임이에요',
}

/** 닉네임 저장(PATCH) 실패 코드 → 안내 문구. 모르는 코드면 undefined이다. */
export const nicknameErrorMessage = (code) => NICKNAME_MESSAGES[code]

/**
 * 닉네임 확인(7-9) 결과 → 화면 상태. 서버 응답(GET /api/auth/nickname/check/)은 { available, code }.
 * @param {{available: boolean, code: string | null}} result
 */
export function toNicknameStatus(result) {
  if (result.available) return { available: true, tone: 'ok', message: NICKNAME_MESSAGES.available }
  return { available: false, tone: 'error', message: NICKNAME_MESSAGES[result.code] ?? NICKNAME_MESSAGES.INVALID_NICKNAME }
}

// 알림·편지 설정(7-11)의 줄 정의. field는 GET/PATCH /api/users/me/settings/의 필드 이름이다(6개 모두 명세에 있다).
const SETTING_ROWS = [
  { id: 'push', field: 'push_enabled', label: '푸시 알림 받기' },
  { id: 'digest', field: 'daily_digest_enabled', label: '하루 한 번 모아서 받기', hint: '매일 저녁 8시' },
  { id: 'arrival', field: 'letter_arrival_push_enabled', label: '편지 도착' },
  { id: 'departure', field: 'letter_departure_push_enabled', label: '편지가 출발했을 때' },
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

/**
 * 설정(7-1-1) 화면용 데이터. 메뉴 5줄은 MenuList가 그대로 쓰는 모양({id, icon, label, value, to})이다.
 * @param {object} me GET /api/users/me/ 응답
 * @param {object} settings GET /api/users/me/settings/ 응답
 * @param {number} blockCount 차단한 사람 수 (GET /api/blocks/의 count)
 */
export function toSettingsHome(me, settings, blockCount) {
  const hometowns = me.hometowns ?? []
  const firstHometown = shortRegionName(hometowns[0]?.name)
  // 시안: "천안 외 2곳 · 성북구". 본가가 1곳이면 "천안 · 성북구"
  const hometownText = hometowns.length > 1 ? `${firstHometown} 외 ${hometowns.length - 1}곳` : firstHometown
  return {
    menu: [
      { id: 'nickname', icon: 'cat', label: '닉네임 변경', value: me.nickname, to: MYPAGE_PATHS.nickname },
      {
        id: 'regions',
        icon: 'pin',
        label: '지역 설정',
        value: [hometownText, shortRegionName(me.residence?.name)].filter(Boolean).join(' · '),
        to: MYPAGE_PATHS.regions,
      },
      {
        id: 'notifications',
        icon: 'bell',
        label: '알림 · 편지 설정',
        value: settings.daily_digest_enabled ? '하루 한 번' : '',
        to: MYPAGE_PATHS.notifications,
      },
      { id: 'blocks', icon: 'ban', label: '차단 목록', value: `${blockCount}명`, to: MYPAGE_PATHS.blocks },
      { id: 'account', icon: 'settings', label: '계정', value: '로그아웃 · 탈퇴', to: MYPAGE_PATHS.account },
    ],
    // 시안의 "정보" 카드. 이용약관·문의하기는 만들어진 화면이 없어 눌러도 토스트만 보여 준다. 버전 문구는 시안 그대로이다(서버와 무관).
    infoItems: [
      { id: 'terms', label: '이용약관 · 개인정보 처리방침' },
      { id: 'contact', label: '문의하기' },
    ],
    versionLabel: '동글 v1.0.0',
  }
}

// 차단한 사람의 프로필 원: 서버가 아바타를 주지 않아 목록 순서대로 돌려 쓴다. 시안 7-12(별빛 = 삐짐·연두, 바람 = 궁금·하늘)와 맞췄다.
const BLOCK_AVATARS = [
  { pose: 'pouty', tone: 'sage' },
  { pose: 'curious', tone: 'sky' },
]

/**
 * 차단 목록(7-12) 화면용 데이터. 서버 항목: { user{id, nickname, residence{id,name,full_name}|null}, created_at }.
 * 카드마다 { userId, nickname, infoLabel("경북 경주시 · 11월 1일 차단"), avatarPose, avatarTone }.
 */
export function toBlockedUsers(response) {
  return (response.results ?? []).map((item, index) => {
    const blockedAt = new Date(item.created_at)
    const dateLabel = Number.isNaN(blockedAt.getTime()) ? '' : `${DATE_FORMAT.format(blockedAt)} 차단`
    const avatar = BLOCK_AVATARS[index % BLOCK_AVATARS.length]
    return {
      userId: item.user.id,
      nickname: item.user.nickname,
      infoLabel: [item.user.residence?.full_name, dateLabel].filter(Boolean).join(' · '),
      avatarPose: avatar.pose,
      avatarTone: avatar.tone,
    }
  })
}
