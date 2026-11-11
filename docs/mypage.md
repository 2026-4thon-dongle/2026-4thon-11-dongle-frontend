# 07 마이 · 우표첩

Figma: `9OwwhbOqsCx2zGORvVCe45`, 섹션 `93:1279`.
대상: 7-1~7-13 (`93:1281`, `214:4470`, `93:1434`, `219:4569`, `172:2171`, `172:2300`, `213:4062`, `172:2418`, `93:1504`, `93:1560`, `172:2443`, `93:1595`).
7-2 내 일기는 효령 담당(6-6)이라 범위 밖이다. 7-1에서 `/diary/mine`으로 연결만 했다.

## 경로와 동작

| 화면 | 경로 | 동작 |
| --- | --- | --- |
| 7-1 마이 | `/mypage` | 프로필, 지역 박스, 숫자 카드, 메뉴 5줄. 설정 아이콘 → `/mypage/settings`(임시) |
| 7-3 임시저장 | `/mypage/drafts` | "이어 쓰기"는 편지 쓰기로 이동, 휴지통은 바로 삭제 + 토스트 |
| 7-4~7-7 우표첩 | `/mypage/stamps` | 업적·꾸미기 탭(화면 상태), 보유 우표를 누르면 상세 바텀시트, 0개면 7-6 |
| 7-8 수집 보상 | `/mypage/stamps/rewards` | 보상 4개와 진행 |
| 7-9 닉네임 | `/mypage/nickname` | 입력, 중복 확인, 저장 후 `/mypage` |
| 7-10 지역 | `/mypage/regions` | 본가 1~3곳, 거주 1곳, 저장 후 `/mypage` |
| 7-11 알림 | `/mypage/notifications` | 스위치 6개, 누르면 바로 저장 |
| 7-12 차단 | `/mypage/blocks` | "해제"는 확인 없이 바로 해제 + 토스트 |
| 7-13 계정 | `/mypage/account` | 로그아웃은 바로 실행, 탈퇴는 확인 다이얼로그 |

개발 모드에서만 동작하는 확인용 쿼리: `?mock=empty`(`/mypage/stamps`, `/mypage/stamps/rewards`, `/mypage/blocks`), `?dialog=withdraw`(`/mypage/account`).
변경(삭제·해제·닉네임·지역·설정)은 메모리 값만 바꾸며 새로고침하면 처음으로 돌아간다.

## 구현 구조

- 화면: `pages/mypage/`. 기능 전용 UI: `components/mypage/`. 경로 상수: `mypagePaths.js`, `app/routes/mypageRoutes.jsx`.
- 데이터 흐름: 페이지 → `mypageApi.js` → `shared/mocks/mypage.js`·`stampCollection.js` → `mypageMapper.js`. 화면은 변환 결과만 쓴다. 명세가 바뀌면 mapper와 api만 고친다.
- 공용 `Header`, `Button`, `Chip`, `Input`, `Icon`, `Mascot`, `Skeleton`, `Stamp`, `useOverlay`, `shared/region`을 재사용했다. `shared`는 수정하지 않았다.
- 마이 전용으로 `Toggle`(7-11)과 `StampTabs`(7-4·7-5)를 만들었다. shared 승격은 논의가 필요하다.
- 최대 너비 430px, 좌우 20px, 내부 너비는 flex·100%를 적용한다.

## 임시 경로와 연결

- 7-1 "내 일기" → `/diary/mine`(효령), "펜팔 친구" → `/pen-pal`(`RoutePlaceholder`, 5-14).
- 7-3 "이어 쓰기" → `/letter-write?letterId&nickname&region`, 7-7 "이 우표 붙여서 편지 쓰기" → `/letter-write?stampId=…`. 현재 편지 쓰기는 `letterId`·`stampId`를 읽지 않고 임시저장 본문도 복원하지 못한다. 합의가 필요하다.
- 7-6 "첫 일기 쓰러 가기" → `/diary/write`, 7-13 로그아웃·탈퇴 뒤 → `/start`(가정).
- 7-9, 7-12, 7-13은 시안에 진입 경로가 없어 주소로 직접 연다. 7-10과 7-11은 7-1에서도 온다.
- 우표는 `shared/mocks/stamps.js`의 이름·종류를 읽기만 하고, 보유 상태는 `stampCollection.js`에서 따로 정의했다.

## 명세와 mock

문서 레포 명세는 2026-11-09 기준으로 읽었고 실제 API는 호출하지 않는다.

- 명세를 따른 것: 7-1 `GET /api/users/me/`, 7-9 닉네임 확인·`PATCH /api/users/me/`, 7-10 `PUT /api/users/me/regions/`, 7-11 `/api/users/me/settings/`, 7-12 `/api/blocks/`, 7-13 로그아웃·탈퇴. 지역 id는 임시 값이다.
- mock 전용(서버가 주지 않으면 사라지거나 비어 보인다): 우표 목록·보유·보상·상세, 임시저장 목록, `school_name`, `stamp_total`, 자주 다니던 동네, 알림의 "편지 도착"·"편지가 출발했을 때", 차단 카드의 지역.
- 7-1의 `letter_count`, `penpal_count`, `draft_count`는 명세상 편지 앱 연결 전까지 0이다. mock은 시안용으로 8, 3, 2를 넣었다.

## 시안에 없어서 정한 것

- 7-3 삭제 확인과 빈 목록, 7-12 해제 확인과 빈 목록, 7-13 로그아웃 확인은 없이 처리하고 토스트만 보여 준다.
- 7-7 잠긴 우표는 누를 수 없고, 7-8 보상 카드는 눌러도 동작이 없다. 보상 그림 4종은 CSS로 비슷하게 그렸다.
- 로딩 실패·오류 화면은 만들지 않았다. 로딩은 `Skeleton`만 보여 준다.
- 시안 안의 어긋남: 우표 개수가 7-4는 5개, 7-7·7-8은 6개이고 7-1은 "5 / 17"인데 우표 데이터는 20개이다. 기본 우표만 센다.

## 확인이 필요한 것

- 7-6이 실제로 나올 수 있는지(가입 시 「첫 걸음」 우표를 받음), 우표 개수 기준, 설정 아이콘이 여는 화면과 7-9·7-12·7-13 진입, 빈 목록·확인 화면, 7-11 "푸시"와 "이메일" 표기.
- `/diary/mine`, `/diary/write`, `/start`와 로그아웃 시 토큰 처리를 어디서 맡을지.
- `letterId`·`stampId` 쿼리, 임시저장 본문 복원 방식, 우표 mock 공유.
- 우표 목록·보유·보상·상세 API, 임시저장 API, `school_name`, 알림 설정 필드, 차단 카드의 지역.

관련 지침: `CLAUDE.md`, `docs/ownership.md`.
