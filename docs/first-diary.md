# 02 첫 고향 일기

Figma: `9OwwhbOqsCx2zGORvVCe45` / `216:4507`.
대상: `87:635`(2-1 가입 완료), `204:3808`(2-2 첫 고향 일기), `204:3850`(2-3 완료).

## 경로와 가입 연결

- `/signup/complete` → `/diary/first`: 가입 완료 진입점.
- `/diary/first` 또는 `/diary/first/welcome`: 가입 완료·첫 걸음 우표 안내.
- `/diary/first/write`: 글감 변경, 선택 사진 1장, 1~500자 첫 일기.
- `/diary/first/complete`: 게시 완료·첫 일기 우표 안내. 완료 상태가 없으면 작성으로 이동.
- 완료 버튼은 기존 `/home`으로 이동한다. 03 홈 화면은 이번 범위에 포함하지 않는다.

가입 구현에서 성공 후 다음 값을 전달한다.

```jsx
navigate('/signup/complete', {
  state: {
    profile: {
      nickname,
      hometowns: [{ province: '충남', district: '천안' }],
      residence: { province: '서울', district: '성북' },
    },
  },
})
```

가입 성공 시 프로필을 브라우저에 저장하고 위 진입점으로 이동하도록 연결했다.

## 저장 경계

화면은 `shared/api/firstDiary.js`의 `publishFirstDiary`를 호출한다.
개발 환경에서 `shared/api/ownedDiary.js`의 공통 저장소를 사용한다.
첫 일기도 `/diary/mine` 목록에 나타나며, 같은 사용자의 첫 일기 재등록을 방지한다.
사진은 Data URL로 브라우저에 저장한다. 로컬 피드는 같은 저장소를 구독한다.
서버 게시, 실제 우표 지급, 서버 인증은 수행하지 않는다.
운영 빌드에서는 미연결 오류를 표시하고 작성 내용을 유지한다.
사진은 선택한 파일의 미리보기만 제공하며 브라우저 URL은 교체·삭제·종료 시 해제한다.
작성 중 초안은 새로고침하면 사라진다. 등록한 일기·사진·완료 상태는 브라우저 저장소에서 복원한다.
중복 클릭 및 완료 후 뒤로 가기로 인한 재게시를 막는다.

## 구조·검토

- 화면 상태·경로: `pages/diary`.
- 화면 전용 UI·장식: `components/diary`.
- 공용 `Button`, `Icon`, `Mascot`, `Stamp`와 기존 라우트의 Suspense·Loading·ErrorBoundary 재사용.
- 원본 공용 에셋과 다른 담당자의 편지·우체통·마이 기능은 수정하지 않는다.
- 공유 에셋에 없는 장식 원·점 9개만 `components/diary/assets`에 추가한다.
- 최대 너비 430px, 좌우 20px, 내부 너비는 flex·100%를 적용한다.

관련 지침: `CLAUDE.md`, `docs/ownership.md`.
지침의 `../2026-4thon-11-dongle-documents`는 로컬에 없어 API·spec 대조를 하지 못했다.
PR에는 이 경로와 미연결 항목을 명시하고 `shared/api`, `shared/mocks` 추가를 공용 담당자에게
리뷰받아야 한다. 실제 저장·게시 및 글감 정책은 서버 명세에 맞춰 교체한다.
