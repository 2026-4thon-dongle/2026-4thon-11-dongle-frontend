# 05 우체통

Figma: `9OwwhbOqsCx2zGORvVCe45`, 섹션 `92:999`(05 우체통·편지 받기).
대상: 5-1~5-7-1 (`92:1001`, `92:1441`, `128:1601`, `171:2173`, `92:1129`, `171:2276`, `128:1746`, `340:5612`).
5-8 이후(편지 열기·답장 등)와 5-14, 5-15(`pen-pal`)는 이번 범위에 없다.

| 화면 | Figma | 경로·동작 |
| --- | --- | --- |
| 5-1 새 편지 | `92:1001` | `/mailbox` 첫 탭. 정렬 칩(지역별 ▾·최신순·오래된순·안읽음), 편지 카드 |
| 5-2 새 편지 비었을 때 | `92:1441` | 새 편지 목록이 비면 표시. 버튼 "고향 일기 쓰러 가기" → `/diary/write` |
| 5-3 대화 중 | `128:1601` | 대화 중 탭. 칩 없음, 상태 배지·왕복 점이 있는 대화 카드. 카드를 누르면 5-15(`/pen-pal/:friendId`)로 이동 |
| 5-4 대화 중 비었을 때 | `171:2173` | 버튼 "새 편지 보러 가기" → 이동 없이 새 편지 탭으로 전환 |
| 5-5 배송 중 | `92:1129` | 배송 중 탭. 도착 임박순 고정(정렬 칩 없음), 진행 바 카드, "지도 보기", 맨 아래 배달 게임 안내 |
| 5-6 배송 중 비었을 때 | `171:2276` | 버튼 "편지 쓰러 가기" → `/letter-write` |
| 5-7 보관 | `128:1746` | 보관 탭. 맨 위 안내 박스, 읽기 전용 보관 카드 |
| 5-7-1 보관 비었을 때 | `340:5612` | 안내 문구만 있고 버튼은 없다 |

- **탭은 주소 쿼리**에 둔다: `/mailbox?tab=new|chatting|shipping|stored`. 상세(5-8, 5-9, 5-15 등)에 갔다가 뒤로 나와도 보던 탭이 남는다.
  - 시작 탭 우선순위는 `navigate`의 `state.tab`(5-9 넘기기, 5-12, 5-13이 씀) > 쿼리 `?tab` > 새 편지. 잘못된 값은 새 편지로 본다. state로 열렸을 때도 쿼리를 그 탭으로 맞추고 state는 지운다.
  - 탭을 바꿀 때와 쿼리를 맞출 때는 `replace`라 히스토리가 쌓이지 않는다(뒤로 가기가 탭을 하나씩 거슬러 오르지 않는다). `mock=empty` 같은 다른 쿼리는 그대로 둔다.
  - 정렬 칩과 지역 필터는 아직 화면 상태이다. 상세에 다녀오면 처음(최신순·전체)으로 돌아간다.
- 이미 선택된 탭이나 정렬 칩, 지역을 다시 누르면 아무 일도 일어나지 않는다(로딩을 켜지 않는다).
- **지역 필터("지역별 ▾")**: 칩을 누르면 아래에 목록("전체" + 목록에 있는 시·도)이 열린다. **시안 없음, 임시 UI**이다(Figma 5-1에는 칩만 있고 선택 화면이 없다). 고르면 그 지역 편지만 보이고 칩에 지역 이름이 표시되며 "전체"를 고르면 풀린다. 바깥을 누르거나 Esc로 닫는다.
  지역 표기는 mock마다 달라("전주시", "충남 천안") `mailboxMapper.toProvince`가 `shared/region` 이름의 시·도("전북", "충남")로 맞춘다. 필터 결과가 비면 5-2가 아니라 칩 아래 한 줄 안내가 나온다.
- 정렬 칩은 새 편지 탭(비었을 때 제외)에만 있다. 오른쪽 위 필터 아이콘은 모든 탭에서 없앴다. 배송 중 탭은 남은 시간이 짧은 순으로 고정이다.
- **편지 상태에 따른 탭 이동**(mock, 화면을 오가는 동안만 유지·새로고침하면 처음으로): "나중에 읽을래요"는 읽음 처리 없이 한 칸 뒤로 돌아가(우체통에서 들어왔을 때, 보던 탭 그대로) 새 편지 탭에 빨간 점이 유지된다. 봉투를 열어 읽기만 한 편지는 새 편지 탭에 남되 점이 사라진다. "답장하기"를 누르면 대화 중 탭(배송 중 대화)으로, "넘기기"는 보관 탭(넘긴 편지)으로 옮겨지고 토스트("보관함으로 옮겼어요")와 함께 `?tab=stored`로 열린다. 같은 상대와의 대화가 이미 있으면 그 카드를 새 카드로 바꾼다.
- 새 편지 탭 글씨 옆 점은 읽지 않은 편지가 있을 때만 보이고, 지역 필터와 상관없이 전체 기준이다. 5-2 시안에는 비어 있는데도 점이 있지만 시안과 다르게 구현했다.
- 하단 탭바는 기존 `TabBarLayout`이 `/mailbox`에서 보여 준다.
- 개발 모드에서 `/mailbox?mock=empty`로 들어가면 모든 탭의 mock이 비어 5-2, 5-4, 5-6, 5-7-1을 볼 수 있다. 운영 빌드에서는 동작하지 않는다.

