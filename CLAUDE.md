# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 목적

블로그/게시글 서비스(SuCoding 프로젝트)의 **프론트엔드 SPA**. 게시글 목록·상세·작성/수정, 댓글, 로그인(이메일/카카오)·회원가입 화면으로 구성된다.
인증(이메일/카카오)과 게시글·댓글 CRUD가 모두 **백엔드(`VITE_API_URL`)와 연동**되어 있다 (아래 "현재 상태" 참고).
AI 작업 규칙(파일 연동, 금지 사항 등)은 `shrimp-rules.md`, 기획 문서는 `docs/`(`PRD.md`, `ROADMAP.md`, `architecture.md`)를 참고한다.
`package.json`의 name이 `context-user_settings`인 것은 템플릿 잔재이며, `README.md`도 Vite 기본 템플릿 내용이라 참고 가치가 없다.

## 명령어

```bash
npm run dev       # Vite 개발 서버
npm run build     # tsc -b && vite build (타입 에러가 있으면 빌드 실패)
npm run lint      # eslint .
npm run preview   # 빌드 결과 미리보기
```

- 테스트 러너는 설정되어 있지 않다.
- `dist/`는 빌드 산출물이다. 직접 수정하지 않는다.
- 환경 변수: `.env`의 `VITE_API_URL`(백엔드 base URL) 하나만 쓴다. 키를 추가하면 `.env.example`도 함께 수정한다.

## 기술 스택

- React 19 + TypeScript 5.8 (strict, `noUnusedLocals`/`noUnusedParameters` 활성) + Vite 6
- Tailwind CSS v4 (`@tailwindcss/vite` 플러그인, `tailwind.config` 파일 없음) — SCSS 미사용
- react-router v7 (패키지명 `react-router`, `react-router-dom` 아님)
- 아이콘: `lucide-react`
- HTTP: `axios` (`src/api/client.ts`의 인스턴스), 전역 상태: `zustand` (`src/stores/authStore.ts`)
- 설치만 되고 **아직 사용되지 않는** 의존성: `tailwind-merge`

## 아키텍처

```
src/
  main.tsx              # StrictMode + <Route /> 마운트, css/index.css 로드
  routes/
    index.tsx           # createBrowserRouter 라우트 정의 (단일 위치)
    RequireAuth.tsx     # 로그인 가드 (isReady 전 FullLoading, 비로그인이면 /auth/login)
    layouts/Default.tsx # Header + <Outlet/> + Footer 공통 레이아웃, 마운트 시 restoreSession() 호출
    pages/              # 라우트 단위 페이지 (Home, NotFound, auth/, posts/)
  components/           # 도메인별 재사용 컴포넌트
    common/             # Header, Footer, AuthProfile, AdBanner, 로딩/에러/리다이렉션 상태
    post/               # PostCard, PostGrid, FeaturedPost, PostForm(작성/수정), DeleteConfirmModal, 빈 상태, 로딩
    comment/            # CommentComponent, CommentForm
    mypage/             # ProfileCard(프로필·글 수·총 조회수), MyPostsZero(내 글 빈 상태)
  api/
    client.ts           # axios 인스턴스(withCredentials), 토큰 주입·401 재발급 인터셉터, refreshAccessToken
    auth.ts             # fetchMe, login, signup, logout, restoreSession
    posts.ts            # fetchPosts, fetchOverview, fetchPost, create/update/deletePost, create/deleteComment
  stores/authStore.ts   # zustand: accessToken(메모리 전용), user, isReady, clear
  types/                # user.ts(User), post.ts(Post, PostSummary, Comment, PostInput 등)
  constants/categories.ts  # 카테고리 목록과 Category 타입 (백엔드 시드와 동일)
  hooks/useFetch.ts     # 조회 훅 { data, error, isLoading, refetch }, AbortController로 취소
  utils/                # getAuthErrorMessage, getPostErrorMessage(영어 에러 문구), formatDate, readImageFile(이미지 파일 → 줄인 데이터 URL), filterPosts(검색어로 글 거르기), filterMyPosts(작성자가 본인인 글만 남기기)
  css/                  # index.css → tailwind.css → @import "tailwindcss"
```

### 라우팅

