# 05 편지 받기, 받은 편지에 답장, 보상·펜팔 (5-8~5-15)

Figma: `9OwwhbOqsCx2zGORvVCe45`, 섹션 `92:999`(05 우체통·편지 받기). 5-1~5-7-1은 `docs/mailbox.md`를 본다.
대상: 5-8 `92:1095`, 5-9 `92:1247`, 5-10 `169:1842`, 5-11 `169:1919`, 5-12 `171:2379`, 5-13 `219:5250`, 5-14 `92:1290`, 5-15 `92:1401`.

| 화면 | 경로 | 동작 |
| --- | --- | --- |
| 5-8 새 편지 도착 | `/mailbox/:letterId` | 읽지 않은 편지(가정). "봉투 열기" → 읽음 처리 후 5-9, "나중에 읽을래요" → `/mailbox` |
| 5-9 편지 열람 | `/mailbox/:letterId` | 읽은 편지. 넘기기(토스트 후 `/mailbox`), 답장하기, 오른쪽 위 "…"(시트) |
| 5-10, 5-11 답장 | `/letter-write?letterId=…&nickname=…&region=…` | 새로 만들지 않고 편지 쓰기(4-1, 4-2)로 연결만 한다 |
| 5-12 우표 획득 | `/mailbox/stamp-gained` | "우표첩 보기" → `/mypage/stamps`, "확인" → `/mailbox` |
| 5-13 보상 해금 | `/mailbox/reward-unlocked` | "스티커 써보기" → `/letter-write`, "확인" → `/mailbox` |
| 5-14 펜팔 친구 | `/pen-pal` | 친구 카드 → 5-15 |
| 5-15 주고받은 편지 | `/pen-pal/:friendId` | 시간순 카드, "답장 쓰기" → 5-10으로 연결 |

- 개발 모드에서만 동작하는 확인 주소: `/mailbox/101`·`102`(5-8), `/mailbox/103`·`104`(5-9), `/mailbox/reward-unlocked?threshold=3|5|10|15`, `/mailbox/stamp-gained?unlock=3`("확인"이 5-13으로 이어짐), `/pen-pal?mock=empty`, `/pen-pal/1`·`2`·`3`.
- 5-12, 5-13은 언제 뜨는지가 정해지지 않아 어디에서도 보내지 않고 주소로 직접 연다.
- 읽음·답장·넘김은 이번 접속의 메모리(`mailboxMockStore.js`)에만 있고 우체통 목록(5-1, 5-3, 5-7)에 반영된다. 새로고침하면 처음으로 돌아간다. 탭 이동 규칙은 `docs/mailbox.md`를 본다.

## 구현 구조

- 페이지: `pages/mailbox/LetterPage`(5-8, 5-9), `StampGainedPage`(5-12), `RewardUnlockedPage`(5-13), `pages/pen-pal/PenPalPage`(5-14), `PenPalLettersPage`(5-15).
- `components/mailbox/`: `LetterArrival`, `LetterPaper`(읽기 전용 편지지), `LetterMenuSheet`, `CelebrationFrame`(5-12·5-13 공용 틀), `StampGainScene`, `RewardPreview`.
- `components/pen-pal/`: `PenPalCard`, `PenPalLetterCard`.
- 데이터 흐름: 페이지 → `*Api.js` → `shared/mocks`(`letterDetail.js`, `stampReward.js`, `penPal.js`) → `*Mapper.js` → 화면. 화면은 서버 필드를 직접 쓰지 않는다.
- 채현님 `components/letter-write`와 마이 `RewardThumb`는 가져다 쓰지 않고 우체통 안에 따로 만들었다. 공용 컴포넌트는 `Header`, `Button`, `Icon`, `Mascot`, `Stamp`, `Skeleton`, `useOverlay`를 썼다. `shared`의 기존 파일은 수정하지 않았다.

## 임시 경로와 연결

