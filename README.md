# Greengram Frontend

이미지 기반 소셜 피드 서비스 Greengram의 프론트엔드 프로젝트입니다.

Vue 3 기반으로 구성되어 있으며, 로그인, 소셜 로그인 콜백, 피드 목록, 피드 작성, 댓글, 좋아요, 팔로우, 프로필 화면을 제공합니다.

## 기술 스택

- Vue 3
- Pinia
- Vue Router
- Axios
- Bootstrap / BootstrapVue3
- Swiper
- Vite

## 주요 화면

- 로그인
- 회원가입
- OAuth2 콜백
- 메인 피드
- 피드 작성 모달
- 댓글 모달
- 프로필
- 다른 사용자 프로필

## 주요 기능

- 일반 로그인 / 회원가입
- Google / Kakao / Naver OAuth2 로그인 진입
- 401 응답 시 토큰 재발급 후 기존 요청 재시도
- 피드 목록 조회
- 이미지 슬라이드
- 피드 작성
- 좋아요
- 댓글 등록 / 삭제
- 팔로우 / 언팔로우
- 프로필 조회
- 프로필 이미지 변경

## 프로젝트 구조

```text
src/
├── assets/          # 공통 스타일, 이미지 리소스
├── components/      # Header, FeedCard, FeedContainer, ProfileImg 등 UI 컴포넌트
├── composables/     # 무한 스크롤 처리
├── router/          # 라우터 설정
├── services/        # API 요청 분리
├── stores/          # Pinia 상태 관리
├── utils/           # 공통 유틸, validation
├── views/           # SignIn, SignUp, Feed, Profile, OAuth2Callback
├── App.vue
└── main.js
```

## API 연동 구조

Axios 인스턴스는 `src/services/httpRequester.js`에 정리되어 있습니다.

- 기본 baseURL: `/api`
- `withCredentials = true` 설정으로 인증 쿠키 포함 요청
- 401 응답 발생 시 `/user/reissue`로 토큰 재발급 요청
- 재발급 성공 시 기존 요청 재실행
- API 요청은 `src/services/*.js` 파일로 분리

주요 서비스 파일은 다음과 같습니다.

```text
src/services/userService.js
src/services/feedService.js
src/services/feedCommentService.js
src/services/feedLikeService.js
src/services/followService.js
```

## 상태 관리

Pinia store는 기능별로 분리되어 있습니다.

```text
authentication
- 로그인 사용자 정보
- 로그인 상태 관리

feed
- 피드 목록
- 페이지네이션 상태
- 프로필 피드 조회 상태

commentModal
- 댓글 모달 열림 상태
- 댓글 목록 / 댓글 작성 상태

messageModal
- 공통 메시지 모달 상태
```

## 디자인 방향

Greengram은 이미지 기반 SNS 프로젝트의 성격에 맞춰 소프트 핑크와 라벤더 퍼플 계열의 컬러를 사용했습니다.

피드, 프로필, 모달 화면은 카드형 UI를 기준으로 정리했으며, 관리형 서비스 스타일의 APTeN 프로젝트와 구분되는 개인 SNS 무드를 목표로 구성했습니다.

## 실행 방법

### 1. 패키지 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 프로덕션 빌드

```bash
npm run build
```

## 라우트

```text
/                 메인 피드
/sign-in          로그인
/sign-up          회원가입
/profile/:userId  프로필
/oauth2/callback  OAuth2 콜백 처리
```

## 로컬 실행 기준

이 프로젝트는 포트폴리오 시연을 위해 로컬 환경에서 실행하는 것을 기준으로 정리되어 있습니다.

프론트 개발 서버는 기본적으로 다음 주소에서 실행됩니다.

```text
http://localhost:5173
```

API 요청은 `/api` 경로를 기준으로 백엔드와 연동됩니다.

```js
axios.defaults.baseURL = `/api/`;
```

로컬에서 정상적으로 확인하려면 백엔드 서버가 함께 실행되어 있어야 합니다.

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8080
```
