# 05 우체통

Figma: `9OwwhbOqsCx2zGORvVCe45`, 섹션 `92:999`(05 우체통·편지 받기).
대상: 5-1~5-7-1 (`92:1001`, `92:1441`, `128:1601`, `171:2173`, `92:1129`, `171:2276`, `128:1746`, `340:5612`).
5-8 이후(편지 열기·답장 등)와 5-14, 5-15(`pen-pal`)는 이번 범위에 없다.

| 화면 | Figma | 경로·동작 |
| --- | --- | --- |
| 5-1 새 편지 | `92:1001` | `/mailbox` 첫 탭. 정렬 칩(지역별 ▾·최신순·오래된순·안읽음), 편지 카드 |
| 5-2 새 편지 비었을 때 | `92:1441` | 새 편지 목록이 비면 표시. 버튼 "고향 일기 쓰러 가기" → `/diary/write` |
| 5-3 대화 중 | `128:1601` | 대화 중 탭. 칩 없음, 상태 배지·왕복 점이 있는 대화 카드 |
| 5-4 대화 중 비었을 때 | `171:2173` | 버튼 "새 편지 보러 가기" → 이동 없이 새 편지 탭으로 전환 |
| 5-5 배송 중 | `92:1129` | 배송 중 탭. 진행 바 카드, "지도 보기", 맨 아래 배달 게임 안내 |
| 5-6 배송 중 비었을 때 | `171:2276` | 버튼 "편지 쓰러 가기" → `/letter-write` |
| 5-7 보관 | `128:1746` | 보관 탭. 맨 위 안내 박스, 읽기 전용 보관 카드 |
| 5-7-1 보관 비었을 때 | `340:5612` | 안내 문구만 있고 버튼은 없다 |

- 탭(새 편지·대화 중·배송 중·보관)과 정렬은 주소가 아니라 화면 상태이다. 새로고침하면 새 편지 탭으로 돌아간다.
- 정렬 칩은 새 편지 탭(비었을 때 제외)에만 있다. 오른쪽 위 필터 아이콘은 새 편지(비었을 때 제외)와 배송 중 탭에만 있다.
- 새 편지 탭 글씨 옆 점은 읽지 않은 편지가 있을 때만 보인다. 5-2 시안에는 비어 있는데도 점이 있지만 시안과 다르게 구현했다.
- 하단 탭바는 기존 `TabBarLayout`이 `/mailbox`에서 보여 준다.
- 개발 모드에서 `/mailbox?mock=empty`로 들어가면 모든 탭의 mock이 비어 5-2, 5-4, 5-6, 5-7-1을 볼 수 있다. 운영 빌드에서는 동작하지 않는다.

## 경로와 가정

모든 데이터는 mock이다. 이동 경로는 API·화면이 정해지지 않아 가정한 것이다.

| 위치 | 이동 경로 | 상태 |
| --- | --- | --- |
| 새 편지 카드, 넘긴 편지(보관) | `/mailbox/:letterId` | `RoutePlaceholder` "편지" |
| 대화 카드, 마무리된 대화(보관) | `/mailbox/chats/:chatId` | `RoutePlaceholder` "대화" |
| 5-2 "고향 일기 쓰러 가기" | `/diary/write` | 공용 `TabBar`의 기본 경로와 같다. `/diary/*`가 `RoutePlaceholder`이다 |
| 5-5 "지도 보기" | `/delivery/:id/map` | `letterRoutes`의 `RoutePlaceholder`(4-12) |
| 5-5 배달 게임 안내 | `/delivery-game` | `letterRoutes`의 `RoutePlaceholder`. 어느 편지의 게임인지 넘기는 방법은 정하지 않았다 |
| 5-6 "편지 쓰러 가기" | `/letter-write` | 구현된 편지 쓰기 화면 |

- `/mailbox`, `/mailbox/:letterId`, `/mailbox/chats/:chatId`만 등록했다. 그 밖의 `/mailbox/...` 경로는 "페이지를 찾을 수 없어요" 화면이 나온다.
- 경로를 바꿔야 하면 `mailboxMapper.js`(카드의 이동 경로, `mapPath`), `ShippingCard`, `StoredCard`, `GameBanner`, `MailboxPage.jsx`의 경로 상수를 고친다.

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
  - 탭·카드: `MailboxTabs`, `LetterCard`(5-1), `ChatCard`(5-3), `ShippingCard`(5-5), `StoredCard`(5-7)
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