## 경로와 가정

모든 데이터는 mock이다. 이동 경로는 API·화면이 정해지지 않아 가정한 것이다.

| 위치 | 이동 경로 | 상태 |
| --- | --- | --- |
| 새 편지 카드, 넘긴 편지(보관) | `/mailbox/:letterId` | `RoutePlaceholder` "편지" |
| 대화 중 카드 | `/pen-pal/:friendId` | 5-15. 끝난 대화는 "답장 쓰기"가 없다 |
| 마무리된 대화(보관) | `/mailbox/:id` (임시) | 보관 카드는 모두 "찾을 수 없는 편지예요"로 간다. TODO: 넘긴 편지는 읽기 전용 화면, 끝난 대화는 5-15로 연결 |
| 5-2 "고향 일기 쓰러 가기" | `/diary/write` | 공용 `TabBar`의 기본 경로와 같다. `/diary/*`가 `RoutePlaceholder`이다 |
| 5-5 "지도 보기" | `/delivery/:id/map` | `letterRoutes`의 `RoutePlaceholder`(4-12) |
| 5-5 배달 게임 안내 | `/delivery-game` | `letterRoutes`의 `RoutePlaceholder`. 어느 편지의 게임인지 넘기는 방법은 정하지 않았다 |
| 5-6 "편지 쓰러 가기" | `/letter-write` | 구현된 편지 쓰기 화면 |

- `/mailbox`, `/mailbox/:letterId`, `/mailbox/chats/:chatId`만 등록했다. 그 밖의 `/mailbox/...` 경로는 "페이지를 찾을 수 없어요" 화면이 나온다.
- 경로를 바꿔야 하면 `mailboxMapper.js`(카드의 이동 경로, `mapPath`·`path`), `ShippingCard`, `StoredCard`, `GameBanner`, `MailboxPage.jsx`의 경로 상수를 고친다.

## 다른 담당 화면과 연결되는 지점

- **편지 쓰기(`/letter-write`)**: 5-6 버튼이 쿼리 없이 `/letter-write`로 이동한다. 그러면 `EntryRedirect`가 `/letter-write/paper`로 보낸다.
  `docs/letter-write.md`는 우체통·일기에서 들어올 때 `region`을 필수 쿼리로 적고 있는데 이 버튼은 아직 붙이지 않는다.
  `LetterDraftProvider`는 쿼리가 없으면 `reply.region`을 비워 둔다. 지역을 어떻게 정할지는 정해지지 않았다.
- **받은 편지 답장(5-10~)**: 이번 범위에 없다. `docs/letter-write.md`에 따라 `/letter-write`로 들어오며, 쿼리 이름은 합의가 필요하다(제안: `letterId`, `nickname`, `region`).
- **배송 지도(4-12)·직접 배달하기(9-1)**: 각각 `/delivery/:id/map`, `/delivery-game`로 연결만 했다. 화면은 해당 담당이 만든다.
- **일기 쓰기(6-1)**: `/diary/write`로 연결만 했다. 해당 브랜치에서 구현된 경로와 같은지 통합할 때 확인해야 한다.
- **우표**: 카드의 우표는 `shared/ui/Stamp`가 `shared/assets/stamp`의 파일 이름(`stamp.code`)으로 그린다. `shared/mocks/stamps.js`와 같은 id 체계이다.

## 구현 구조

- 화면·상태: `pages/mailbox/MailboxPage` (탭, 정렬, 로딩, 비었을 때 판단).
- 기능 전용 UI: `components/mailbox/`
  - 탭·카드: `MailboxTabs`, `NewLetterFilters`(지역 드롭다운 + 정렬 칩), `LetterCard`(5-1), `ChatCard`(5-3), `ShippingCard`(5-5), `StoredCard`(5-7)
  - 안내: `MailboxEmpty`(비었을 때 4종 공용), `StoredNotice`(5-7), `GameBanner`(5-5)
  - 정의: `mailboxFilters.js`(탭·정렬 칩)
