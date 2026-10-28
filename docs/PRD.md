# PRD: 인증(카카오/이메일) + 게시글·댓글 CRUD 연동

- 대상: `frontend/` (React 19 + Vite + Tailwind v4 + react-router v7)
- 연동 대상: `../backend` (Express 5 + MongoDB + JWT)
- 작성 기준: 백엔드 `routes/auth.js`, `routes/posts.js`, `models/*` 실제 코드

## 1. 배경과 목표

프론트는 API·인증·전역 상태가 없는 정적 UI 프로토타입이다. 백엔드에는 인증/게시글/댓글 API가 이미 있다.
이번 작업은 프론트를 백엔드에 연동해 실제로 동작하는 블로그로 만든다.

**성공 기준**
- 이메일 가입/로그인, 카카오 로그인 두 경로로 로그인할 수 있다.
- 게시글 조회·작성·수정·삭제, 댓글 작성·삭제가 백엔드와 왕복한다.
- 새로고침해도 로그인이 유지된다.
- `npm run build`, `npm run lint`가 통과한다.

## 2. 범위

**포함**: 이메일 로그인/회원가입, 카카오 로그인(+이메일 등록), 로그아웃, 세션 복구, 게시글 CRUD, 댓글 작성/삭제, 목록 필터·정렬·페이지네이션, 헤더 검색(클라이언트 필터링).

**제외 (Out of Scope)**
- 서버 이미지 업로드 API/저장소 (썸네일은 프론트에서 파일을 줄여 데이터 URL로 저장 — 3절 참고)
- 백엔드 코드 수정 (문제는 9절에 기록만)
- 서버 검색 API (헤더 검색은 프론트에서 전체 조회 후 제목·본문을 거르는 클라이언트 필터링으로 포함 — 6절 참고)
- 좋아요, 비밀번호 재설정, 테스트 도입

## 3. 확정 결정

| 항목 | 결정 |
|---|---|
| 썸네일 | **파일 선택 + 미리보기**. `FileReader`로 읽고 canvas로 축소·JPEG 압축한 데이터 URL(60,000자 이하)을 `thumbnail`에 저장. 백엔드 JSON 본문이 100KB로 제한되고 업로드 API가 없기 때문. (초기 결정은 URL 입력이었으나 변경) |
| 토큰 보관 | access token은 **zustand 메모리**, refresh token은 httpOnly 쿠키 |
| 세션 복구 | 앱 시작 시 `POST /auth/refresh` → `GET /auth/me` |
| 백엔드 | 수정하지 않음 |

## 4. 사용자 스토리

- 방문자는 로그인 없이 홈, 목록, 상세를 볼 수 있다.
- 가입자는 이메일/닉네임/비밀번호로 가입하고 로그인한다.
- 카카오 사용자는 카카오로 로그인하고, 이메일이 없으면 이메일을 등록한다.
- 로그인 사용자는 글을 쓰고, **본인 글만** 수정/삭제한다.
- 로그인 사용자는 댓글을 쓰고, **본인 댓글만** 삭제한다.

## 5. API 명세 (백엔드 코드 기준)

공통: 인증 필요 API는 `Authorization: Bearer <access>`, 쿠키 전송을 위해 `withCredentials: true`, 에러 본문은 `{ error: string }`.

### 인증 `/auth`

| 메서드 | 경로 | 인증 | 설명 |
|---|---|---|---|
| GET | `/auth/kakao` | - | 카카오 인가 화면으로 리다이렉트 (브라우저 이동으로 호출) |
| GET | `/auth/kakao/callback` | - | 백엔드가 처리 후 `FRONTEND_URL/auth/callback/kakao?access_token=..&email=Y\|N`로 리다이렉트 |
| POST | `/auth/signup` | - | `{email, nickname, password}` → 201 / 409(이메일 중복) |
| POST | `/auth/login` | - | `{email, password}` → `{accessToken, user}` / 401 |
| POST | `/auth/refresh` | 쿠키 | → `{accessToken}` / 401 |
| GET | `/auth/me` | O | → `{id, kakaoId, email, profileImage, nickname}` |
| PATCH | `/auth/update-email` | O | `{email}` |
| POST | `/auth/logout` | 쿠키 | → 204 |

### 게시글 `/posts`

| 메서드 | 경로 | 인증 | 설명 |
|---|---|---|---|
| GET | `/posts` | - | 쿼리 `sort=newest\|views`, `category`, `page`, `perPage` → 게시글 **배열** |
| GET | `/posts/overview` | - | → `{randomPost, latestPosts(6), popularPosts(6)}` |
| GET | `/posts/:id` | - | 단건 조회, **호출마다 viewCount +1** |
| POST | `/posts` | O | `{title, category, thumbnail, content}` → 201 |
| PUT | `/posts/:id` | O | 작성자만, 아니면 403 |
| DELETE | `/posts/:id` | O | 작성자만, 아니면 403 |
| POST | `/posts/:id/comments` | O | `{content}` → 생성된 댓글 |
| DELETE | `/posts/:postId/comments/:commentId` | O | 댓글 작성자만 |

**Post**: `{_id, title, category, thumbnail, content, createdAt, viewCount, author:{nickname, profileImage}, comments:[{_id, author, content, createdAt}]}`.
카테고리: Technology, Lifestyle, Travel, Business, Economy, Sports.

