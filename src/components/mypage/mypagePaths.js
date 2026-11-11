// 마이 화면에서 쓰는 경로 모음. 경로를 바꿀 때는 여기와 app/routes/mypageRoutes.jsx만 고친다.
// "가정" 표시가 있는 경로는 화면이나 라우트가 아직 정해지지 않은 것이다.

export const MYPAGE_PATHS = {
  home: '/mypage', // 7-1
  drafts: '/mypage/drafts', // 7-3
  stamps: '/mypage/stamps', // 7-4~7-6, 7-7(같은 경로의 바텀시트)
  stampRewards: '/mypage/stamps/rewards', // 7-8 수집 보상 (가정, 묶음 3에서 구현)
  nickname: '/mypage/nickname', // 7-9 (진입 경로는 시안에 없어서 주소로 직접 연다)
  regions: '/mypage/regions', // 7-10 (7-1의 "지역 수정 ›"에서도 온다)
  notifications: '/mypage/notifications', // 7-11
  blocks: '/mypage/blocks', // 7-12 (진입 경로는 시안에 없어서 주소로 직접 연다)
  account: '/mypage/account', // 7-13 로그아웃·탈퇴 (진입 경로는 시안에 없어서 주소로 직접 연다)
  start: '/start', // 로그아웃·탈퇴 뒤에 가는 시작 화면(효령 담당). 가정
  // 7-1의 설정 아이콘이 여는 곳. 시안에 설정 목록 화면이 없고, 7-9(닉네임)·7-12(차단)·7-13(로그아웃·탈퇴)로 들어가는 길이 7-1에 없다. (가정)
  settings: '/mypage/settings',
  // 다른 담당 화면. 지금은 모두 임시 화면이다.
  myDiaries: '/diary/mine', // 7-2 내 일기 = 효령 담당(6-6 목록). 브랜치가 합쳐진 뒤 확인한다.
  penPal: '/pen-pal', // 5-14, 5-15 펜팔 친구
  letterWrite: '/letter-write', // 임시저장 이어 쓰기
  diaryWrite: '/diary/write', // 7-6 "첫 일기 쓰러 가기". 공용 TabBar의 일기 쓰기 경로와 같다(가정)
}
