# Development Guidelines

## 프로젝트 개요

- 프로젝트: SULOG(SuCoding) 블로그 프론트엔드 SPA
- 스택: React 19, TypeScript(strict), Vite 6, Tailwind CSS v4, react-router v7, axios, zustand, lucide-react
- 인증(이메일/카카오)과 게시글·댓글 CRUD가 모두 백엔드와 연동되어 있다. 목업 데이터는 없다.
- **`CLAUDE.md`의 "백엔드/API/전역 상태/인증 로직 없음" 설명은 낡았다. 이 문서를 우선한다.**

## 디렉터리 구조와 배치 규칙

| 경로 | 넣을 것 | 넣지 말 것 |
|---|---|---|
| `src/routes/index.tsx` | 라우트 정의 (유일한 위치) | 로직 |
| `src/routes/layouts/` | 공통 레이아웃 | 페이지 |
| `src/routes/pages/` | 라우트 단위 페이지 (`auth/`, `posts/`, `auth/callback/`) | 재사용 컴포넌트 |
| `src/components/{common,post,comment}/` | 도메인별 재사용 컴포넌트 | 페이지, API 호출 |
| `src/api/` | axios 호출 함수 (`client.ts`, `auth.ts`, `posts.ts`) | JSX, 컴포넌트 상태 |
| `src/stores/` | zustand 스토어 (`authStore.ts`) | API 호출 |
| `src/types/` | 서버 응답/도메인 타입 (`user.ts`, `post.ts`) | 컴포넌트 props 타입 |
| `src/utils/` | 순수 함수 (`getAuthErrorMessage.ts`, `formatDate.ts`) | 상태, 부수효과 |
| `src/constants/` | 모듈 상수 (`categories.ts`) | 함수, 상태 |
| `src/hooks/` | 재사용 커스텀 훅 (`useFetch.ts`, named export) | JSX |

- 새 도메인 API는 `src/api/{도메인}.ts`로 만든다. 예: 게시글 → `src/api/posts.ts`.
- 새 도메인 타입은 `src/types/{도메인}.ts`로 만든다.
- 파일 하나에 컴포넌트 하나. 파일명 = 컴포넌트명(PascalCase).
- `dist/`, `node_modules/`, `shrimp_data/`는 수정하지 않는다.

## 코드 표준

- 들여쓰기 2칸, 큰따옴표(`"`), 세미콜론 사용.
- 컴포넌트: `export default function PascalCase()` 선언문. 화살표 함수 컴포넌트·named export 금지.
- props 타입: `type XxxProps = {...}` (interface 금지). 기본값은 구조 분해에서 지정.
- import: 상대 경로만 사용. `@/` alias 금지(설정 없음).
- 타입 전용 import는 `import type`을 쓴다.
- 코드 주석·커밋 메시지는 한국어, 식별자는 영어 camelCase.
- **UI 문구는 영어**로 쓴다. 한국어 UI 문구 금지.
- 미사용 변수/파라미터 금지 (`noUnusedLocals`, `noUnusedParameters`로 빌드 실패).
- state 네이밍: boolean은 `isXxx`/`showXxx`, setter는 `setXxx`.
- 토글은 `setX(!x)` 형태.

```tsx
// 허용
const [isSubmitting, setIsSubmitting] = useState(false);
// 금지
const [loading, setLoading] = useState(false);
```

## 스타일 표준

- Tailwind 유틸리티를 `className`에 직접 작성한다. SCSS·CSS 모듈·인라인 style 금지.
- `tailwind.config` 파일 생성 금지 (v4, `src/css/tailwind.css`의 `@import "tailwindcss"` 사용).
- 페이지 컨테이너: `max-w-7xl mx-auto px-4 md:px-8`.
- 인증 페이지 카드: 외곽 `min-h-[calc(100vh-64px)] flex items-center justify-center px-4` → `w-full max-w-md` → `bg-slate-800 rounded-lg shadow-xl p-8`.
- 주 버튼: `bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors`, 비활성 `disabled:opacity-50`.
- 입력: `bg-slate-700 text-white ... rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`.
- 에러 박스: `bg-red-500/10 border border-red-500/50 rounded-lg` + `role="alert"`.
- 반응형은 `md:`/`lg:` 접두사로 처리한다. 모바일 우선.

## 접근성 표준

- 폼 필드: `<label htmlFor>` + `id` 쌍, `required` 명시, `autoComplete` 지정.
- 장식 아이콘(lucide-react): `aria-hidden="true"`.
- 토글/메뉴 버튼: `aria-label`, `aria-expanded` 또는 `aria-pressed`.
- 에러 메시지: `role="alert"`.
- 이미지: 의미 있는 `alt`. 클릭 가능한 요소는 `button`/`Link`만 사용한다 (`onClick` 달린 svg·div 금지).
- 제출 중에는 submit 버튼에 `disabled={isSubmitting}`.

## 인증/API 구현 표준

### axios 인스턴스

