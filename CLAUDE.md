# 동글 (동네에서 온 글) — 프로젝트 가이드

멋쟁이사자처럼 4호선톤 프로젝트. 프론트엔드 3명이 Figma 섹션별로 나눠 개발한다.

## 서비스 요약

고향을 떠나 타지에서 사는 **대학생**끼리 서로의 고향 동네 이야기를 일기로 남기고, 댓글 대신 **느린 손편지**로 주고받는 웹앱. 편지는 실제 거리만큼 천천히 배달된다.

- **가입**: 학교 이메일(ac.kr) 인증, 비밀번호 없이 메일 코드 로그인. 닉네임은 `From. 다인` 형태로 편지에 적힘(실명 금지). 본가 지역(시·군), 거주 지역(구) 설정.
- **고향 일기**: 내가 사는 동네의 하루를 일기로 작성(사진 선택, 최대 1장). 그 지역이 고향인 사람의 피드에 먼저 노출. 홈은 "고향↔타지" / "전체 타지" 피드. 공개범위: 모두 / 고향 사람만 / 나만.
- **편지**: 일기에 답장 또는 고향 지역에 랜덤으로 띄우기. 4단계(편지지 → 내용 → 서명 → 우표). 손글씨 서명 캔버스, 글씨체 선택, 개인정보(전화번호 등) 감지 경고, 쓰다가 나가면 임시저장.
- **배송**: 소인 찍는 발송 연출 → 발송 완료(도착까지 남은 시간) → 실시간 배송 지도 → "직접 배달하기" 미니게임(성공 시 -30분, 지역 우표/스티커 획득).
- **우체통**: 새 편지 / 배송 중 / 대화 중 / 보관 탭. 편지 2번 이상 주고받으면 펜팔 친구.
- **마이페이지**: 내 일기, 17개 지역 우표첩, 지역·닉네임 수정, 이메일 알림 설정(하루 한 번 모아서), 차단 목록, 로그아웃·탈퇴.
- **안전/공통**: 신고, 차단, 개인정보 경고, 로딩 스켈레톤, 네트워크 에러 화면.
- 알림은 웹앱이라 **이메일**로 발송.

## 기술 스택

- React + **JavaScript** (`.jsx`, TypeScript 안 씀), Vite 기준
- props 설명은 PropTypes 또는 JSDoc
- 스타일링: CSS (디자인 토큰은 `shared/styles` 사전 작업에서 설정)
- 라우터: React Router (`react-router-dom`)
- 상태관리 / 지도 API: **미정** (정해지면 이 파일에 기록할 것)

## Figma

- 파일: https://www.figma.com/design/gxnOomQf4NPWFaYGKrEwaU/동글-시안
- fileKey: `gxnOomQf4NPWFaYGKrEwaU`
- 페이지 `Page 1` (node-id `0:1`)이 매우 커서 전체를 한 번에 읽으면 실패한다. **섹션/프레임 단위 node-id로 `get_design_context` / `get_screenshot`을 호출할 것.**
- 구성: `00 디자인 시스템`, `고향이`(마스코트 5포즈), `02 컴포넌트`, 섹션 `01 온보딩·가입` ~ `06 공통 상태`
- 화면 번호 규칙: `섹션-순번` (예: `3-4 편지지 선택`). 화면 이름이 곧 라우트/컴포넌트 이름의 기준.

## 디자인 시스템

- 색상 변수(Figma 이름 그대로 CSS 변수화): `bg/cream`, `bg/surface`, `bg/butter`, `bg/peach`, `brand/orange`, `brand/orange-deep`, `brand/sage`, `brand/sky`, `brand/berry`, `brand/blush`, `text/brown`, `text/sub`, `text/hint`, `line/soft`, `white`
- 타이포: Display/32·Title/24·20·17·Label/15 = **Jua**, Body/15·13·Caption/11 = **Gowun Dodum**, Letter/22 = **Nanum Pen**(편지 본문)
- 공용 컴포넌트(Figma `02 컴포넌트`): Button(Primary/Secondary/Ghost), Chip(기본/선택/연한), Header, TabBar(홈/우체통/마이), Stamp(6색), Input
- 마스코트 `고향이` 포즈: 얼굴 / 웃음 / 졸림 / 편지 / 인사

## 담당 분배 (Figma 섹션 기준)

| 담당 | 섹션 | 비고 |
|---|---|---|
| **A** | 01 온보딩·가입 + 02 홈·일기 | 약 30화면, 폼·리스트 위주 |
| **B** | 03 편지 쓰기·배송 | 약 18화면. 서명 캔버스, 배송 지도, 배달 게임이 가장 무거움. 3-16 게임은 후순위 |
| **C** | 04 우체통 + 05 마이페이지 | 약 21화면, 탭 목록·설정 |
| 공통 | 06 공통 상태(로딩/에러) | 사전 작업에서 `shared`에 구현 |

## 폴더 구조