모든 라우트는 `routes/index.tsx` 한 곳에서 객체 배열로 정의하고, 최상위에 `Default` 레이아웃을 두어 하위 페이지를 `children`으로 중첩한다. 각 라우트는 `element`가 아니라 **`Component:` 속성**을 쓴다.

| 경로 | 페이지 |
|---|---|
| `/` | Home |
| `/posts` | Posts (목록) |
| `/post/:id` | PostRead (상세 + 댓글) |
| `/create-post`, `/edit/:id` | PostCreate (작성/수정 겸용, `RequireAuth` 하위 — 로그인 필요) |
| `/mypage` | MyPage (프로필 + 내 글 목록, `RequireAuth` 하위 — 로그인 필요) |
| `/auth/login`, `/auth/email-login`, `/auth/signup` | 로그인 관련 |
| `/auth/callback/kakao` | 카카오 OAuth 콜백 |
| `*` | NotFound |

새 페이지를 추가하려면 `pages/` 아래에 컴포넌트를 만들고 `routes/index.tsx`의 `children`에 등록한다 (`*` 항목 위에 추가).

## 구현 패턴

- **컴포넌트**: 파일당 하나의 `export default function PascalCase()`. 화면 데이터는 페이지가 조회해서 props로 내려준다 (`PostCard`는 `post`, `PostGrid`는 `title`/`posts`/`href`).
- **import**: 상대 경로 사용 (`../../../components/...`). path alias(`@/`)는 설정되어 있지 않다.
- **스타일링**: Tailwind 유틸리티 클래스를 JSX `className`에 직접 작성. 앱 배경은 `bg-slate-900` 다크 테마 기준이며, 일부 컴포넌트는 `dark:` 변형을 함께 쓴다. 클래스 조건부 결합은 현재 템플릿 리터럴을 쓴다.
- **상태 의존 UI 분리**: 로딩/에러/빈 상태를 별도 컴포넌트로 쓴다 (`FullLoading`, `ErrorState`(`onRetry`), `PostCardLoading`, `PostZero`, `PostMainZero`, `Redirection`).
- **데이터 조회**: 페이지에서 `useFetch(fetcher)`로 조회한다. `fetcher`는 `useCallback`으로 감싸 안정된 참조를 넘긴다 (바뀌면 다시 조회). 목업 데이터는 없다.
- **조회수 주의**: `GET /posts/:id`는 호출마다 `viewCount`가 오른다. `PostRead`/`PostForm`은 StrictMode의 effect 이중 실행에서도 한 번만 요청하도록 `useRef` 가드를 쓴다 (`useFetch` 대신 직접 요청). 이 패턴을 깨지 않는다.
- **게시글 본문**: 일반 문자열이므로 `whitespace-pre-line` 텍스트로만 출력한다. `dangerouslySetInnerHTML` 금지.

### 컴포넌트 구현 규칙

- 함수 선언 + `export default function`. 화살표 함수 컴포넌트나 named export는 쓰지 않는다.
- props가 필요하면 파일 상단에 `type XxxProps = {...}`(interface 아님)를 두고, 기본값은 구조 분해에서 지정한다 (`AdBanner({ size = "large" }: AdBannerProps)`).
- 리스트는 `.map()` + `key`, 정적 선택지는 모듈 상수로 둔다 (`constants/categories.ts`).
- 아이콘은 `lucide-react`만 쓰고, 장식용은 `aria-hidden="true"`를 붙인다.
- 폼 필드는 `<label htmlFor>` + `id` 쌍으로 연결하고 `required`를 명시한다. 이미지는 `alt`를 넣는다.
- 공통 Tailwind 조합을 따른다: 페이지 컨테이너 `max-w-7xl mx-auto px-4 md:px-8`, 카드 `bg-slate-800 rounded-lg`, 주 색상 `blue-500`(hover `blue-600`), 입력 포커스 `focus:ring-2 focus:ring-blue-500 focus:outline-none`, 반응형은 `md:`/`lg:` 접두사.

### 상태관리

