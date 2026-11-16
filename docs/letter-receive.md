# 05 편지 받기, 받은 편지에 답장, 보상·펜팔 (5-8~5-15)

Figma: `9OwwhbOqsCx2zGORvVCe45`, 섹션 `92:999`(05 우체통·편지 받기). 5-1~5-7-1은 `docs/mailbox.md`를 본다.
대상: 5-8 `92:1095`, 5-9 `92:1247`, 5-10 `169:1842`, 5-11 `169:1919`, 5-12 `171:2379`, 5-13 `219:5250`, 5-14 `92:1290`, 5-15 `92:1401`.

| 화면 | 경로 | 동작 |
| --- | --- | --- |
| 5-8 새 편지 도착 | `/mailbox/:letterId` | 내가 받은 편지이고 아직 열지 않은 것(`direction: received`, `is_read: false`). "봉투 열기" → `POST /open/`으로 읽음 처리 후 5-9, "나중에 읽을래요" → 한 칸 뒤로(읽음 처리 없음) |
| 5-9 편지 열람 | `/mailbox/:letterId` | 그 밖의 편지. 넘기기(`POST /pass/`, 토스트 "보관함으로 옮겼어요" 후 `/mailbox`의 보관 탭), 답장하기, 오른쪽 위 "…"(시트). 두 버튼은 서버 `can_pass`·`can_reply`일 때만 보인다 |
| 5-10, 5-11 답장 | `/letter-write?letterId=…&nickname=…&region=…` | 새로 만들지 않고 편지 쓰기(4-1, 4-2)로 연결만 한다 |
| 5-12 우표 획득 | `/mailbox/stamp-gained` | "우표첩 보기"(흰 버튼) → `/mypage/stamps`, "확인" → 5-3 대화 중 탭(보상이 열렸으면 5-13 먼저) |
| 5-13 보상 해금 | `/mailbox/reward-unlocked` | "스티커 써보기" → 토스트 후 5-1 새 편지 탭(새 편지가 없으면 3-1 `/home`), "확인" → 5-3 대화 중 탭 |
| 5-14 펜팔 친구 | `/pen-pal` | 친구 카드 → 5-15 |
| 5-15 주고받은 편지 | `/pen-pal/:conversationId` | 시작 일기와 편지를 시간순 카드로. "답장 쓰기"(서버 `reply_to`가 있을 때만) → 5-10으로 연결 |

