# 편지 쓰기 흐름 (경로·URL 파라미터·작성 상태)

편지 쓰기(04) 담당: 채현. 다른 담당 화면(일기 상세, 우체통)에서 편지 쓰기로 들어올 때 이 규칙을 따른다.

## 경로

| 단계 | 경로 | 화면 |
|---|---|---|
| 1 편지지 | `/letter-write/paper` | 4-1 |
| 2 내용 | `/letter-write/content` | 4-2, 4-3 |
| 3 서명 | `/letter-write/signature` | 4-4, 4-5 |
| 4 우표 | `/letter-write/stamp` | 4-6, 4-7 |
| 발송 연출 | `/delivery/:letterId/sending` | 4-10 |
| 발송 완료 | `/delivery/:letterId/done` | 4-11 |
| 실시간 배송 지도 | `/delivery/:letterId/map` | 4-12 |

- `/letter-write`로 들어오면 `/letter-write/paper`로 이동한다. 쿼리는 그대로 유지한다.
- 4-8(쓰다가 나가기), 4-9(쓰던 편지 이어 쓰기)는 경로가 아니라 다이얼로그·바텀시트이다.
- `letterId`는 편지를 보낸 뒤 받는 편지 번호이다(가정). 백엔드 API가 정해지면 확인한다.
- 단계의 순서와 경로는 `src/components/letter-write/steps.js`에서만 정한다.

## 편지 쓰기로 들어올 때 URL 쿼리

일기 상세(효령)와 우체통(채원)에서 편지 쓰기로 이동할 때 아래 쿼리를 붙인다.

```
/letter-write?diaryId=12&nickname=하늘빛&region=충남 천안
```

| 쿼리 | 의미 | 필수 |
|---|---|---|
| `diaryId` | 답장하는 일기 번호 | 일기에 답장할 때만 |
| `nickname` | 상대 닉네임 | 일기에 답장할 때만 |
| `region` | 편지를 받을 지역 | 필수 |

- 일기에 답장하는 게 아니라 고향 지역에 띄우는 편지는 `region`만 넣는다.
- `region`의 값 형식(지역 이름 또는 지역 코드)은 `shared/region`의 지역 데이터가 정해지면 그에 맞춘다. 지금은 지역 이름 문자열로 가정한다.
- 한글·공백은 주소에 넣을 때 인코딩한다(`URLSearchParams`나 `new URL`을 쓰면 자동).
- 쿼리는 처음 들어올 때 한 번 읽어 작성 중 상태의 `reply`에 담는다. 이후 단계 주소에는 쿼리가 없어도 된다.

## 다른 화면과의 연결

- **받은 편지 답장(5-10~, 채원)**: 같은 4단계 흐름을 재사용한다. 우체통의 답장 화면은 별도 흐름을 만들지 않고
  `/letter-write`로 들어온다. 이 경우 일기 대신 받은 편지가 답장 대상이 되므로 쿼리가 더 필요하다.
  쿼리 이름은 채원과 합의해 이 문서에 적는다(제안: `letterId`, `nickname`, `region`).
- **쓰던 편지 이어 쓰기(4-9)**: 일기 상세(효령)의 "편지로 답장하기"는 `navigate`로 직접 가지 말고
  `useStartLetter()`(`components/letter-write`)를 쓴다. 임시저장한 편지가 있으면 "이 일기에 쓰던 편지가 있어요"
  바텀시트(새로 쓰기 / 이어 쓰기)가 먼저 뜨고, 없으면 바로 편지 쓰기로 간다.
  ```js
  const startLetter = useStartLetter()
  startLetter({ diaryId: '12', nickname: '하늘빛', region: '충남 천안' })
  ```
  임시저장은 일기마다 하나(일기에 답장하지 않는 편지는 하나)이고, 지금은 이 브라우저의 localStorage에 둔다(mock, `letterDraftStorage.js`).
  저장 API가 정해지면 그 파일의 함수 안쪽만 바꾼다. "이어 쓰기"는 저장했던 단계로 돌아가고, 편지를 보내면 임시저장은 지워진다.
