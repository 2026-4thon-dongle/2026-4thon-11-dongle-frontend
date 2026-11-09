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
  return name.replace(/(특별자치시|특별자치도|특별시|광역시|시|군|구)$/, '') || name
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