- **서버 연동(#65)**: 5-8, 5-9, 5-14, 5-15는 서버(`api/mailbox.md`)에서 받는다. 5-12, 5-13(`/mailbox/stamp-gained`, `/mailbox/reward-unlocked`)은 아직 mock 그대로이다.
- 개발용 확인 주소 중 mock 모드(`.env`의 `VITE_API_MOCK=true`, 개발 서버)에서만 되는 것: `/mailbox/101`·`102`(5-8), `/mailbox/103`·`104`(5-9), `/pen-pal?mock=empty`, `/pen-pal/1`·`2`·`3`·`4`(4는 끝난 대화). 기본(서버 모드)에서는 실제 편지·대화 id로 연다. `/mailbox/reward-unlocked?threshold=3|5|10|15`, `/mailbox/stamp-gained?unlock=3`("확인"이 5-13으로 이어짐)은 5-12·5-13이 mock이라 항상 쓸 수 있다.
- 5-12, 5-13은 언제 뜨는지가 정해지지 않아 어디에서도 보내지 않고 주소로 직접 연다.
- 읽음·넘김은 서버가 저장하고 우체통 목록(5-1, 5-3, 5-7)에 반영해 준다. 답장한 편지는 답장 편지를 **발송할 때** 서버가 대화 중으로 옮긴다("답장하기" 버튼만으로는 안 옮겨진다). mock 모드에서만 메모리(`mailboxMockStore.js`)에 두고 "답장하기"를 누르는 순간 옮긴다. 탭 이동 규칙은 `docs/mailbox.md`를 본다.
- **로딩·에러**: 스켈레톤으로 불러오고, 실패하면 mock으로 채우지 않고 에러를 보여 준다. 5-8·5-9: 아직 도착하지 않은 편지(403 `NOT_ARRIVED`)와 없는 편지(404)는 안내 문구만, 그 밖의 실패는 "다시 시도"가 있는 에러 화면이다. 봉투 열기·넘기기가 실패하면(예: 409 `NOT_PASSABLE`) 서버 메시지를 토스트로 알린다. 5-14는 에러 화면, 5-15도 에러 화면이고 404(내 대화가 아님)는 "찾을 수 없는 대화예요" 안내이다. 5-14는 20개씩이며 "더 보기" 버튼(시안에 없는 임시 UI)이 있다.

## 탭으로 이동하는 방식

- 우체통 탭은 주소가 아니라 `navigate('/mailbox', { state: { tab: 'new' | 'chatting' | 'stored' } })`로 연다. `MailboxPage`가 시작 탭으로 쓰고 바로 지운다(새로고침하면 새 편지 탭).
- 5-12·5-13 "확인" → `tab: 'chatting'`, 5-13 "스티커 써보기" → `tab: 'new'`(토스트 "답장할 때 서명 단계에서 붙여보세요", 새 편지가 없으면 토스트 후 `/home`).
- "새 편지가 있는지"는 아직 mock 기준으로 `mailboxDemo.fetchDemoMailboxLetters('new')`의 목록이 비었는지 본다(`stampRewardApi.resolveTryTarget`, 5-12·5-13이 mock이라 그대로 뒀다). 서버와 연결할 때 `GET /api/mailbox/summary/`의 `new_count`로 바꾼다.

## 애니메이션 (CSS만, `prefers-reduced-motion`이면 모두 끄고 끝난 모습만 보인다)

- 5-8(`LetterArrival`): 들어올 때 한 번. 0.3초 뒤 시작해 1.8초 동안 이어진다. 순서는 윗면 열림(0~0.4초) → 편지지 올라옴(0.4~0.9초) → 머묾(약 0.2초) → 편지지 들어감(0.3초) → 윗면 닫힘(0.36초).
  - 윗면(V자 삼각형)은 윗변을 축으로 `perspective(700px) rotateX(0 → -180deg)`로 뒤로 넘어가 봉투 위에 선다. 90도를 넘는 순간 접힌 선이 사라지고 안쪽 면(진한 복숭아색 `#f5bf99`)이 보이며, 열려 있는 동안은 고향이·편지지 뒤(z-index -1)로 간다.
  - 편지지(176×140px)는 봉투 몸통 안쪽에서 시작해 입구 밖으로 100px(약 70%) 올라온다. 봉투 몸통 앞면이 아랫부분을 가리고 고향이보다 앞에 온다(편지가 고향이 앞으로 올라온다).
  - 끝난 모습이 시안(닫힌 봉투)이다. 동작 줄이기면 애니메이션을 모두 끄고 이 모습만 보인다. "봉투 열기"는 애니메이션 중에도 누를 수 있다.
- 5-9(`LetterPaper`): 열 때마다 한 번. 도장이 앞에서 내려와(0.25초 시작, 0.7초) 0.68초에 소인 자리를 누르고, 그 순간 소인(점선 원 + 글자)이 함께 나타나며 물결이 번지고 편지지가 살짝 눌린다.
  - 소인 글자는 4-10 프레임(`90:968`)을 따랐다: Jua, 베리색(`--brand-berry`), 12도 기울임, 두 줄(`MM.DD` / 지역), 원 중심에서 왼쪽 위 5.2px·아래 9.5px(96px 원 기준). 5-9의 원은 72px이라 0.75배(글자 10.5px)로 줄였다.
  - 값: 날짜는 편지를 보낸 날(`sent_at`, KST), 지역은 `from_region.name`의 짧은 이름("천안시"→"천안", "성북구"→"성북"). `letterReceiveMapper`의 `formatPostmarkDate`, `toShortRegion`이 만든다. 없으면 글자만 숨기고 원은 남긴다.
  - mock 모드: 편지 상세 mock(shared)에는 보낸 날짜가 없어 `letterReceiveDemo`가 우체통 mock의 도착 시각에서 배송 시간을 빼 `sent_at`을 만든다(mock 전용).
  - 4-10 컴포넌트(`components/delivery/StampingScene`)는 가져오지 않았다. 동작 줄이기면 도장은 숨기고 소인이 처음부터 찍힌 상태로 보인다.
- 넘기기: 이동 값은 `navigate('/mailbox', { state: { tab: 'stored' } })`. `MailboxPage`가 시작 탭으로 쓰고 바로 지운다(새로고침하면 새 편지 탭).

## 구현 구조

- 페이지: `pages/mailbox/LetterPage`(5-8, 5-9), `StampGainedPage`(5-12), `RewardUnlockedPage`(5-13), `pages/pen-pal/PenPalPage`(5-14), `PenPalLettersPage`(5-15).
- `components/mailbox/`: `LetterArrival`, `LetterPaper`(읽기 전용 편지지), `LetterMenuSheet`, `CelebrationFrame`(5-12·5-13 공용 틀), `StampGainScene`, `RewardPreview`.
- `components/pen-pal/`: `PenPalCard`, `PenPalLetterCard`. 다른 기능 폴더를 import하지 않으려고 우표 그림 id·고향이 표정·답장 경로 변환은 `penPalMapper.js`에도 따로 둔다.
- 데이터 흐름: 페이지 → `*Api.js` → `shared/api/client.js`의 `request()` → 서버 → `*Mapper.js` → 화면. 화면은 서버 필드를 직접 쓰지 않는다. mock 모드(`VITE_API_MOCK=true`, 개발 서버)에서는 `letterReceiveDemo.js`·`penPalDemo.js`가 옛 mock(`shared/mocks`의 `letterDetail.js`, `penPal.js`)을 서버 응답 모양으로 바꿔 같은 mapper에 넘긴다. 5-12·5-13(`stampRewardApi`)은 `shared/mocks/stampReward.js` 그대로이다.
- 서버 요청: 5-8·5-9 `GET /api/letters/{id}/`(읽음 처리 안 함), `POST /api/letters/{id}/open/`, `POST /api/letters/{id}/pass/`(204). 5-14 `GET /api/penpals/`, 5-15 `GET /api/mailbox/conversations/{id}/`. 에러는 `client.js`의 `ApiError`이다.
- 채현님 `components/letter-write`와 마이 `RewardThumb`는 가져다 쓰지 않고 우체통 안에 따로 만들었다. 공용 컴포넌트는 `Header`, `Button`, `Icon`, `Mascot`, `Stamp`, `Skeleton`, `useOverlay`를 썼다. `shared`의 기존 파일은 수정하지 않았다.

## 임시 경로와 연결

- 경로 `/mailbox/stamp-gained`, `/mailbox/reward-unlocked`, `/pen-pal/:conversationId`는 가정이다(`/pen-pal`의 id는 친구 id가 아니라 대화 id). 답장 쿼리(`letterId`, `nickname`, `region`)는 `docs/letter-write.md`의 제안이고, `letterId`는 서버 편지 id(= 5-15의 `reply_to`)이다.
- 답장 쿼리에 `preview`(받은 편지 첫 줄, 60자까지)를 더 붙인다(`letterReceiveMapper.buildReplyPath`). 5-10 배너("Re. {닉네임}님의 편지" + 첫 줄)와 5-11 "{닉네임}님 편지 다시 보기 ›"(`/mailbox/:letterId`로 이동, 돌아오면 쓰던 내용 유지)는 편지 쓰기 쪽에서 `letterId`로 동작한다. 자세한 동작은 `docs/letter-write.md`. 5-15(펜팔)의 "답장 쓰기"는 서버 `reply_to`를 `letterId`로 쓰고, `penPalMapper`가 받은 마지막 편지(`direction: received`)의 첫 줄을 60자까지 `preview`로 넘긴다(받은 편지가 없으면 생략). 네 단계 헤더 제목은 모두 "답장 쓰기"이다.
- `/mypage/stamps`는 이 브랜치에서 `/mypage/*`의 `RoutePlaceholder`이다(마이는 `feature/22-mypage-ui`). 마이 7-1의 "펜팔 친구"는 `/pen-pal`로 연결되어 있다.

## 서버와 다른 점·mock

- 5-8·5-9·5-14·5-15는 `api/mailbox.md`를 따른다. 5-12·5-13은 문서 레포에 전용 조회 API가 없어(발송 응답의 `granted_stamps`·`unlocked_rewards`, `GET /api/stamps/rewards/`) 언제 띄울지 정해진 뒤에 연결한다. 지금은 `spec/stamp.md`를 참고한 mock 그대로이다.
- 5-9 서명은 서버 `signature`(이미지 URL)로 그린다. 서명 이미지 위에 스티커(`stickers[]`의 `code`·`x`·`y`·`rotation`)를 얹는다. `x`·`y`는 서명 영역 기준 0~1 비율로 보았고(문서는 "편지지 기준"이라고만 적음), 스티커 크기(`scale`)는 서버가 아직 주지 않아(요청 `1115_fe2be_sticker-scale`) 64px 고정이다.
- 5-9 편지지(`stationery`)는 6종의 바탕·글씨색만 맞추고 줄·격자·고향이·밤하늘·금박 장식은 그리지 않는다. 글씨체(`font`)는 서버 코드를 `shared/fonts/letterFonts.js`의 글씨체로 바꿔 쓰며 목록에 없는 글씨체는 나눔손글씨 펜이다.
- 5-9 보낸 사람은 `sender_nickname`(발송 시점 값), 받는 사람(5-8 "To.")은 `recipient_nickname`을 쓴다. 우표는 `stamp.code`(`long-delivery`, `cat-birthday`는 그림 이름이 달라 변환)로 그린다.
- 5-15 카드의 미리보기는 서버가 도착한 편지에만 준다. 내가 보낸 편지나 오는 중인 편지에 `preview`가 없으면 "내가 보낸 편지예요" / "아직 오고 있는 편지예요"로 보여 준다. 시작 일기(`diary`)가 없으면(내 일기를 지운 경우) 그 카드는 없다.
- 펜팔 기준(3번 이상)은 서버가 정한다(왕복 3회, 서버 가정). mock 모드는 "편지 3통 이상"이다. 5-14의 "귤껍질 · 편지 2통"은 mock에서 3통으로 바꿨다.
- 5-13의 보상 4개와 개수(3, 5, 10, 15)는 `spec/stamp.md`를 따랐다. 스티커 외 보상의 사용 안내 문구와 버튼 이름은 mock에서 정했다.

## 시안에 없어서 정한 것

- 5-8은 읽지 않은 편지, 5-9는 읽은 편지로 열었다. 넘기기 토스트 "보관함으로 넘겼어요", "…" 시트(신고하기·차단하기, 누르면 "준비 중이에요" 토스트)의 모양과 문구.
- 5-9의 "붙일 우표가 없나요? 만들고 바로 답장해요" 줄은 보류 기능(요청 `1110_be2fe_hold-entry-points`) 진입점이다. `LetterPage.jsx`의 `SHOW_STAMP_MAKE_ENTRY`로 켜고 끄며(지금은 켬), 눌러도 토스트만 나온다. 팀이 숨길지 정한다.
- 시안과 달라진 곳: 5-13 진행 바는 시안이 30%인데 다음 보상(5개)과 맞지 않아 모은 개수 ÷ 다음 보상 개수(3/5)로 그린다. 5-15는 "6통"인데 카드가 4개여서 mock에 편지를 더 넣었다.

## 확인이 필요한 것

- 답장 쿼리 `preview` 추가를 채현님과 확인. 5-12·5-13이 4-10, 4-11 어디에 끼는지(발송 응답의 `granted_stamps`·`unlocked_rewards`로 띄우는 방안). 읽기 전용 편지지를 `shared`로 올릴지(중복 해소). 해금된 편지지·글씨체·스티커를 편지 쓰기에서 고르는 방법.
- 5-9 "…" → 신고·차단을 3-6~3-8과 어떻게 연결할지.
- 5-8과 5-9의 구분 기준, 5-9 "…" 메뉴, 펜팔 친구가 없을 때·넘기기 후 화면, 5-14 "편지 2통" 예시, 5-13 진행 바.
- 우표 획득·보상 해금(5-12, 5-13)을 띄우는 시점과 데이터 출처(첫 왕복 우표 지급 대상·시점, 가입·일기 응답에 `unlocked_rewards`가 없는 점).
- 보관한 편지(`passed_letter`)를 읽기 전용으로 열었을 때 `can_reply`·`can_pass`가 false로 오는지, 스티커 `scale`·좌표 기준, 아바타 코드 전체 목록.

관련 지침: `CLAUDE.md`, `docs/ownership.md`, `docs/mailbox.md`, `docs/letter-write.md`.