- **쓰다가 나가기(4-8)**: 본문을 쓰는 2단계(내용)에서 헤더 뒤로가기를 누르면, 본문을 썼을 때 확인 다이얼로그
  ("저장 안 함 / 임시저장 / 계속 쓰기")가 먼저 뜨고 편지 쓰기를 나간다. 본문이 비어 있으면 1단계로 돌아간다.
  1단계에서는 바로 나가고, 3~4단계에서는 이전 단계로 간다. "임시저장"을 누르면 저장하고 나가며(위 4-9), "저장 안 함"은 저장한 것도 지우고 나간다.
- **우표 단계(4-6, 4-7)**: `/letter-write/stamp`에 들어오면 쓴 편지 미리보기 위에 "편지를 보낼까요?" 바텀시트가
  바로 열린다. "다시 보기"는 시트만 닫고(아래 "우표 고르기" 버튼으로 다시 연다), "보내기"는 고른 우표를
  `stampId`에 담고 `/delivery/:letterId/sending`으로 이동한다. 보내기 API가 정해지기 전에는 `letterId`가
  임시 값(`mock`)이다. 내 우표 목록과 도착 시간, 내 지역은 mock이다. 시트는 우표가 1장이면 목록 대신 안내 카드(4-7)를 보여준다.
- **발송 완료(4-11)**: `/delivery/:letterId/done`에서 도착까지 남은 시간(1초마다 갱신)과 진행 바, 새로 받은 우표 알림을
  보여준다. 출발·도착 지역, 전체 소요 시간, 받은 우표는 mock(`components/delivery/data.js`)이다.
  "홈으로"는 `/home`, "배송 지도 보기"는 `/delivery/:letterId/map`(4-12)으로 이동한다.
- **실시간 배송 지도(4-12)**: `/delivery/:letterId/map`. 지도 배경 5종(도시·바다·산·논밭·강가) 중 편지 번호(`letterId`)로
  하나를 골라 쓴다(같은 편지는 항상 같은 배경). 편지 위치는 진행률로 길 위에 놓고(`components/delivery/mapRoute.js`),
  아래 시트에 도착까지 남은 시간과 지나가는 동네 소식을 보여준다. 길의 모양, 동네, 소식, 진행률은 mock이다.
- **직접 배달하기**: 우표 단계(4-6, 4-7), 발송 완료(4-11), 배송 지도(4-12)에 "직접 배달하기" 버튼이 있고
  9-1(보류)로 이어진다. 9번 섹션이 정해질 때까지 버튼은 자리만 둔다.

## 작성 중 상태

`useLetterDraft()` (`src/components/letter-write`)가 단계를 오가도 유지되는 상태를 제공한다.

```js
const { draft, updateDraft, resetDraft } = useLetterDraft()
updateDraft({ content: '안녕' })
```

| 항목 | 설명 |
|---|---|
| `reply` | `{ diaryId, nickname, region }` 위 쿼리에서 읽은 값 |
| `paperId` | 고른 편지지 |
| `content` | 본문 |
| `fontId` | 고른 글씨체 |
| `signature` | 서명 그림. `{ ops: [...] }` 그린 순서대로 쌓은 작업 목록(선, 스티커). 좌표는 그림판 크기에 대한 0~1 비율 |
| `stampId` | 고른 우표 |

- `signature.ops`의 선은 `{ type: 'stroke', erase, color, points }`, 스티커는 `{ type: 'sticker', id, pose, x, y }`이다.
  되돌리기는 맨 뒤 작업 하나를 뺀다.
- 서버로 보낼 때의 형식(이미지 또는 좌표 목록)은 API가 정해지면 맞춘다. 그림 데이터는 이미지가 아니라 좌표라서 어느 쪽으로도 만들 수 있다.

- 새로고침하면 작성 중이던 상태는 사라진다. "임시저장"으로 저장한 것만 남는다(위 4-9).
- 상태는 메모리(React context)에만 있고 외부 상태관리 라이브러리는 쓰지 않는다.

## 화면 틀

`src/app/layouts/StepLayout.jsx`가 헤더, 단계 표시, 아래 버튼 영역을 제공한다.
단계 화면은 `StepLayout`으로 감싸고, 아래 버튼은 `StepFooter`(다음 / 건너뛰기 + 다음)를 쓴다.