- **전역 상태**: 인증만 `zustand`(`useAuthStore`)로 관리한다. 컴포넌트에서는 selector로 구독(`useAuthStore((state) => state.user)`)하고, 컴포넌트 밖(API 함수·인터셉터)에서는 `useAuthStore.getState()`를 쓴다. Context·서버 상태 라이브러리는 없다.
- **지역 상태**: `useState` (UI 토글: `Header`의 검색창, `AuthProfile`의 메뉴, `PostRead`의 삭제 확인 / 폼 입력: `EmailLogin`, `Signup`, `Kakao`, `PostForm`, `CommentForm`).
- 모든 폼은 **제어 컴포넌트**(`value` + `onChange`)이며 `onSubmit`에서 `isSubmitting`/`error` state와 `try/catch/finally`로 처리한다. 에러는 `role="alert"`로 표시한다.
- `Posts`의 카테고리·정렬·페이지·검색어(`q`)는 `useSearchParams`(URL 쿼리)가 상태다. 필터·정렬이 바뀌면 `page`를 지운다 (`q`는 유지).
- 토글은 `setX(!x)` 형태, 이벤트 핸들러는 JSX 안 인라인 화살표 또는 컴포넌트 내부 `const` 함수(`handleSubmit`, `handleLogout`)로 작성한다.

### API 호출

- 모든 요청은 `src/api/client.ts`의 `api` 인스턴스를 쓴다 (`baseURL = VITE_API_URL`, `withCredentials: true`). 컴포넌트에서 `fetch`/`axios`를 직접 호출하지 않는다.
- 요청 인터셉터가 스토어의 `accessToken`을 `Authorization: Bearer`로 붙이고, 응답 인터셉터는 401이면 `refreshAccessToken()` 후 원 요청을 1회 재시도한다. `/auth/login`, `/auth/signup`, `/auth/refresh`는 재발급 대상에서 제외(`skipRefreshUrls`).
- refresh token은 사용할 때마다 교체되므로 `refreshAccessToken()`과 `restoreSession()`은 진행 중인 Promise를 공유해 **한 번에 하나만** 실행한다. 중복 호출 코드를 만들지 않는다.
- accessToken은 메모리(store)에만 둔다. `localStorage` 등에 저장하지 않는다.
- API 함수는 `src/api/*.ts`에 두고 성공 시 스토어 갱신까지 함수 안에서 처리한다 (`login` → `setAccessToken` → `fetchMe`). 서버 에러는 `getAuthErrorMessage()`(인증), `getPostErrorMessage()`(게시글·댓글)로 영어 문구로 바꿔 보여준다.
- 카카오 로그인: `Login`이 `${VITE_API_URL}/auth/kakao`로 페이지를 이동시키고, 백엔드가 `/auth/callback/kakao?access_token=...`으로 돌려보낸다. `Kakao.tsx`는 토큰을 읽은 즉시 `history.replaceState`로 쿼리를 지우고, `/auth/me`의 `email`이 없으면 이메일 입력(`PATCH /auth/update-email`)을 받는다.
- 게시글·댓글 API는 `src/api/posts.ts`에 있다. 작성자 판별은 `post.author._id === user.id` (`/auth/me`의 `id`와 같은 ObjectId). 작성·수정(POST/PUT) 응답의 `author`는 populate되지 않은 ID 문자열이라 `_id`만 쓴다. `/posts/overview`의 `latestPosts`/`popularPosts`는 댓글 작성자가 populate되지 않아 `PostSummary` 타입(댓글 제외)으로 다룬다.

### 네이밍

| 대상 | 규칙 | 예 |
|---|---|---|
| 컴포넌트·파일 | PascalCase, 파일명 = 컴포넌트명 | `PostCard.tsx` |
| 페이지 폴더 | 소문자 도메인 폴더 | `pages/auth`, `pages/posts`, `auth/callback` |
| 컴포넌트 폴더 | 소문자 도메인 (`common`, `post`, `comment`) | `components/post/` |
| props 타입 | `{컴포넌트명}Props` | `ErrorStateProps` |
| state | boolean은 `isXxx`/`showXxx`, setter는 `setXxx` | `isSearchOpen`, `showDeleteConfirm` |
| 상수·변수·함수 | camelCase | `categories`, `getPostById` |
| 폼 `id` | camelCase, 필드명과 일치 | `confirmPassword` |

- 라우트 경로는 kebab-case (`/create-post`, `/auth/email-login`). 단 `/post/:id`(단수)와 `/posts`(복수)가 공존한다.
- 페이지 컴포넌트명은 `NotFound.tsx`의 `NotFoundPage`처럼 import 시 이름이 달라지기도 한다. 새로 만들 때는 파일명과 일치시킨다.
- UI 문구는 영어, 코드 주석은 한국어(`{/* 로그인 되면 ... */}`)로 쓴다. 서비스 로고명은 `SULOG`.

