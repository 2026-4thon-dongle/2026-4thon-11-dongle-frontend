# 홈서버(TwoMES Hosting, arm64) 배포용 이미지: Vite로 빌드한 정적 파일을 nginx로 서빙한다.
# 플랫폼이 이 Dockerfile로 이미지를 만들고 https://dongle.zanviq.dev 를 컨테이너 80번 포트로 보낸다.
# 로컬 개발에는 쓰지 않는다(npm run dev).

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# 서버 주소. 기본값은 src/shared/api/client.js와 같은 배포 서버다. 목 데이터(VITE_API_MOCK)는 빌드에서 켜지지 않는다.
ARG VITE_API_BASE_URL=https://dongle-api.zanviq.dev
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