- 모든 서버 요청은 `src/api/client.ts`의 `api`를 사용한다. 컴포넌트에서 `axios.create`·`fetch` 직접 호출 금지.
- 예외: refresh 요청은 인터셉터 무한 루프 방지를 위해 `axios`를 직접 쓴다 (`refreshAccessToken` 내부에 한정).
- base URL은 `import.meta.env.VITE_API_URL`만 사용한다. URL 하드코딩 금지.
- 환경 변수는 `VITE_` 접두사를 붙이고, 추가 시 `.env.example`도 함께 수정한다. `.env` 값은 출력·커밋하지 않는다.
- 인증 불필요 경로를 새로 추가하면 `client.ts`의 `skipRefreshUrls`에 등록한다.

### 토큰/세션

- **accessToken은 zustand 메모리에만 보관한다. `localStorage`/`sessionStorage`/쿠키 저장 금지.**
- refresh는 `refreshAccessToken()`의 공유 Promise를 통해서만 호출한다. 동시에 두 번 호출 금지 (refresh token이 매번 교체되어 두 번째가 실패한다).
- 세션 복구는 `restoreSession()`을 사용한다. 중복 구현 금지.
- 카카오 콜백(`Kakao.tsx`)은 `access_token` 쿼리를 읽은 즉시 `history.replaceState`로 제거한다. 이 순서를 바꾸지 않는다.

### 호출 함수 작성

- API 함수는 `src/api/*.ts`에 두고, 성공 시 스토어 갱신까지 함수 안에서 처리한다 (`login` → `setAccessToken` → `fetchMe`).
- 컴포넌트는 `try/catch/finally`로 호출하고 `isSubmitting`/`error` 상태를 관리한다.
- 에러 메시지는 `getAuthErrorMessage(err)`로 변환한다. 서버의 한국어 메시지를 화면에 그대로 출력 금지.
- 새 도메인 에러 변환이 필요하면 `src/utils/`에 `get{도메인}ErrorMessage.ts`를 만든다.

```tsx
// 허용
try {
  await login(email, password);
  navigate("/", { replace: true });
} catch (err) {
  setError(getAuthErrorMessage(err));
} finally {
  setIsSubmitting(false);
}
// 금지
const res = await fetch("http://localhost:3000/auth/login");
```

### zustand 스토어

- 스토어는 `src/stores/{이름}Store.ts`, 훅 이름은 `use{이름}Store`.
- 컴포넌트에서는 selector로 구독한다: `useAuthStore((state) => state.user)`. 전체 구독 `useAuthStore()` 금지.
- 컴포넌트 밖(API 함수·인터셉터)에서는 `useAuthStore.getState()`를 사용한다.
- 로그아웃/세션 만료는 `clear()`를 호출한다.
- `isReady`가 `false`인 동안에는 로그인/비로그인 UI를 확정하지 않는다.

## 라우팅 표준

- 라우트 추가: `src/routes/pages/`에 페이지 생성 → `src/routes/index.tsx`의 `children`에서 `*` 항목 **위에** 등록.
- 라우트는 `Component:` 속성을 쓴다. `element:` 금지.
- 패키지는 `react-router`만 import한다. `react-router-dom` 금지.
- 경로는 kebab-case. 기존 `/post/:id`(단수)와 `/posts`(복수)는 유지한다.
- 페이지 컴포넌트명은 파일명과 일치시킨다 (`NotFoundPage` 같은 불일치 신규 생성 금지).

## 파일 연동 규칙 (함께 수정할 파일)

| 변경 | 함께 확인·수정 |
|---|---|
| 페이지 추가 | `routes/index.tsx` 등록, 필요 시 `Header.tsx` 링크 |
| `types/user.ts`의 `User` 변경 | `stores/authStore.ts`, `api/auth.ts`, `AuthProfile.tsx`, `Kakao.tsx` |
| 환경 변수 추가 | `.env`, `.env.example`, 사용처 |
| 인증 API 경로 추가/변경 | `api/auth.ts`, `api/client.ts`의 `skipRefreshUrls` |
| 에러 메시지 상태 코드 추가 | `utils/getAuthErrorMessage.ts` (`Kakao.tsx`는 자체 `getEmailErrorMessage`를 가진다) |
| 인증 상태 필드 추가 | `stores/authStore.ts`의 타입과 `clear()` 초기화 |
| `types/post.ts`의 `Post` 변경 | `api/posts.ts`, `PostCard`·`FeaturedPost`·`PostRead`·`PostForm`, `CommentComponent` |
| 카테고리 추가/삭제 | `constants/categories.ts` (백엔드 시드 카테고리와 같아야 한다), `Posts.tsx`·`PostForm.tsx`는 상수를 쓰므로 수정 불필요 |
| 게시글·댓글 에러 문구 추가 | `utils/getPostErrorMessage.ts` |
| 썸네일 처리 규칙 변경 | `utils/readImageFile.ts`, `components/post/PostForm.tsx`, `utils/getPostErrorMessage.ts`(413) |
| 검색 규칙(대상 필드, `q` 쿼리 이름·길이) 변경 | `utils/filterPosts.ts`, `routes/pages/posts/Posts.tsx`, `components/common/Header.tsx`(`maxQueryLength` 포함), `components/post/PostZero.tsx` |
| `package.json` 의존성 변경 | `CLAUDE.md`의 기술 스택 섹션 |