## mock 처리와 백엔드 확인

**문서 레포 API 확정 전이며 백엔드가 Notion에 올린 초안의 내용을 참고했다.** 문서 레포 `api/`에는 편지(letters) 문서가 아직 없다.
필드 이름은 문서 레포 컨벤션(`api/common.md`: snake_case)을 따랐다. Notion 초안에서 참고한 것은 탭별 API 분리,
카드 필드(편지 id, 보낸 사람 닉네임·지역, 우표, 배송 소요 분, 도착 시각, 읽음 여부), 응답(목록·다음 커서·`has_next`), 정렬 옵션(최신순·오래된순·안읽음순)이다.

mock으로 처리한 부분:

- **목록 응답 형식**: mock은 `{ results, next_cursor, has_next }`이다. `api/common.md`의 목록 규칙(`?page=`, `count`·`next`·`previous`·`results`)과 다르다. `has_next`는 받기만 하고 더 보기 UI는 없다(시안에 없음).
- **정렬**: 새 편지 탭에서만 mock이 정렬한다. 다른 탭은 mock 순서 그대로이다.
- **지역별 칩·필터 아이콘**: 표시만 있고 동작이 없다.
- **우표**: `stamp.code`로 그린다. `code`가 없고 `image_url`만 있으면 `<img>`로 그리는 대비책이 있으나 mock에서는 쓰지 않는다.
- **대화 상대 프로필**: 표정과 색을 id로 돌려 가며 고른다.
- **시간 표기**: 배송 시간은 시안에 보이는 글자 기준으로 올림한 시간만 보여 준다. 1시간 미만은 분이다.
- **고정 문구**: 보관 탭 안내 박스, 마무리된 대화의 "7일 동안 답장이 없어 조용히 마무리됐어요", "읽기만 할 수 있어요".
- **mock 전용 필드**(Notion 초안에 없음):
  - 새 편지: `subtitle`("첫 편지 · 일기 답장"). 없으면 그 줄이 사라진다.
  - 대화 중: `status`(`my_turn`·`waiting_reply`·`in_transit`·`ended`), `last_message_preview`, `round_trip_count`, `arrived_at`, `remaining_minutes`.
  - 배송 중: `direction`(`sent`·`received`), `counterpart_nickname`, `from_region`, `to_region`, `travel_minutes`, `remaining_minutes`. 진행률은 mapper가 이 둘로 계산한다.
  - 보관: `kind`(`passed_letter`·`ended_chat`), `stored_at`.

백엔드에 확인할 것:

1. 우표 식별 코드(`stamp.code`). Notion 초안은 이미지 URL뿐이라 `Stamp`로 그릴 수 없다.
2. 위 mock 전용 필드를 API에 둘지, 탭별 응답 필드로 어떻게 줄지.
3. 목록 형식: 커서(`next_cursor`, `has_next`)와 `?page=` 중 무엇으로 갈지.
4. 지역별 필터와 정렬 파라미터 이름.
5. 대화·보관 상세 화면의 경로와 5-5 "지도 보기"·게임 안내가 가리키는 편지를 넘기는 방법(letter id).

## 추후 연동·PR 참고

- 시안 파일은 `CLAUDE.md`에 적힌 파일(`gxnOomQf4NPWFaYGKrEwaU`)이 아니라 `9OwwhbOqsCx2zGORvVCe45`를 기준으로 했다.
- 5-5 "지도 보기"와 보관 카드 이동 경로는 mapper에서 정한다.
- 에러 화면은 따로 만들지 않았고 기존 `ErrorBoundary`에 맡긴다.
- `../2026-4thon-11-dongle-documents`의 `api/common.md`는 대조했고 `letters.md`가 없어 편지 API 대조는 할 수 없었다.
  PR에 관련 명세 경로(`api/common.md`)와 위 미연결 항목을 적는다.

관련 지침: `CLAUDE.md`, `docs/ownership.md`, `docs/letter-write.md`.
