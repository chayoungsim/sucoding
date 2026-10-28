# ROADMAP: 인증 + 게시글·댓글 CRUD 연동

[PRD.md](./PRD.md)의 구현 순서를 단계별로 쪼갠 실행 계획이다. 각 단계는 독립적으로 빌드·확인 가능하다.

## 작업 원칙

- 단계마다 `feature/` 브랜치 1개, 커밋은 작은 단위(한글 메시지).
- 한 커밋에서 수정하는 파일은 **5개 이하**를 목표로 한다. 넘으면 쪼갠다.
- 파일 수정 전에 변경 계획을 먼저 공유한다.
- 단계 종료 조건: `npm run build`, `npm run lint` 통과 + 해당 단계의 수동 확인 완료.

## PRD 검토 결과 (보완 사항)

PRD를 실제 코드와 대조하며 발견한 누락·오류이다. 아래 단계에 반영했다.

| # | 발견 | 영향 | 반영 단계 |
|---|---|---|---|
| 1 | `PostRead` 본문이 `<h2>`/`<p>` 하드코딩인데 백엔드 `content`는 **일반 문자열** | HTML로 렌더링하면 XSS 위험. `whitespace-pre-line` 텍스트로 출력해야 함 | M6 |
| 2 | `/auth/login`의 `user`는 `_id`, `/auth/me`는 `id`로 **형태가 다름** | 로그인 후 `/auth/me`를 다시 호출해 형태를 통일 | M2 |
| 3 | 세션 복구 `/auth/refresh`는 실패 시 쿠키를 **삭제**하고, refresh token은 사용 시 교체됨 | StrictMode 이중 실행·동시 401 재시도 시 두 번째 요청이 실패해 로그아웃될 수 있음 → **single-flight**(진행 중인 refresh 하나만 공유) 필수 | M1, M2 |
| 4 | `ErrorState`는 `useRouteError()`를 쓰고 `min-h-screen` 전체 화면 | 페이지 내부 fetch 에러 표시용으로 그대로 못 씀 → 에러 메시지를 props로 받도록 정리 | M5 |
| 5 | `PostGrid`는 제목("Latest Post")·링크·개수가 하드코딩, `Home`은 `PostGrid`를 2번 사용 | `/posts/overview`의 latest/popular를 props로 받아야 함 | M5 |
| 6 | `PostRead`의 연관 글(`PostGrid`)용 API가 없음 | `GET /posts?category=..&perPage=3`으로 대체 (현재 글 제외는 프론트에서 필터) | M6 |
| 7 | `Login.tsx`의 이메일/회원가입 버튼에 이동 로직 없음 | `Link`로 `/auth/email-login`, `/auth/signup` 연결 | M2 |
| 8 | 날짜가 ISO 문자열(`createdAt`) | 표시용 포맷 유틸 필요 | M1 |
| 9 | `PostRead`의 삭제 모달이 `bg-opacity-50` 사용 | Tailwind v4에서는 제거된 유틸이라 배경이 불투명해짐 → `bg-black/50` | M7 |
| 10 | 카테고리 목록이 `Posts.tsx`, `PostCreate.tsx`에 중복 | 상수 한 곳으로 통합 | M1 |
| 11 | `data/posts.ts`의 `Post`는 `id:number`, `likes`, `replies`가 있어 백엔드와 불일치 | `src/types/`에 새 타입을 만들고 `data/posts.ts`는 제거 | M1, M9 |

## 의존 관계

```
M0 환경 확인 → M1 기반 인프라 → M2 이메일 인증/세션 → M3 카카오 → M4 라우트 보호
                                      └→ M5 목록·홈 → M6 상세 → M7 작성·수정·삭제 → M8 댓글 → M9 마무리
```

M5는 인증 없이도 가능해 M2 이후 M3/M4와 병행할 수 있다. M7·M8은 M4 이후에만 시작한다.

## M0. 사전 확인 (코드 변경 없음)