- 데이터 흐름: `MailboxPage` → `mailboxApi.js`(`fetchMailboxLetters`) → `shared/mocks/mailbox.js` → `mailboxMapper.js`(`toMailboxPage`)
  - 화면은 서버(mock) 필드를 직접 쓰지 않고 변환 결과(`items`, `nextCursor`, `hasNext`)만 쓴다. 명세가 바뀌면 mapper와 api 파일만 고친다.
  - mapper가 만드는 것: 시간 문구("6시간 걸려 도착", "도착까지 5시간 41분"), 날짜 문구, 진행률, 대화 상태별 배지·문구, 보관 종류별 이름·배지.
- mock: `shared/mocks/mailbox.js`(새 파일, 기존 `shared` 파일은 수정하지 않았다). 탭별(`new`, `chatting`, `shipping`, `stored`)로 나뉘고 `empty` 옵션이 있다.
- 재사용한 공용 컴포넌트: `Chip`, `Icon`, `Stamp`, `Mascot`, `Button`, `Skeleton`, `TabBar`(기존 레이아웃이 표시).
- 공용 에셋은 수정하지 않았다. Figma에서 받은 `components/mailbox/assets/envelope-fold.svg`(5-1 카드의 봉투 접힌 선) 하나만 추가했다.
- 최대 430px, 좌우 20px, 카드·탭·버튼은 100%와 flex로 맞춘다. 높이·폰트·아이콘 크기는 시안의 px를 그대로 쓴다.
- 로딩은 `Skeleton`을 탭별 카드 높이(100·110·126·86)에 맞춰 보여 준다.

## mock 처리

mock으로 처리한 부분:

- **목록 응답 형식**: mock은 `{ results, next_cursor, has_next }`이다. `api/common.md`의 목록 규칙(`?page=`, `count`·`next`·`previous`·`results`)과 다르다. `has_next`는 받기만 하고 더 보기 UI는 없다(시안에 없음).
- **정렬**: 새 편지 탭에서만 mock이 정렬한다. 다른 탭은 mock 순서 그대로이다.
- **상태 유지**: 읽음·답장·넘김은 `mailboxMockStore.js`(메모리)에 두고 `mailboxApi`(목록)와 `letterReceiveApi`(읽음·답장·넘기기)가 같이 쓴다. 실제 API로 바꿀 때는 이 저장소를 지우고, `mailboxApi`의 `buildMockResponse` 블록과 `letterReceiveApi`의 `markLetterReplied`를 없앤다(서버가 상태가 반영된 목록을 준다). 답장은 실제 발송 시점을 몰라 "답장하기"를 누르는 순간 옮긴다.
- **배송 중 정렬·대화 상대 id**: 도착 임박순 정렬은 `mailboxApi`가 한다(서버가 정렬해 주면 지운다). 대화 카드의 친구 id(`friend_id`)와 끝난 대화 표시(`is_ended`, `penPalApi.js`의 감자왕)는 mock 전용 필드이다.
- **지역 필터**: 서버 파라미터가 정해지지 않아 `mailboxApi`가 mock 목록을 걸러 낸다. 지역 목록과 읽지 않음 점도 `mailboxApi`가 전체 목록에서 계산한다. 서버가 필터를 받으면 걸러내기를 파라미터로 바꾸고, 목록과 점은 서버 값을 쓴다.
- **우표**: `stamp.code`로 그린다. `code`가 없고 `image_url`만 있으면 `<img>`로 그리는 대비책이 있으나 mock에서는 쓰지 않는다.
- **대화 상대 프로필**: 표정과 색을 id로 돌려 가며 고른다.
- **시간 표기**: 배송 시간은 시안에 보이는 글자 기준으로 올림한 시간만 보여 준다. 1시간 미만은 분이다.
- **고정 문구**: 보관 탭 안내 박스, 마무리된 대화의 "7일 동안 답장이 없어 조용히 마무리됐어요", "읽기만 할 수 있어요".
- **mock 전용 필드**(Notion 초안에 없음):
  - 새 편지: `subtitle`("첫 편지 · 일기 답장"). 없으면 그 줄이 사라진다.
  - 대화 중: `status`(`my_turn`·`waiting_reply`·`in_transit`·`ended`), `last_message_preview`, `round_trip_count`, `arrived_at`, `remaining_minutes`.
  - 배송 중: `direction`(`sent`·`received`), `counterpart_nickname`, `from_region`, `to_region`, `travel_minutes`, `remaining_minutes`. 진행률은 mapper가 이 둘로 계산한다.
  - 보관: `kind`(`passed_letter`·`ended_chat`), `stored_at`.

## 추후 연동·PR 참고

- 5-5 "지도 보기"와 보관 카드 이동 경로는 mapper에서 정한다.
- `../2026-4thon-11-dongle-documents`의 `api/common.md`는 대조했고 `letters.md`가 없어 편지 API 대조는 할 수 없었다.
  PR에 관련 명세 경로(`api/common.md`)와 위 미연결 항목을 적는다.

관련 지침: `CLAUDE.md`, `docs/ownership.md`, `docs/letter-write.md`.
