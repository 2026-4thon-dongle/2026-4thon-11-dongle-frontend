# 05 우체통

Figma: `9OwwhbOqsCx2zGORvVCe45`, 섹션 `92:999`(05 우체통·편지 받기).
대상: 5-1~5-7-1 (`92:1001`, `92:1441`, `128:1601`, `171:2173`, `92:1129`, `171:2276`, `128:1746`, `340:5612`).
5-8 이후(편지 열기·답장 등)와 5-14, 5-15(`pen-pal`)는 `docs/letter-receive.md`를 본다.

**서버 연동(#65)**: 5-1~5-7은 서버(`api/mailbox.md`)에서 받는다. 5-1 지역 필터는 서버 `sido` 파라미터로 연결했다(#79). 5-13은 서버와 연결했고(`docs/letter-receive.md`), 5-12는 발송 응답을 router state로 받아 그린다(`docs/letter-receive.md`). 5-12를 여는 쪽(`DonePage`)은 채현님 영역이라 아직 연결되지 않았다.

| 화면 | Figma | 경로·동작 |
| --- | --- | --- |
| 5-1 새 편지 | `92:1001` | `/mailbox` 첫 탭. 정렬 칩(지역별 ▾·최신순·오래된순·안읽음), 편지 카드 |
| 5-2 새 편지 비었을 때 | `92:1441` | 새 편지 목록이 비면 표시. 버튼 "고향 일기 쓰러 가기" → `/diary/write` |
| 5-3 대화 중 | `128:1601` | 대화 중 탭. 칩 없음, 상태 배지·왕복 점이 있는 대화 카드. 카드를 누르면 5-15(`/pen-pal/:conversationId`)로 이동. id는 대화 id |
| 5-4 대화 중 비었을 때 | `171:2173` | 버튼 "새 편지 보러 가기" → 이동 없이 새 편지 탭으로 전환 |
| 5-5 배송 중 | `92:1129` | 배송 중 탭. 도착 임박순 고정(정렬 칩 없음), 진행 바 카드, "지도 보기", 맨 아래 배달 게임 안내 |
| 5-6 배송 중 비었을 때 | `171:2276` | 버튼 "편지 쓰러 가기" → `/letter-write` |
| 5-7 보관 | `128:1746` | 보관 탭. 맨 위 안내 박스, 읽기 전용 보관 카드 |
| 5-7-1 보관 비었을 때 | `340:5612` | 안내 문구만 있고 버튼은 없다 |

- **탭은 주소 쿼리**에 둔다: `/mailbox?tab=new|chatting|shipping|stored`. 상세(5-8, 5-9, 5-15 등)에 갔다가 뒤로 나와도 보던 탭이 남는다.
  - 시작 탭 우선순위는 `navigate`의 `state.tab`(5-9 넘기기, 5-12, 5-13이 씀) > 쿼리 `?tab` > 새 편지. 잘못된 값은 새 편지로 본다. state로 열렸을 때도 쿼리를 그 탭으로 맞추고 state는 지운다.
  - 탭을 바꿀 때와 쿼리를 맞출 때는 `replace`라 히스토리가 쌓이지 않는다(뒤로 가기가 탭을 하나씩 거슬러 오르지 않는다). `mock=empty` 같은 다른 쿼리는 그대로 둔다.
  - 정렬 칩과 지역 필터는 화면 상태이다(URL·서버에 저장하지 않는다). 상세에 다녀오면 처음(최신순·전체)으로 돌아간다.
- 이미 선택된 탭이나 정렬 칩, 지역을 다시 누르면 아무 일도 일어나지 않는다(로딩을 켜지 않는다).
- **지역 필터("지역별 ▾")**: 칩을 누르면 아래에 목록("전체" + 서버 지역 목록의 시·도 17개)이 열린다. **시안 없음, 임시 UI**이다(Figma 5-1에는 칩만 있고 선택 화면이 없다). 고르면 그 지역 편지만 보이고 칩에 지역 이름이 표시되며 "전체"를 고르면 풀린다. 바깥을 누르거나 Esc로 닫는다.
  **서버 필터이다.** 고른 시·도의 id(`GET /api/regions/` 최상위 지역 id, `shared/region`의 `useRegions`)를 `GET /api/mailbox/new/`의 `sido` 파라미터로 보낸다. 받아 온 편지를 화면에서 거르지 않으므로 20개를 넘어도 필터가 맞고, 필터·정렬을 바꾸면 처음 페이지부터 다시 받는다("더 보기"도 같은 `sido`로 받는다). 시·도 목록(`components/mailbox/useSidoOptions.js`)을 받는 중이면 드롭다운에 안내가, 실패하면 오류와 "다시 시도"가 나온다("전체"는 고를 수 있다). 필터를 건 채 목록 요청이 실패해도 칩은 남아 필터를 풀 수 있다. 필터 결과가 비면 5-2가 아니라 칩 아래 한 줄 안내가 나온다. `sido`가 최상위 시·도 id라는 근거는 Swagger(`sido`: integer, "시·도 id")와 `api/mailbox.md`("시·도 id"), 홈 피드 `sido`의 같은 쓰임이다. 응답의 `from_region.sido`는 짧은 이름("충남")이라 둘은 값이 다르다. mock(`VITE_API_MOCK=true`)에서는 `sido`가 시·도 짧은 이름이고 `mailboxDemo.js`가 같은 값으로 거른다.
- 정렬 칩은 새 편지 탭(비었을 때 제외)에만 있고 서버 `ordering`(`latest`·`oldest`·`unread`)으로 보낸다. 오른쪽 위 필터 아이콘은 모든 탭에서 없앴다. 배송 중 탭은 서버가 도착 임박순으로 주고, 대화 중·보관 탭도 서버 정렬 그대로 보여 준다.
- **로딩·에러·더 보기**: 처음과 탭·정렬을 바꿀 때는 스켈레톤이다. 목록 요청이 실패하면 목록 자리에 서버 메시지(`ApiError.message`, 네트워크 오류면 "서버에 연결하지 못했어요…")와 "다시 시도" 버튼이 나온다(탭은 그대로 남아 다른 탭으로 옮길 수 있다). mock으로 채우지 않는다. 페이지당 20개이고 `next`가 있으면 목록 아래에 "더 보기" 버튼이 나온다(시안에 없는 임시 UI). 더 보기가 실패하면 토스트로 알린다.
- **새 편지 탭 점**: `GET /api/mailbox/summary/`의 `new_unread_count`가 0보다 크면 보인다(목록과 따로 요청하며, 점 요청만 실패하면 점 없이 목록을 보여 준다).
- **편지 상태에 따른 탭 이동**(서버가 읽음·답장·넘김을 반영한 목록을 준다): "나중에 읽을래요"는 읽음 처리 없이 한 칸 뒤로 돌아가(우체통에서 들어왔을 때, 보던 탭 그대로) 새 편지 탭에 빨간 점이 유지된다. 봉투를 열어 읽기만 한 편지는 새 편지 탭에 남되 점이 사라진다. "넘기기"는 보관 탭(넘긴 편지)으로 옮겨지고 토스트("보관함으로 옮겼어요")와 함께 `?tab=stored`로 열린다. 답장한 편지는 답장을 **보냈을 때**(편지 쓰기 발송) 서버가 대화 중으로 옮긴다. "답장하기"를 누르는 것만으로는 옮겨지지 않는다.
- 새 편지 탭 글씨 옆 점은 읽지 않은 편지가 있을 때만 보이고, 지역 필터와 상관없이 전체 기준이다. 5-2 시안에는 비어 있는데도 점이 있지만 시안과 다르게 구현했다.
- 하단 탭바는 기존 `TabBarLayout`이 `/mailbox`에서 보여 준다.
- **mock 모드**(`.env`의 `VITE_API_MOCK=true`, 개발 서버에서만): `/mailbox?mock=empty`로 들어가면 모든 탭의 mock이 비어 5-2, 5-4, 5-6, 5-7-1을 볼 수 있다. 기본(`VITE_API_MOCK=false`)에서는 이 쿼리가 무시된다. 실서버에서 빈 화면을 보려면 새 계정으로 로그인한다.

## 경로와 가정

목록 데이터는 서버에서 받는다. 이동 경로 중 일부는 화면이 정해지지 않아 가정한 것이다.

| 위치 | 이동 경로 | 상태 |
| --- | --- | --- |
| 새 편지 카드, 넘긴 편지(보관) | `/mailbox/:letterId` | 5-8·5-9 (`LetterPage`). 넘긴 편지는 서버가 `can_reply`·`can_pass`를 주는 대로 읽기만 하거나 버튼이 보인다 |
| 대화 중 카드 | `/pen-pal/:conversationId` | 5-15. 끝난 대화는 "답장 쓰기"가 없다 |
| 마무리된 대화(보관) | `/pen-pal/:conversationId` | 보관 응답의 `conversation_id`로 5-15에 연결한다 |
| 5-2 "고향 일기 쓰러 가기" | `/diary/write` | 공용 `TabBar`의 기본 경로와 같다. `/diary/*`가 `RoutePlaceholder`이다 |
| 5-5 "지도 보기" | `/delivery/:id/map` | `letterRoutes`의 `RoutePlaceholder`(4-12) |
| 5-5 배달 게임 안내 | `/delivery-game` | `letterRoutes`의 `RoutePlaceholder`. 어느 편지의 게임인지 넘기는 방법은 정하지 않았다 |
| 5-6 "편지 쓰러 가기" | `/letter-write` | 구현된 편지 쓰기 화면 |

- `/mailbox`, `/mailbox/:letterId`, `/mailbox/chats/:chatId`만 등록했다. `/mailbox/chats/:chatId`는 알림(`round_trip`)이 대화 id로 들어오는 주소라 `/pen-pal/:chatId`로 바로 넘긴다(`ChatRedirectPage`). 그 밖의 `/mailbox/...` 경로는 "페이지를 찾을 수 없어요" 화면이 나온다.
- 경로를 바꿔야 하면 `mailboxMapper.js`(카드의 이동 경로, `mapPath`·`path`), `ShippingCard`, `StoredCard`, `GameBanner`, `MailboxPage.jsx`의 경로 상수를 고친다.
- 5-5 "지도 보기"(`/delivery/:letterId/map`)의 id는 배송 응답의 편지 id이다.

## 다른 담당 화면과 연결되는 지점

- **편지 쓰기(`/letter-write`)**: 5-6 버튼이 쿼리 없이 `/letter-write`로 이동한다. 그러면 `EntryRedirect`가 `/letter-write/paper`로 보낸다.
  `docs/letter-write.md`는 우체통·일기에서 들어올 때 `region`을 필수 쿼리로 적고 있는데 이 버튼은 아직 붙이지 않는다.
  `LetterDraftProvider`는 쿼리가 없으면 `reply.region`을 비워 둔다. 지역을 어떻게 정할지는 정해지지 않았다.
- **받은 편지 답장(5-10~)**: 이번 범위에 없다. `docs/letter-write.md`에 따라 `/letter-write`로 들어오며, 쿼리 이름은 합의가 필요하다(제안: `letterId`, `nickname`, `region`).
- **배송 지도(4-12)·직접 배달하기(9-1)**: 각각 `/delivery/:id/map`, `/delivery-game`로 연결만 했다. 화면은 해당 담당이 만든다.
- **일기 쓰기(6-1)**: `/diary/write`로 연결만 했다. 해당 브랜치에서 구현된 경로와 같은지 통합할 때 확인해야 한다.
- **우표**: 카드의 우표는 `shared/ui/Stamp`가 `shared/assets/stamp`의 파일 이름으로 그린다. 서버 우표 `code`가 그림 이름과 같으면 그대로, 다른 두 개(`long-delivery`→`long-way`, `cat-birthday`→`hometown-birthday`)는 `mailboxMapper.toStampArtId`가 바꾼다(`components/letter-write/data.js`의 `stampArtIdOf`와 같은 표를 따로 둠).

## 구현 구조

- 화면·상태: `pages/mailbox/MailboxPage` (탭, 정렬, 로딩, 비었을 때 판단).
- 기능 전용 UI: `components/mailbox/`
  - 탭·카드: `MailboxTabs`, `NewLetterFilters`(지역 드롭다운 + 정렬 칩), `useSidoOptions`(시·도 목록), `LetterCard`(5-1), `ChatCard`(5-3), `ShippingCard`(5-5), `StoredCard`(5-7)
  - 안내: `MailboxEmpty`(비었을 때 4종 공용), `StoredNotice`(5-7), `GameBanner`(5-5)
  - 정의: `mailboxFilters.js`(탭·정렬 칩)
- 데이터 흐름: `MailboxPage` → `mailboxApi.js`(`fetchMailboxLetters`, `fetchMailboxSummary`) → `shared/api/client.js`의 `request()` → 서버 → `mailboxMapper.js`(`toMailboxPage`)
  - 화면은 서버 필드를 직접 쓰지 않고 변환 결과(`items`, `count`, `hasNext`)만 쓴다. 명세가 바뀌면 mapper와 api 파일만 고친다.
  - mapper가 만드는 것: 시간 문구("6시간 걸려 도착", "도착까지 5시간 41분"), 날짜 문구, 진행률과 남은 시간(`sent_at`·`arrives_at`과 기기 시계로 계산), 대화 상태별 배지·문구, 보관 종류별 이름·배지·이동 경로.
  - 목록 응답은 `{count, next, previous, results}`(`?page=`)이다. `next`는 있는지만 보고 다음 페이지 번호는 화면이 센다.
- mock 모드: `mailboxDemo.js`가 옛 mock(`shared/mocks/mailbox.js`)을 서버 응답 모양으로 바꿔 같은 mapper에 넘긴다. `VITE_API_MOCK=true`이고 개발 서버일 때만(`shared/api/client.js`의 `isApiDemo`) 쓰며, 서버 호출이 실패해도 mock으로 채우지 않는다.
- 재사용한 공용 컴포넌트: `Chip`, `Icon`, `Stamp`, `Mascot`, `Button`, `Skeleton`, `TabBar`(기존 레이아웃이 표시).
- 공용 에셋은 수정하지 않았다. Figma에서 받은 `components/mailbox/assets/envelope-fold.svg`(5-1 카드의 봉투 접힌 선) 하나만 추가했다.
- 최대 430px, 좌우 20px, 카드·탭·버튼은 100%와 flex로 맞춘다. 높이·폰트·아이콘 크기는 시안의 px를 그대로 쓴다.
- 로딩은 `Skeleton`을 탭별 카드 높이(100·110·126·86)에 맞춰 보여 준다.

## 서버 연동과 mock 모드

- **전환**: `.env`의 `VITE_API_MOCK`이 `true`이고 개발 서버(`import.meta.env.DEV`)일 때만 mock이다(`shared/api/client.js`의 `isApiDemo`). 기본은 서버 호출이다. 로컬에서 서버로 확인하려면 `VITE_API_MOCK=false`로 두고 가입한 계정으로 로그인한 토큰을 쓴다(토큰은 코드·문서에 적지 않는다).
- **에러 형식**: `client.js`의 `ApiError`(`status`, `code`, `message`)를 따른다. 401(`TOKEN_NOT_VALID`)은 `client.js`가 갱신을 시도하고, 갱신도 안 되면 세션을 비운다.
- **mock 모드의 상태 유지**: 읽음·답장·넘김은 `mailboxMockStore.js`(메모리)에 두고 `mailboxDemo.js`(목록)와 `letterReceiveDemo.js`(상세)가 같이 쓴다. 새로고침하면 처음으로 돌아간다. 서버 모드에서는 쓰지 않는다. 답장은 실제 발송 시점을 몰라 mock에서만 "답장하기"를 누르는 순간 대화 중으로 옮긴다.
- **mock 전용 값**(서버에는 없다): 새 편지 mock의 `subtitle`, 대화·보관 mock의 친구 id(`friend_id`)와 끝난 대화 표시. mock 모드는 이것들을 서버 응답 모양으로 바꿔 넘길 뿐 mapper는 서버 필드만 읽는다.
- **서버에 없어서 정한 것**
  - 카드 부제 "첫 편지 · 일기 답장": 새 편지 탭은 모두 "내 일기에 온 첫 편지"라서 고정 문구로 둔다(추정).
  - 대화 상대 프로필: `partner.avatar` 코드(`cat-basic`, `cat-wink`, `cat-sparkle`, `cat-shy`, `cat-smile`)를 고향이 표정으로 바꾸고, 모르는 코드는 기본 얼굴이다. 배경 색은 서버에 없어 id로 돌려 가며 고른다.
  - 시간 표기: 배송 시간은 시안에 보이는 글자 기준으로 올림한 시간만 보여 준다. 1시간 미만은 분이다. 서버가 데모 모드(편지가 1분 만에 도착)면 "1분 걸려 도착"이 나온다.
- **배송 중 문구(5-3)**: 대화 중 카드 `status: in_transit`의 아래 한 줄은 `last_letter.direction`으로 나눈다. `sent`는 "내가 보낸 편지가 가는 중이에요", `received`는 "상대 편지가 오는 중이에요", 값이 없으면 "편지가 가는 중이에요". 뒤의 두 문구는 시안에 없어서 정했다(`mailboxMapper.js`). 도착 전 상대 편지가 `received`로 오는지는 백엔드 확인 전이다.
- **고정 문구**: 보관 탭 안내 박스, 마무리된 대화의 "7일 동안 답장이 없어 조용히 마무리됐어요", "읽기만 할 수 있어요".
- **새로고침 없이는 낡는 화면**: 배송 중 편지가 도착해도 목록이 저절로 바뀌지 않는다. 탭을 다시 누르거나 화면에 다시 들어올 때 새로 받는다(주기 갱신은 넣지 않았다).

## 추후 연동·PR 참고

- 관련 명세: 문서 레포 `api/mailbox.md`(`GET /api/mailbox/summary/`, `/new/`, `/conversations/`, `/in-transit/`, `/archive/`), `api/common.md`.
- 아직 연결하지 않은 것: 5-12를 여는 쪽(`DonePage`, 채현님 영역). 5-12 화면은 발송 응답(`granted_stamps`·`unlocked_rewards`)을 router state로 받고 `GET /api/stamps/`로 모은 개수를 받는다. 5-13은 `GET /api/stamps/rewards/`·`POST /api/stamps/rewards/{code}/seen/`로 연결했고 앱 진입 때 자동 조회는 하지 않는다.
- 명세와 어긋나거나 확인이 필요한 점은 PR 설명서에 적는다(보관 `passed_letter`의 상세에서 `can_reply`·`can_pass`, 새 편지 `diary`가 null일 수 있음 등).

관련 지침: `CLAUDE.md`, `docs/ownership.md`, `docs/letter-write.md`.