- [ ] 백엔드 실행: `cd ../backend && npm start` (기본 포트 4000)
- [ ] 백엔드 `FRONTEND_URL`이 Vite 주소(기본 `http://localhost:5173`)와 같은지, `KAKAO_REDIRECT_URI`가 백엔드 `/auth/kakao/callback`인지 사용자가 확인
- [ ] 카카오 개발자 콘솔의 Redirect URI와 일치하는지 확인
- [ ] 데이터 준비: 회원가입 후 `POST /posts/seed`로 더미 글 216개 생성 (**기존 글 전부 삭제**되므로 개발 DB에서만)
- 완료 기준: `GET http://localhost:4000/posts?perPage=3`이 배열을 반환

## M1. 기반 인프라 — `feature/api-foundation`

| 커밋 | 파일 |
|---|---|
| env 설정 | `.env`, `.env.example`, `src/vite-env.d.ts` (`VITE_API_URL=http://localhost:4000`). **현재 `.gitignore`에 `.env`가 없으므로 먼저 추가**한 뒤 파일 생성 |
| 타입 정의 | `src/types/post.ts`, `src/types/user.ts` (백엔드 응답 기준: `_id`, `author{nickname,profileImage}`, `comments[]`) |
| axios 클라이언트 | `src/api/client.ts` — baseURL, `withCredentials`, access token 헤더 주입, 401 시 **single-flight refresh 후 1회 재시도** |
| 인증 store | `src/stores/authStore.ts` — `accessToken`, `user`, `isReady`, `setSession`, `clear` |
| 공통 유틸 | `src/utils/formatDate.ts`, `src/constants/categories.ts` |

- 완료 기준: 빌드 통과, 임시로 `GET /posts` 호출이 콘솔에서 성공 (확인 후 임시 코드 제거)

## M2. 이메일 인증 + 세션 — `feature/email-auth`

| 커밋 | 파일 |
|---|---|
| 로그인 진입 링크 | `pages/auth/Login.tsx` (이메일/회원가입 버튼을 `Link`로) |
| 이메일 로그인 | `pages/auth/EmailLogin.tsx` — 제어 폼, 로그인 후 `/auth/me` 호출, 에러 `role="alert"` |
| 회원가입 | `pages/auth/Signup.tsx` — 비밀번호 확인 검증, 409 메시지, 성공 시 로그인 화면 |
| 세션 복구 | `routes/layouts/Default.tsx` — 앱 시작 시 refresh → me (모듈 단위 단일 Promise), 완료 전 `isReady=false` |
| 헤더 반영 | `components/common/Header.tsx`, `AuthProfile.tsx` — 로그인 시 프로필만, 비로그인 시 로그인 아이콘, 실제 닉네임/이미지, 로그아웃 |

- 완료 기준: 가입 → 로그인 → 새로고침해도 유지 → 로그아웃 → 새로고침 시 비로그인. **dev(StrictMode)에서도 로그인 유지**
- 주의: 비로그인 방문자는 refresh가 401이므로 에러로 취급하지 않고 조용히 처리

## M3. 카카오 로그인 — `feature/kakao-auth`

| 커밋 | 파일 |
|---|---|
| 카카오 시작 | `pages/auth/Login.tsx` — 버튼 클릭 시 `window.location.href = ${API}/auth/kakao` |
| 콜백 처리 | `pages/auth/callback/Kakao.tsx` — 쿼리 `access_token` 저장 → **즉시 `history.replaceState`로 URL 정리** → `/auth/me` |
| 이메일 등록 | 같은 파일 — `email=N`이면 기존 폼을 `PATCH /auth/update-email`에 연결, `Y`면 `Redirection` 후 홈 이동 |

- 완료 기준: 신규 카카오 계정(이메일 없음) → 이메일 등록 → 로그인 상태. 기존 계정 재로그인 시 폼 없이 홈 이동
- 주의: StrictMode로 콜백 effect가 2번 실행되므로 중복 호출을 막는다 (ref 가드)

## M4. 라우트 보호 — `feature/route-guard`

| 커밋 | 파일 |
|---|---|
| 가드 | 신규 `routes/RequireAuth.tsx` — `isReady` 전 로딩(`FullLoading`), 비로그인이면 `/auth/login` |
| 적용 | `routes/index.tsx` — `/create-post`, `/edit/:id`를 가드 하위로 이동 |

- 완료 기준: 비로그인 상태에서 `/create-post` 접근 시 로그인 화면, 새로고침 중에는 깜빡임 없이 대기