- 경로 `/mailbox/stamp-gained`, `/mailbox/reward-unlocked`, `/pen-pal/:friendId`는 가정이다. 답장 쿼리(`letterId`, `nickname`, `region`)는 `docs/letter-write.md`의 제안이다.
- 채현님 `LetterDraftProvider`는 `diaryId`, `nickname`, `region`만 읽는다. `letterId`는 읽지 않아 5-10의 "Re. {닉네임}님의 편지"와 5-11의 "편지 다시 보기 ›"는 아직 동작하지 않는다.
- `/mypage/stamps`는 이 브랜치에서 `/mypage/*`의 `RoutePlaceholder`이다(마이는 `feature/22-mypage-ui`). 마이 7-1의 "펜팔 친구"는 `/pen-pal`로 연결되어 있다.

## mock과 명세

- 문서 레포 `api/`에 편지·펜팔·우표 API가 없다. `spec/mail.md`(MAIL-05, 06, 08, 09)와 `spec/stamp.md`(STAMP-05, 획득 모달)를 참고해 mock을 만들었고 모두 mock 전용이다.
- 펜팔 기준은 mock에서만 "편지 3통 이상"으로 정했다(`spec/mail.md`는 편지 3통인지 왕복 3회인지 미정). 5-14의 "귤껍질 · 편지 2통"은 이 기준에 맞춰 3통으로 바꿨다.
- 5-9의 서명은 이미지(명세) 대신 손글씨 문구(`signature_text`, mock 전용)로 보여 준다. 편지지는 한 가지(기본)만 그린다.
- 5-13의 보상 4개와 개수(3, 5, 10, 15)는 `spec/stamp.md`를 따랐다. 스티커 외 보상의 사용 안내 문구와 버튼 이름은 mock에서 정했다.

## 시안에 없어서 정한 것

- 5-8은 읽지 않은 편지, 5-9는 읽은 편지로 열었다. 넘기기 토스트 "보관함으로 넘겼어요", "…" 시트(신고하기·차단하기, 누르면 "준비 중이에요" 토스트)의 모양과 문구.
- 5-9의 "붙일 우표가 없나요? 만들고 바로 답장해요" 줄은 보류 기능(요청 `1110_be2fe_hold-entry-points`) 진입점이다. `LetterPage.jsx`의 `SHOW_STAMP_MAKE_ENTRY`로 켜고 끄며(지금은 켬), 눌러도 토스트만 나온다. 팀이 숨길지 정한다.
- 시안과 달라진 곳: 5-13 진행 바는 시안이 30%인데 다음 보상(5개)과 맞지 않아 모은 개수 ÷ 다음 보상 개수(3/5)로 그린다. 5-15는 "6통"인데 카드가 4개여서 mock에 편지를 더 넣었다.

## 확인이 필요한 것

- 답장 쿼리와 `letterId` 처리, 5-11 "편지 다시 보기 ›". 5-12·5-13이 4-10, 4-11 어디에 끼는지. 읽기 전용 편지지를 `shared`로 올릴지(중복 해소). 해금된 편지지·글씨체·스티커를 편지 쓰기에서 고르는 방법.
- 5-9 "…" → 신고·차단을 3-6~3-8과 어떻게 연결할지.
- 5-8과 5-9의 구분 기준, 5-9 "…" 메뉴, 펜팔 친구가 없을 때·넘기기 후 화면, 5-14 "편지 2통" 예시, 5-13 진행 바.
- 편지 상세·읽음·넘기기·답장, 펜팔 목록·상대별 기록, 우표 획득·보상 해금 API(`requests/`로 요청 필요). 펜팔 기준, 첫 왕복 우표 지급 대상·시점, 새로 받은 우표·보상을 응답에 담는 방식.

관련 지침: `CLAUDE.md`, `docs/ownership.md`, `docs/mailbox.md`, `docs/letter-write.md`.