## 현재 상태 (작업 전 알아둘 것)

- **인증은 연동 완료**: 이메일 로그인·회원가입·로그아웃, 카카오 로그인, 새로고침 시 세션 복구(`Default`가 `restoreSession()` 호출)가 동작한다. `Header`·`AuthProfile`은 스토어의 `user`/`isReady`로 로그인 UI를 결정한다.
- **게시글·댓글 CRUD 연동 완료**: 홈(`/posts/overview`), 목록(카테고리·정렬·이전/다음 페이지네이션), 상세, 작성·수정(`PostForm`, 썸네일은 파일 선택 — `readImageFile`이 `FileReader`로 읽어 줄인 데이터 URL을 `thumbnail` 문자열로 저장), 삭제(`DeleteConfirmModal`), 댓글 작성·삭제. 작성/수정/삭제 버튼과 댓글 삭제는 작성자 본인에게만 보인다.
- **페이지네이션**: 백엔드가 전체 개수를 주지 않아 "결과 수 < perPage(9)면 마지막 페이지"로 판단한다. 마지막 페이지가 정확히 9개면 다음 페이지가 빈 상태로 한 번 나온다.
- **검색은 클라이언트 필터링**: 백엔드 `GET /posts`에 검색 파라미터가 없어서, `Header`의 검색 폼이 `/posts?q=검색어`로 이동하고 `Posts`가 `q`가 있을 때만 전체 글을 한 번 조회해 `utils/filterPosts.ts`로 제목·본문을 거른다(대소문자 무시, 부분 일치). 결과는 클라이언트에서 9개씩 나누고 건수를 표시하며, `q`가 없으면 기존 서버 페이지네이션을 쓴다. 한계: 검색할 때마다 전체 글(base64 썸네일·본문·댓글 포함)을 내려받으므로 글이 많아지면 느려진다. 백엔드에 검색 API가 생기면 서버 검색으로 교체하는 것을 권장한다.
- **썸네일 제약**: 백엔드에 업로드 API가 없고 JSON 본문이 100KB로 제한돼, 이미지는 긴 변 800px 이하·60,000자 이하 JPEG 데이터 URL로 줄여 저장한다 (큰 사진은 화질이 낮아지고 움직이는 GIF는 미지원). 글마다 수십 KB의 base64가 `GET /posts`·`/posts/overview` 응답에 실려 무거우므로, 백엔드에 업로드 API가 생기면 `readImageFile` 대신 업로드 호출로 교체하는 것을 권장한다. 본문이 매우 길면 이미지와 합쳐 100KB를 넘어 413이 날 수 있다.
- **마이페이지(`/mypage`)**: `MyPage`가 `GET /posts`로 전체 글을 한 번 조회해 `filterMyPosts`로 내 글만 거르고(`post.author._id === user.id`), 최신순/조회순 정렬(`sort`)과 9개씩 페이지(`page`)를 `useSearchParams`로 관리한다. `ProfileCard`에는 닉네임·이메일·로그인 방식과 글 수·총 조회수를 보여준다. 백엔드에 프로필 수정·비밀번호 변경·회원탈퇴·내 댓글 API가 없어 포함하지 않았다. 한계: 서버에 작성자 필터가 없어 전체 글(base64 썸네일 포함)을 내려받으므로, `author` 필터나 `GET /posts/mine`이 생기면 서버 조회로 교체하는 것을 권장한다. `fetchPost`는 조회수를 올리므로 목록 용도로 쓰지 않는다.
- **알려진 한계**: 이미지 로드에 실패하면(깨진 썸네일 URL) `PostCard`/`FeaturedPost`/`PostRead`에는 대체 표시가 없다. 백엔드 이슈(조회수 증가, `/posts/seed`가 인증 없이 전체 삭제 등)는 `docs/PRD.md` 9절 참고.
- `Kakao.tsx`는 자체 `getEmailErrorMessage`를 가지며 `getAuthErrorMessage`와 별개다. 또한 `update-email` 실패 시 `console.error`를 남긴다.
