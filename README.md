# 동글 (동네에서 온 글)

React + JavaScript + Vite 기반 웹앱입니다. 프로젝트 방향과 협업 규칙은 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

## 시작하기

```bash
npm install
npm run dev
```

## 확인 명령

```bash
npm run lint
npm run build
```

## 구조

- `src/app`: 앱 진입점, 담당별 라우트, 공용 레이아웃
- `src/pages/<기능명>`: 기능별 화면
- `src/components/<기능명>`: 해당 기능에서만 사용하는 컴포넌트
- `src/shared`: 담당 간 공유하는 UI, 피드백, 지역 데이터, API, 목 데이터 등

담당 구역은 폴더명에 포함하지 않고 [담당 분배표](./docs/ownership.md)에서 별도로 관리합니다. 라우트는 `src/app/routes` 아래 기능별 파일로 분리되어 있습니다. 현재 화면은 라우팅 확인용 자리표시자이며, 실제 화면 작업 시 담당 페이지와 공용 컴포넌트로 교체합니다.
