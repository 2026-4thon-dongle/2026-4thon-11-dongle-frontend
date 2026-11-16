# 07 마이 · 우표첩

Figma: `9OwwhbOqsCx2zGORvVCe45`, 섹션 `93:1279`.
대상: 7-1~7-13과 설정 7-1-1(`509:10234`) (`93:1281`, `214:4470`, `93:1434`, `219:4569`, `172:2171`, `172:2300`, `213:4062`, `172:2418`, `93:1504`, `93:1560`, `172:2443`, `93:1595`).
7-2 내 일기는 효령 담당(6-6)이라 범위 밖이다. 7-1에서 `/diary/mine`으로 연결만 했다.

## 경로와 동작

| 화면 | 경로 | 동작 |
| --- | --- | --- |
| 7-1 마이 | `/mypage` | 프로필, 지역 박스, 숫자 카드, 메뉴 5줄. 설정 아이콘 → `/mypage/settings` |
| 7-1-1 설정 | `/mypage/settings` | 내 정보 메뉴 5줄(닉네임·지역·알림·차단·계정) → 7-9~7-13, 정보 2줄은 토스트 |
| 7-3 임시저장 | `/mypage/drafts` | "이어 쓰기"는 편지 쓰기로 이동, 휴지통은 `DELETE` 후 목록에서 빼고 토스트(실패하면 목록 그대로 + 토스트) |
| 7-4~7-7 우표첩 | `/mypage/stamps` | 업적·꾸미기 탭(화면 상태), 보유 우표를 누르면 상세 바텀시트, 0개면 7-6 |
| 7-8 수집 보상 | `/mypage/stamps/rewards` | 보상 4개와 진행 |
| 7-9 닉네임 | `/mypage/nickname` | 입력(0.4초 쉬면 서버에 사용 가능 확인), 저장 후 `/mypage` |
| 7-10 지역 | `/mypage/regions` | 서버 연동(`GET /api/users/me/`, `PUT /api/users/me/regions/`). 본가 1~3곳, 거주 1곳, 저장 후 `/mypage`. 시안처럼 두 카드와 안내만 둔다. 바꾼 채 헤더 뒤로 가기를 누르면 확인 팝업(7-10-3) |
| 7-11 알림 | `/mypage/notifications` | 스위치 6개, 누르면 바로 `PATCH`(실패하면 그 스위치만 되돌리고 토스트) |
| 7-12 차단 | `/mypage/blocks` | "해제"는 확인 없이 바로 해제 + 토스트 |
| 7-13 계정 | `/mypage/account` | 서버 연동(`POST /api/auth/logout/`, `DELETE /api/users/me/`). 로그아웃은 바로 실행, 탈퇴는 확인 다이얼로그 |

## 서버 연결과 mock 스위치

- 기본은 **서버 호출**이다. `.env`의 `VITE_API_BASE_URL`(서버 주소)로 `shared/api/client.js`의 `request()`를 부른다. 로그인한 계정의 토큰은 그 모듈이 알아서 붙이고 갱신한다.
- `VITE_API_MOCK=true`이고 개발 모드(`npm run dev`)일 때만 `components/mypage/mypageDemo.js`의 가짜 서버(메모리)를 쓴다. 판단은 `shared/api/client.js`의 `isApiDemo`(다른 화면과 같은 스위치)이고, 서버가 실패했다고 mock으로 채우지 않는다.
- 모든 읽기는 로딩 `Skeleton` → 실패 시 오류 화면(`LoadError` = 공용 `ErrorScreen` + ApiError 메시지 + "다시 시도"). 쓰기(삭제·해제·알림 변경)의 실패는 토스트로 알리고 화면 값은 그대로 둔다. 닉네임 확인·저장 실패는 입력창 아래 문구로 보여 준다.
- 개발용 쿼리(`isApiDemo`일 때만 동작): `?mock=empty`(`/mypage/stamps`, `/mypage/stamps/rewards`, `/mypage/blocks`). 서버 모드에서 빈 화면을 보려면 새 계정으로 로그인한다.
- 서버와 무관한 UI 확인용 쿼리(개발 모드): `?dialog=withdraw`(`/mypage/account`), `?dialog=leave`(`/mypage/regions`, `/mypage/nickname`).
- 7-13 로그아웃·탈퇴(`mypageApi.logout`·`withdraw`, 화면 `AccountPage`·`WithdrawDialog`):
  - **로그아웃**: `getTokens().refresh`로 `POST /api/auth/logout/ { refresh }`(204)를 보낸 뒤 `clearTokens()`로 로컬 토큰을 지운다. 서버 호출이 실패해도(네트워크, 400 `INVALID_REFRESH_TOKEN` 등) 토큰은 지워서 이 기기에서는 로그아웃된다. 이때 토스트가 "이 기기에서 로그아웃했어요. 서버에는 알리지 못했어요"로 바뀐다(서버의 refresh는 만료 때까지 남는다). access가 만료돼 `request()`가 refresh를 회전시켜 처음 refresh가 무효가 되면(400 `INVALID_REFRESH_TOKEN`) 새 refresh로 한 번 다시 보낸다. 로그아웃 중에는 버튼이 "로그아웃하는 중…"으로 잠긴다.
  - **탈퇴**: `DELETE /api/users/me/`(204)가 성공한 뒤에만 토큰을 지운다(탈퇴 뒤에는 logout을 부르지 않는다). 실패하면 토큰을 지우지 않고 다이얼로그 안에 서버 메시지와 "계정은 그대로 남아 있어요"를 보여 주며, 버튼이 "다시 시도"로 바뀐다. 진행 중에는 두 버튼이 잠긴다.
  - **정리**: `clearTokens()`가 `shared/api/profile.js`의 프로필 캐시를 비운다(세션 구독). 이동(`/start`, 가정)은 토큰을 지우기 직전에 한다. 먼저 지우면 `SessionGate`가 `/login`으로 보내기 때문이다(`/start`는 로그인 없이 열리는 주소). `shared`는 수정하지 않았다.