## M5. 목록·홈 조회 — `feature/post-list`

| 커밋 | 파일 |
|---|---|
| 조회 훅 | `src/hooks/useFetch.ts` — `data/loading/error` 반환 (라이브러리 추가 없이 직접 작성) |
| 카드 props화 | `components/post/PostCard.tsx` (`post` props), `PostCardLoading` 연결 |
| 그리드 props화 | `components/post/PostGrid.tsx` — `title`, `posts`, `href`; 빈 상태는 `PostMainZero` |
| 홈 | `pages/Home.tsx`, `components/post/FeaturedPost.tsx` — `/posts/overview` |
| 에러 UI | `components/common/ErrorState.tsx` — props로 메시지·재시도 받도록 정리 |
| 목록 | `pages/posts/Posts.tsx` — 카테고리, 정렬(newest/views), 페이지네이션(이전/다음, 결과 < perPage면 마지막), 빈 상태 `PostZero` |

- 완료 기준: 홈/목록이 실제 데이터로 표시, 필터·정렬·페이지 이동 시 요청 쿼리가 맞음, 로딩·빈·에러 3상태 확인

## M6. 상세 조회 — `feature/post-read`

| 커밋 | 파일 |
|---|---|
| 상세 연동 | `pages/posts/PostRead.tsx` — `useParams`, `GET /posts/:id`, 본문은 텍스트(`whitespace-pre-line`), 404는 기존 주석 처리된 Not Found 화면 |
| 권한 노출 | 같은 파일 — `post.author._id === user.id`일 때만 Edit/Delete 표시 |
| 연관 글 | 같은 파일 — 같은 카테고리 3개 (`PostGrid` 재사용) |

- 완료 기준: 작성자/타인/비로그인 3가지로 버튼 노출 확인. 조회수는 호출마다 오르는 백엔드 동작 그대로임을 인지

## M7. 작성·수정·삭제 — `feature/post-write`

| 커밋 | 파일 |
|---|---|
| 작성 | `pages/posts/PostCreate.tsx` — 제어 폼, 썸네일 파일 업로드 UI를 **URL 입력 + 미리보기**로 교체, 성공 시 `/post/:id` 이동 |
| 수정 | 같은 파일 — `useParams`에 `id`가 있으면 기존 값 로드 후 PUT, 타인 글이면 접근 차단 |
| 삭제 | `PostRead.tsx` — 모달 확정 시 `DELETE` 후 목록 이동, 모달 배경 `bg-black/50`, 포커스/ESC 처리 |

- 완료 기준: 작성 → 목록 노출 → 수정 반영 → 삭제 후 404. 타인 글 수정 URL 직접 접근 시 차단
- 주의: 수정 화면 로드 시 조회수가 오르는 것은 백엔드 이슈로 수용

## M8. 댓글 — `feature/comments`

| 커밋 | 파일 |
|---|---|
| 목록 표시 | `components/comment/CommentComponent.tsx` — `comment` props, 날짜 포맷 |
| 작성 | `components/comment/CommentForm.tsx` — 로그인 시에만 노출(비로그인은 로그인 안내), 성공 시 목록에 추가 |
| 삭제 | `CommentComponent.tsx` — 본인 댓글에만 삭제 버튼, `DELETE` 후 목록에서 제거 |

- 완료 기준: 작성/삭제가 새로고침 후에도 유지, 타인 댓글에는 삭제 버튼 없음

## M9. 마무리 — `feature/polish`

- [ ] `a11y-auditor`로 접근성 점검 (Header 검색 아이콘 `button` 전환, `AuthProfile` `img` `alt` 포함) 후 수정
- [ ] 모바일/태블릿/데스크톱 반응형 확인 (Playwright MCP 활용 가능)
- [ ] `data/posts.ts`, 미사용 목업 정리, `Link`의 `data-discover` 제거
- [ ] 전체 수동 시나리오: 가입 → 로그인 → 글 작성 → 수정 → 댓글 → 댓글 삭제 → 글 삭제 → 로그아웃 → 카카오 로그인
- [ ] `CLAUDE.md`, `docs/architecture/index.html`을 연동 후 구조(api/stores/hooks)로 갱신
- 완료 기준: PRD 1절 성공 기준 4가지 모두 충족