## 6. 기능 요구사항과 대상 파일

| 기능 | 대상 파일 | 변경 요지 |
|---|---|---|
| 인프라 | 신규 `src/api/client.ts`, `src/stores/authStore.ts`, `.env` | axios 인스턴스(baseURL, withCredentials, 401 시 refresh 후 1회 재시도), zustand 인증 store |
| 세션 복구 | `routes/layouts/Default.tsx` | 마운트 시 refresh → me |
| 이메일 로그인 | `pages/auth/EmailLogin.tsx` | 제어 폼, `POST /auth/login`, 에러 표시 |
| 회원가입 | `pages/auth/Signup.tsx` | 비밀번호 확인 검증, `POST /auth/signup` 후 로그인 화면 이동 |
| 카카오 | `pages/auth/Login.tsx`, `callback/Kakao.tsx` | 버튼은 `${API}/auth/kakao`로 이동. 콜백에서 `access_token`을 store에 저장하고 **즉시 URL에서 제거**. `email=N`이면 이메일 폼, `Y`면 `Redirection` |
| 헤더 | `Header.tsx`, `AuthProfile.tsx` | 로그인 여부로 아이콘/프로필 전환, 실제 닉네임·이미지, 로그아웃 |
| 검색 | `Header.tsx`, `Posts.tsx`, `PostZero.tsx`, `utils/filterPosts.ts` | 헤더 검색 폼이 `/posts?q=`로 이동, `q`가 있으면 전체 조회 후 제목·본문(대소문자 무시)을 거르고 9개씩 나눔. 결과 건수·검색 해제·결과 없음 안내. 한계: 서버 검색 API가 없어 전체 글을 내려받음 |
| 목록 | `Posts.tsx`, `PostCard.tsx` | PostCard를 props 기반으로, 카테고리·정렬(Latest=newest, Popular=views), 페이지네이션 |
| 홈 | `Home.tsx`, `FeaturedPost.tsx`, `PostGrid.tsx` | `/posts/overview` 연동 |
| 상세 | `PostRead.tsx` | 조회, 작성자에게만 수정/삭제 노출, 삭제 확인 후 `DELETE` |
| 작성/수정 | `PostCreate.tsx` | `/create-post`=POST, `/edit/:id`=기존 값 로드 후 PUT, 썸네일 파일 선택(`utils/readImageFile.ts`) |
| 댓글 | `CommentForm.tsx`, `CommentComponent.tsx` | 로그인 시에만 작성, 본인 댓글만 삭제 |
| 라우트 보호 | `routes/index.tsx` | 작성/수정은 비로그인 시 `/auth/login`으로 이동 |

## 7. 재사용할 기존 자산

- 상태 UI: `FullLoading`, `ErrorState`, `PostCardLoading`, `PostZero`, `PostMainZero`, `Redirection` (현재 모두 미연결)
- `data/posts.ts`의 `Post` 타입은 백엔드 응답 형태(`_id`, `author` 객체 등)에 맞게 고쳐 재활용한다. 목업 데이터는 제거한다.
- `CommentComponent`, `CommentForm`, 삭제 확인 모달(`PostRead`)의 기존 마크업과 Tailwind 규칙을 유지한다.

## 8. 구현 단계 (작은 커밋 단위, `feature/` 브랜치)

1. axios 클라이언트 + auth store + `.env`
2. 이메일 로그인/가입 + 로그아웃 + 세션 복구
3. 카카오 로그인 + 이메일 등록
4. 게시글 목록/홈 조회
5. 게시글 상세 + 삭제
6. 게시글 작성/수정
7. 댓글 작성/삭제
8. 접근성·반응형 점검 (`a11y-auditor`)

**비기능 요구**: 입력 `label`/`id` 연결, 에러 메시지 `role="alert"`, 키보드 조작 가능, 모바일 반응형, 토큰은 메모리에만 보관.

## 9. 의존성과 리스크 (백엔드 이슈, 이번 범위에서 수정하지 않음)

- `GET /posts`가 전체 개수를 주지 않는다. 페이지네이션은 "이전/다음 + 결과 수 < perPage면 마지막 페이지"로 우회한다.
- `/auth/login`, `/auth/update-email` 응답에 해시된 `password`가 포함된다.
- `/auth/logout`에 인증 미들웨어가 없어 refresh token이 DB에서 지워지지 않는다 (쿠키만 삭제).
- 카카오 콜백은 access token을 URL 쿼리로 전달하고 try/catch가 없다.
- `GET /posts/:id`는 호출마다 조회수를 올려, 수정 화면 로드로도 조회수가 오른다.
- `/posts/seed`는 인증 없이 전체 글을 삭제한다. `update-email`은 중복 검사가 없다.
- 쿠키에 `sameSite`/`secure`가 없어 배포 시 도메인 간 쿠키 전송 확인이 필요하다.

## 10. 확인 필요

- 프론트 dev 포트와 백엔드 `FRONTEND_URL`, `KAKAO_REDIRECT_URI` 일치 여부 (`.env`는 열람하지 않음)
- 배포(Vercel) 시 프론트/백엔드 도메인 구성과 CORS·쿠키 정책