- 7-10 지역(#79): 처음 값은 `GET /api/users/me/`의 `hometowns[]`·`residence`이고, 저장은 `PUT /api/users/me/regions/`에 `hometown_region_ids`(1~3개)·`residence_region_id`를 보낸다(명세 `api/users.md`와 같다). 지역 선택기(`shared/region`)가 주는 `{province, district, id}`의 `id`가 서버 지역 id(`GET /api/regions/`)라서 임시 id·`toMockRegion`은 없앴다. 불러오기가 실패하면 오류 화면과 다시 시도를 보여 주고, 저장이 실패하면 값을 그대로 둔 채 서버 메시지를 토스트로 알린다. 서버에서 받은 값은 `id`를 달고 오지만, `id`가 없는 값이 섞이면(옛 프로필) 화면은 그대로 뜨고 저장할 때 "지역을 다시 골라 주세요"로 안내한다. 다시 고르면 `id`가 채워진다. mock(`VITE_API_MOCK=true`)에서는 `mypageDemo.js`가 고른 지역으로 값을 바꾼다.

## 구현 구조

- 화면: `pages/mypage/`. 기능 전용 UI: `components/mypage/`. 경로 상수: `mypagePaths.js`, `app/routes/mypageRoutes.jsx`.
- 데이터 흐름: 페이지(`useLoad`) → `mypageApi.js` → 서버(`request()`) 또는 mock 모드의 `mypageDemo.js`(서버 응답 모양의 `shared/mocks/mypage.js`·`stampCollection.js`) → `mypageMapper.js`. mapper는 항상 서버 응답 모양만 받는다. 화면은 변환 결과만 쓴다. 명세가 바뀌면 mapper와 api만 고친다.
- `useLoad.js`(읽기 상태: data/error/reload), `LoadError.jsx`(오류 화면)는 마이 전용이다.
- 공용 `Header`, `Button`, `Chip`, `Input`, `Icon`, `Mascot`, `Skeleton`, `Stamp`, `useOverlay`, `shared/region`을 재사용했다. `shared`는 수정하지 않았다(`shared/mocks/mypage.js`·`stampCollection.js`는 마이 전용이라 서버 응답 모양으로 다시 썼다).
- 마이 전용으로 `Toggle`(7-11)과 `StampTabs`(7-4·7-5)를 만들었다. shared 승격은 논의가 필요하다.
- 최대 너비 430px, 좌우 20px, 내부 너비는 flex·100%를 적용한다.

## 임시 경로와 연결

- 7-1 "내 일기" → `/diary/mine`(효령), "펜팔 친구" → `/pen-pal`(`RoutePlaceholder`, 5-14).
- 7-3 "이어 쓰기" → 첫 편지는 `/letter-write?diaryId&nickname`, 답장은 `/letter-write?letterId(=reply_to)&nickname`(서버가 지역을 주지 않아 `region`은 없다), 7-7 "이 우표 붙여서 편지 쓰기" → `/letter-write?stampId=…`. `stampId`는 서버 우표 code이다. 이어 쓰기는 편지 쓰기 쪽 `EntryRedirect`가 `diaryId`/`letterId`로 서버 임시저장을 찾아 본문·편지지·글씨체를 복원한다(#86). 임시저장 id는 쿼리에 없다. `stampId`는 편지 쓰기가 아직 읽지 않는다(우표 선택 없이 1단계로 간다).
- 7-6 "첫 일기 쓰러 가기" → `/diary/write`, 7-13 로그아웃·탈퇴 뒤 → `/start`(가정).
- 7-9, 7-12, 7-13은 설정 화면(7-1-1)에서 들어간다. 7-10과 7-11은 7-1에서도 온다.
- 설정(7-1-1) 연결: 닉네임 변경 → `/mypage/nickname`(오른쪽 값 = 닉네임), 지역 설정 → `/mypage/regions`("천안 외 2곳 · 성북구"), 알림 · 편지 설정 → `/mypage/notifications`("하루 한 번", 끄면 비움), 차단 목록 → `/mypage/blocks`("N명"), 계정 → `/mypage/account`. 값은 화면에 들어올 때마다 서버에서 새로 읽는다(7-10에서 저장한 지역도 바로 보인다).
- 설정의 "이용약관 · 개인정보 처리방침", "문의하기"는 연결할 화면이 없어 토스트 "준비 중이에요"만 보여 준다. "동글 v1.0.0"은 시안 글자 그대로이다.
- 지역 설정 저장 안 하고 나가기(7-10-3): 본가·거주를 실제로 바꿨을 때만(원래 값으로 되돌리면 제외, 시트만 열었다 닫는 것도 제외) 헤더 뒤로 가기에서 "저장하지 않고 나갈까요?"를 띄운다. "계속 수정할게요"는 팝업만 닫고, "저장 안 하고 나갈게요"는 이전 화면으로 간다. 딤·Esc는 계속 수정과 같다. 앱이 `BrowserRouter`라 `useBlocker`를 쓸 수 없어 브라우저·기기 뒤로 가기, 주소 이동, 새로고침은 막지 못한다. 개발 모드에서 `?dialog=leave`로 팝업을 바로 연다.
- 닉네임 변경 저장 안 하고 나가기: 지역 설정과 같은 팝업(`LeaveEditDialog`)을 쓴다. 앞뒤 공백을 뺀 닉네임이 처음 값과 다르고 저장 중이 아닐 때만 헤더 뒤로 가기에서 띄운다(되돌렸거나 저장한 뒤에는 그냥 나간다). 브라우저 뒤로 가기는 막지 못한다. 개발 모드에서 `?dialog=leave`로 바로 연다.
- 설정에는 켜고 끄는 항목이 없어 `Toggle`을 쓰지 않았다. 설정 데이터는 `mypageApi.fetchSettingsHome` → `mypageMapper.toSettingsHome`이고, 메뉴 줄은 7-1의 `MenuList`를 그대로 쓴다. "정보" 카드만 `SettingsInfoCard`를 새로 만들었다.
- 우표 그림은 `shared/ui/Stamp`(파일 이름 id)로 그린다. 서버 code와 그림 id는 `long-delivery`→`long-way`, `cat-birthday`→`hometown-birthday` 두 개만 달라 `components/mailbox/stampArt.js`의 표(05 우체통·펜팔·마이가 함께 쓴다)로 바꾼다. 이름 띠·번호는 `Stamp`가 `shared/mocks/stamps.js`로 그린다(서버 값과 같은지는 확인 전).

## 서버 명세와 화면의 대응

문서 레포 `api/` 기준(2026-11-16). 관련 명세: `api/users.md`, `api/stamps.md`, `api/safety.md`, `api/letters.md`(임시저장), `api/auth.md`(닉네임 확인).

| 화면 | 호출 | 화면에 쓰는 값 |
| --- | --- | --- |
| 7-1 | `GET /api/users/me/`, `/settings/`, `GET /api/stamps/` | `nickname`, `school_name`(null이면 "인증 완료"만), `hometowns`, `residence`, `stats`, 우표첩 줄 "owned_count / total_count" |
| 7-1-1 | `GET /api/users/me/`, `/settings/`, `GET /api/blocks/` | 닉네임, 지역, `daily_digest_enabled`, 차단 `count` |
| 7-3 | `GET /api/letters/drafts/`(끝 페이지까지), `DELETE /api/letters/drafts/{id}/` | `kind`(first/reply), `recipient.nickname`, `body_preview`, `body_length`, `saved_at`. 제목은 "Re. {닉네임}님의 고향 일기/편지"로 만든다 |
| 7-4~7-6 | `GET /api/stamps/`(`kind` 없이 한 번) | `stamps[]`(`code`, `kind`, `owned`), `owned_count`, `next_reward`, `received_rewards` |
| 7-7 | `GET /api/stamps/{code}/` | `grade`, `number`, `description`, `granted_at`, `granted_with.nickname`, `owned_count`, `next_reward` |
| 7-8 | `GET /api/stamps/rewards/` | `owned_count`, `rewards[]`(`code`, `threshold`, `name`, `unlocked`) |
| 7-9 | `GET /api/auth/nickname/check/`(인증 없이), `PATCH /api/users/me/` | `available`, `code`(INVALID_NICKNAME/NICKNAME_TAKEN) |
| 7-11 | `GET`·`PATCH /api/users/me/settings/` | 6개 필드(`push_enabled`, `daily_digest_enabled`, `letter_arrival_push_enabled`, `letter_departure_push_enabled`, `letter_paused`, `weekly_prompt_enabled`) |
| 7-12 | `GET /api/blocks/`(끝 페이지까지), `DELETE /api/blocks/{user_id}/` | `user.nickname`, `user.residence.full_name`, `created_at` |

- 임시저장·차단 목록은 한 사람이 많이 갖지 않는다고 보고 `next`가 없을 때까지(최대 10쪽) 모아 한 번에 보여 준다. "더 보기" UI는 없다.
- 서버가 주지 않아 화면에서 뺀 것: 임시저장의 지역(`region`)과 제목, 우표 상세의 "배달 게임으로 받음" 같은 계기 문구(대신 `granted_with`가 있으면 "{닉네임}님과의 편지로 받음"), 차단 카드의 프로필 그림(목록 순서대로 돌려 쓴다).
- 서버 우표 `kind`는 `achievement`/`decoration`, 등급은 `common`/`rare`/`legendary`이다(화면은 일반/희귀/전설, 꾸미기 우표는 "꾸미기"로 보인다).
- 7-1의 `letter_count`, `penpal_count`, `draft_count`는 서버 값 그대로이다.

## 시안에 없어서 정한 것

- 7-3 삭제 확인과 빈 목록, 7-12 해제 확인과 빈 목록, 7-13 로그아웃 확인은 없이 처리하고 토스트만 보여 준다(문구와 탈퇴 실패 안내는 시안에 없어서 정했다).
- 7-7 잠긴 우표는 누를 수 없고, 7-8 보상 카드는 눌러도 동작이 없다. 보상 그림 4종은 CSS로 비슷하게 그렸다.
- 로딩은 `Skeleton`, 읽기 실패는 공용 `ErrorScreen`(다시 시도 버튼). 우표 상세 시트는 시트 안에 오류 문구와 "다시 시도"를 둔다. 시안에는 마이 전용 오류 화면이 없다.
- 시안 안의 어긋남: 우표 개수가 7-4는 5개, 7-7·7-8은 6개이고 7-1은 "5 / 17"인데 서버는 20개(업적 12 + 꾸미기 8)이다. 지금은 서버 `owned_count`(업적+꾸미기)와 `total_count`를 그대로 쓴다.

## 확인이 필요한 것

- 우표 개수 기준: 7-1 "n / 20"과 7-4·7-8의 "모은 우표 n개"는 서버 `owned_count`(업적+꾸미기)를 그대로 쓴다. 시안의 "5 / 17", 업적만 센 것처럼 보이는 7-4와 맞는지 백엔드·디자이너 확인이 필요하다. `GET /api/users/me/`의 `stats.stamp_count`(7-1 숫자 카드)가 `owned_count`와 같은 값인지도 문서에 없다.
- `GET /api/stamps/?kind=`를 줬을 때 `owned_count`·`total_count`가 같이 줄어드는지 문서에 없어 `kind` 없이 한 번만 부른다.
- 7-6이 실제로 나올 수 있는지(가입 시 「첫 걸음」 우표를 받음), 설정 화면의 이용약관·문의하기 연결, 빈 목록·확인 화면, 7-11 "푸시"와 "이메일" 표기.
- `letter_arrival_push_enabled`·`letter_departure_push_enabled`는 문서에 "`dev` 병합 전" 문구가 남아 있다. 서버에 없으면 7-11의 두 스위치가 실패한다.
- 우표 이름·번호는 서버가 주지만 `Stamp` 컴포넌트는 `shared/mocks/stamps.js`로 그려 서버 값과 어긋날 수 있다(`shared` 변경 필요).
- 이미 무효인 refresh로 로그아웃하면 400 `INVALID_REFRESH_TOKEN`인지, 탈퇴 직후 토큰 상태는 백엔드 확인 전이다(그래서 실패해도 로컬 토큰은 지운다).
- `/diary/mine`, `/diary/write`, `/start`.

관련 지침: `CLAUDE.md`, `docs/ownership.md`.