```text
src/
├─ app/
│  ├─ App.jsx
│  ├─ routes/
│  │  ├─ index.jsx            # 라우트 합치기 (공용)
│  │  ├─ authRoutes.jsx       # A
│  │  ├─ letterRoutes.jsx     # B
│  │  └─ mailboxRoutes.jsx    # C (마이 포함)
│  └─ layouts/                # TabBarLayout, StepLayout
├─ pages/
│  ├─ intro/
│  ├─ signup/
│  ├─ login/
│  ├─ home/
│  ├─ diary/
│  ├─ notification/
│  ├─ letter-write/
│  ├─ delivery/
│  ├─ delivery-game/
│  ├─ stamp-make/
│  ├─ mailbox/
│  ├─ pen-pal/
│  └─ mypage/
├─ components/                # 기능별 전용 컴포넌트 (pages와 1:1)
│  ├─ intro/ signup/ login/ home/ notification/ diary/
│  ├─ letter-write/ delivery/ delivery-game/ stamp-make/
│  └─ mailbox/ pen-pal/ mypage/
└─ shared/                    # 사전 작업으로 먼저 완성
   ├─ ui/         # RoutePlaceholder(임시), Button, Chip, Header, TabBar, Stamp, Input, BottomSheet, Dialog, Toast, EmptyState, Mascot
   ├─ feedback/   # Loading(스켈레톤 6-1), ErrorScreen(6-2), ErrorBoundary
   ├─ region/     # RegionPicker, 17개 지역 데이터
   ├─ styles/     # global.css(전역 reset), tokens.css, fonts
   ├─ api/
   ├─ mocks/      # 목 데이터 (일기, 편지, 우표, 신고·차단)
   ├─ hooks/      # useTimer, useOverlay 등
   ├─ utils/
   └─ assets/
```

### 화면 → 폴더 매핑

- 0-1~0-3 `intro`, 1-1~1-10 `signup`, 1-11 `login`, 2-1~2-3 `home`, 2-4 `notification`, 2-5~2-15 `diary`
- 3-1~3-12 `letter-write`, 3-13~3-15·3-17 `delivery`, 3-16 `delivery-game`, 3-18 `stamp-make`
- 4-1~4-9 `mailbox`, 4-11~4-12 `pen-pal`, 5-1~5-10 `mypage`
- 담당자와 화면 범위는 [docs/ownership.md](./docs/ownership.md)에서 확인한다. A/B/C는 담당 구분용 표기이며 폴더명으로 사용하지 않는다.

## 협업 규칙

- 각 기능 페이지는 `pages/<기능명>`에 두고, 해당 기능 전용 컴포넌트는 `components/<기능명>`에 둔다. 여러 기능에서 공유하면 `shared`로 올린다.
- 의존 방향: `pages/<기능명> → components/<같은 기능명> → shared`; 다른 기능의 페이지·전용 컴포넌트는 직접 import하지 않는다.
- `shared` 수정은 PR로 하고 팀에 공지한다.
- 라우트는 기능별 파일(`authRoutes.jsx`, `letterRoutes.jsx`, `mailboxRoutes.jsx`)로 분리해 충돌을 막는다.
- 다른 담당 기능은 `shared/mocks`의 목 데이터로 개발한다.
- 로딩은 라우트에 Suspense로 `shared/feedback/Loading`을 건다. 에러는 ErrorBoundary로 `ErrorScreen`을 보여준다.
- 바텀시트/다이얼로그는 `shared/ui`의 Overlay 시스템을 사용한다 (화면 대부분이 사용).
- 앱 너비: Figma 시안은 360px 기준이지만 앱은 모바일에서 화면을 꽉 채우고 최대 `--app-width`(430px)까지 늘어난다. 가로는 시안의 `320px` 같은 고정 px 대신 `width: 100%`/`flex`와 좌우 `padding`(예: 20px)으로 작성한다.

## 담당 간 겹치는 지점 (합의 필요)

- **지역 선택**: 가입(A 1-7~1-9), 편지 받을 지역(B 3-2), 지역 수정(C 5-7) → `shared/region` 하나만.
- **일기 → 편지**: 일기 상세(A 2-7)의 편지 보내기 → B 3-4. 넘길 값(일기 id, 상대 닉네임, 지역)을 URL 파라미터로 약속.
- **우체통 → 답장**: C 4-9 "답장하기" → B 3-11. 위와 동일.
- **우표**: 만들기(B 3-18)와 우표첩(C 5-3~5-5)이 같은 우표 데이터 사용 → `shared/mocks`에서 형태 통일.
- **신고·차단**: 신고 시트(A 2-9), 차단 목록(C 5-9) 데이터 형태 통일.

## 사전 작업 순서 (셋이 갈라지기 전)

1. Vite 프로젝트 생성, 폴더 뼈대, 라우터 세팅
2. `tokens.css`에 색·폰트 변수 (Figma 변수명 그대로)
3. `shared/ui` 공용 컴포넌트 (Figma `02 컴포넌트`와 1:1)
4. `shared/feedback` 로딩·에러 화면
5. Overlay(BottomSheet/Dialog/Toast)
6. 지역 데이터, 목 데이터

## Claude Code 작업 지침

- 코드는 JavaScript(.jsx)로 작성한다. TypeScript로 바꾸지 않는다.
- 새 화면은 Figma 해당 프레임을 `get_design_context`로 읽어 **참고 코드로만** 쓰고, 이 프로젝트의 `shared/ui`·토큰·폴더 규칙에 맞게 변환한다.
- 이미 `shared`에 있는 컴포넌트·토큰을 우선 재사용하고, 중복 구현하지 않는다.
- 담당 폴더 밖 파일(특히 `shared`)을 수정해야 하면 먼저 사용자에게 알린다.
- 사용자는 프론트엔드 개발자이며 작업 전에 담당 구역을 확인한다. 담당자별 화면 범위는 `docs/ownership.md`를 기준으로 하며, 담당이 다른 파일이나 `shared`를 수정해야 하면 먼저 알린다.