## 작업 방식 (AI 의사결정)

1. 파일 수정 전 변경 계획을 먼저 제시한다.
2. 한 번에 수정하는 파일 수를 최소화한다. 작업은 기능 단위로 쪼갠다.
3. 같은 역할의 기존 파일이 있으면 그 패턴을 복제한다 (인증 폼 → `EmailLogin.tsx`, 상태 UI → `FullLoading`/`ErrorState`).
4. 로딩/에러/빈 상태는 기존 컴포넌트(`FullLoading`, `ErrorState`, `PostZero`, `PostMainZero`, `PostCardLoading`, `Redirection`)를 재사용한다.
5. 판단이 모호하면: 기존 코드 패턴 > 이 문서 > `CLAUDE.md` 순으로 따른다.
6. 완료 전 `npm run build`(타입 체크 포함)와 `npm run lint`를 통과시킨다. 테스트 러너는 없다.
7. 커밋: 한국어 메시지, 작은 단위. 브랜치 `feature/기능명`, `fix/버그명`.

## 게시글·댓글 구현 표준

- 목록·홈처럼 반복 조회하는 화면은 `useFetch(fetcher)`를 쓴다. **`fetcher`는 반드시 `useCallback`으로 감싼다** (참조가 바뀌면 다시 조회한다). 모듈 함수(`fetchOverview`)는 그대로 넘겨도 된다.
- **`fetchPost`(`GET /posts/:id`)는 호출마다 서버 조회수가 오른다.** `useFetch`로 호출하지 말고 `PostRead`/`PostForm`처럼 `useRef` 가드로 같은 글을 한 번만 요청한다.
- 작성자 판별은 `post.author._id === user.id`, 댓글은 `comment.author._id === user.id`.
- 본문·댓글은 텍스트(`whitespace-pre-line`)로만 출력한다. HTML 렌더링 금지.
- 썸네일은 URL 입력이 아니라 **파일 선택**이다. 반드시 `utils/readImageFile.ts`의 `readImageFile(file)`로 처리한다 (`FileReader` → canvas 축소·JPEG 압축 → 60,000자 이하 데이터 URL). 원본 파일을 그대로 `FileReader`로 읽어 전송하지 않는다 (백엔드 JSON 본문 제한 100KB 초과 시 413).
- 허용 타입은 JPG/PNG/WebP, 원본 10MB 이하. `readImageFile`의 상수(`maxDataUrlLength` 등)를 바꾸면 `PostForm`의 안내 문구와 `getPostErrorMessage`(413)도 확인한다.
- `PostSummary`(댓글 제외) 타입의 글에서 `comments`를 읽지 않는다. `/posts/overview`의 `latestPosts`/`popularPosts`가 이 형태다.
- `Posts`의 카테고리·정렬·페이지·검색어(`q`)는 URL 쿼리(`useSearchParams`)가 단일 출처다. 별도 `useState`로 복제하지 않는다. (`Header`의 입력값은 주소의 `q`가 바뀔 때만 맞춘다.)
- 검색은 백엔드 API가 없어 클라이언트 필터링이다. `q`가 있을 때만 `fetchPosts({ sort, category })`로 전체를 조회하고 `filterPostsByQuery`로 거른 뒤 `slice`로 나눈다. 검색어가 바뀌어도 재조회하지 않도록 `fetcher` 의존성에 `q` 문자열을 넣지 않는다. 검색어는 텍스트로만 출력하고 정규식에 넣지 않는다. `q`가 없는 일반 목록의 서버 페이지네이션은 바꾸지 않는다.
- 모달은 `DeleteConfirmModal`처럼 `role="dialog"`, `aria-modal`, 초기 포커스, Tab 순환, ESC 닫기, 닫힌 뒤 포커스 복귀를 지킨다.

## 금지 사항

- **`dangerouslySetInnerHTML` 금지** (게시글·댓글 포함 사용자 입력 전반).
- 서버 조회수를 올리는 `fetchPost`를 목록·미리보기 용도로 호출 금지.
- 개발 DB의 `POST /posts/seed`(전체 글 삭제) 사용자 허락 없이 호출 금지.

- **`localStorage`/`sessionStorage`에 토큰 저장 금지.**
- 컴포넌트 안에서 `fetch`/`axios` 직접 호출 금지.
- API base URL, 시크릿, `.env` 값 하드코딩·출력·커밋 금지.
- SCSS, CSS 모듈, 인라인 style, `tailwind.config` 추가 금지.
- `react-router-dom` import, `element:` 라우트 속성 금지.
- 화살표 함수 컴포넌트, named export 컴포넌트, `interface` props 금지.
- `@/` alias 사용 금지.
- 서버의 한국어 에러 메시지를 UI에 그대로 노출 금지.
- 장식 아이콘에 `aria-hidden` 누락, `onClick` 달린 비대화형 요소(svg/div) 금지.
- `dist/`, `shrimp_data/` 직접 수정 금지.
- 사용되지 않는 `tailwind-merge`를 이유 없이 도입 금지. 조건부 클래스는 현재 템플릿 리터럴을 쓴다.
