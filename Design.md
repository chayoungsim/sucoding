# Design.md — SULOG UI 디자인 가이드

새 화면·컴포넌트를 추가할 때 **기존 UI와 같은 모습**을 유지하기 위한 기준이다.
값은 현재 코드(`PostCard`, `Header`, `PostForm`, `EmailLogin`, `DeleteConfirmModal`, `ErrorState` 등)에서 추출했다.
새 UI는 이 문서의 토큰·패턴을 먼저 따르고, 없는 경우에만 가까운 기존 컴포넌트를 복사해 맞춘다.
스타일 규칙이 바뀌면 이 문서도 함께 갱신한다.

## 1. 원칙

1. **다크 테마 단일**: 앱 배경은 `bg-slate-900`이다. 색상은 다크 기준 값을 **직접** 쓴다 (`text-white`, `bg-slate-800`).
2. **Tailwind 유틸리티만**: JSX `className`에 직접 쓴다. SCSS·CSS 파일·인라인 `style`·임의 값(`[#123456]`)은 쓰지 않는다. `tailwind.config`가 없으므로 기본 팔레트만 쓴다.
3. **기존 컴포넌트 재사용**: 새로 만들기 전에 `components/common`, `components/post`, `components/comment`를 확인한다.
4. **반응형·접근성은 기본값**: 모바일 우선으로 쓰고 `md:`/`lg:`로 확장한다. 모든 상호작용 요소는 키보드로 조작되고 포커스가 보여야 한다.
5. **UI 문구는 영어**, 코드 주석은 한국어. 서비스명은 `SULOG`.

> 주의: `Posts.tsx`의 필터·페이지네이션은 `text-gray-900 dark:text-white`, `bg-gray-100 dark:bg-slate-800`처럼 라이트/다크 쌍을 쓰는 예외다. OS가 라이트 모드면 어두운 배경 위에서 대비가 깨질 수 있다. **새 코드에서 따라 하지 말고**, 해당 부분을 고칠 때 다크 값(`text-white`, `bg-slate-800`, `text-gray-300`)으로 통일한다.

## 2. 색상 토큰

| 용도 | 클래스 |
|---|---|
| 앱 배경 | `bg-slate-900` |
| 카드·패널·모달·댓글 박스 | `bg-slate-800` |
| 입력 필드 (페이지 폼) | `bg-slate-800` |
| 입력 필드 (카드 안 폼: 로그인·가입) | `bg-slate-700` |
| 보조 버튼(Cancel 등) 배경 | `bg-slate-700` + `hover:bg-slate-600` (페이지 폼), `bg-gray-600` + `hover:bg-gray-700` (카드·모달) |
| 주 색상 / 주 버튼 | `bg-blue-500`, hover `bg-blue-600` |
| 링크 강조 | `text-blue-400`, hover `text-blue-300` |
| 제목·강조 텍스트 | `text-white` |
| 본문 텍스트 | `text-gray-300` |
| 보조·메타 텍스트 | `text-gray-400` (더 약하게: `text-gray-500`) |
| 아이콘(입력 안) | `text-gray-400` |
| 위험·삭제 | `bg-red-500`, hover `bg-red-600` |
| 에러 텍스트 | `text-red-500` |
| 에러 박스 | `bg-red-500/10 border border-red-500/50 rounded-lg` |
| 오버레이 | `bg-black/50` (모달), 이미지 위 그라데이션 `from-black/80 via-black/40 to-transparent` |

- 새 색상 계열(green, purple 등)을 도입하지 않는다. 성공 표시가 필요하면 먼저 합의한다.
- 한계: `text-red-500`·`bg-blue-500` + 흰 글자는 대비가 낮은 편이다(AA 경계). 작은 글자에 쓸 때는 `text-red-400`을 검토한다.

## 3. 타이포그래피

폰트는 Tailwind 기본(시스템 sans)이다. 별도 웹폰트를 추가하지 않는다.

| 용도 | 클래스 |
|---|---|
| 페이지 제목 `h1` | `text-3xl font-bold text-white` |
| 카드형 화면 제목(로그인) | `text-2xl font-bold text-white` |
| 히어로 제목 | `text-2xl md:text-3xl lg:text-4xl font-bold text-white` |
| 섹션 제목 `h2` | `text-2xl font-bold text-white` |
| 카드 제목 | `text-lg font-bold text-white line-clamp-2` (링크 hover `text-blue-400`) |
| 폼 라벨 | `block text-sm font-medium text-gray-300 mb-2` |
| 본문 | `text-gray-300` (줄바꿈 보존은 `whitespace-pre-line break-words`) |
| 메타(날짜·작성자) | `text-sm text-gray-400` 또는 `text-xs text-gray-400` |
| 배지 | `text-xs font-semibold` |
| 로고 | `text-xl font-bold` + 파란 원 `h-8 w-8 bg-blue-500 rounded-full` 안에 `S` |

- 제목 계층(`h1` → `h2` → `h3`)을 건너뛰지 않는다. 한 화면에 `h1`은 하나다 (모달 제목은 `h3`).
- 게시글 본문·댓글은 **텍스트로만** 출력한다. `dangerouslySetInnerHTML` 금지.

## 4. 레이아웃·간격

| 대상 | 클래스 |
|---|---|
| 앱 쉘 | `min-h-screen bg-slate-900 flex flex-col` → `Header` / `<main className="grow">` / `Footer` (`Default.tsx`) |
| 페이지 컨테이너(목록·상세) | `max-w-7xl mx-auto px-4 md:px-8` (+ `py-8`) |
| 폼 페이지 컨테이너 | `max-w-4xl mx-auto px-4 md:px-8 py-8` |
| 카드형 중앙 화면(로그인·가입) | 바깥 `min-h-[calc(100vh-64px)] flex items-center justify-center px-4` → `w-full max-w-md` → `bg-slate-800 rounded-lg shadow-xl p-8` |
| 중앙 안내 화면(404·Access Denied) | `max-w-7xl mx-auto px-4 md:px-8 py-20 text-center` |
| 카드 그리드 | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` |
| 섹션 | `py-10`, 섹션 머리말 `flex items-center justify-between mb-8` |
| 폼 필드 간격 | 페이지 폼 `space-y-6`, 카드 폼 `space-y-4` |
| 버튼 묶음 | `flex gap-4` (카드 폼은 `flex gap-3`, 각 버튼 `flex-1`) |

- 가로 스크롤이 생기면 안 된다. 375px에서 확인한다.
- 간격은 Tailwind 스케일(`gap-2/3/4/6`, `mb-2/4/6/8`)만 쓴다.

## 5. 컴포넌트 패턴

### 5.1 버튼

| 종류 | 클래스 |
|---|---|
| 주 버튼 | `px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50` |
| 보조 버튼 | `px-6 py-2.5 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors` |
| 위험 버튼 | `bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50` |
| 아이콘 원형 버튼(헤더) | `p-1.5 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors` / 보조는 `bg-slate-800 hover:bg-slate-700` |
| 텍스트 버튼(댓글 삭제) | `flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition-colors` |

- 모든 버튼은 `rounded-lg`(원형은 `rounded-full`)이고 `transition-colors`를 갖는다.
- 비동기 동작 중에는 `disabled`로 막고 `disabled:opacity-50`을 준다 (`isSubmitting`).
- 이동은 `<Link>`, 동작은 `<button type="button">`. 폼 제출 버튼만 `type="submit"`.
- 아이콘만 있는 버튼·링크는 반드시 `aria-label`을 붙인다.

### 5.2 폼 필드

- `<label htmlFor>` + `id` 쌍, `required` 명시. 라벨은 §3의 라벨 클래스.
- 입력: `w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none` (카드 폼은 `bg-slate-700`, `py-3`).
- 아이콘이 있는 입력은 `relative` 래퍼 + 아이콘 `absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5`, 입력에 `pl-10`(오른쪽 버튼이 있으면 `pr-12`).
- 모든 폼은 제어 컴포넌트이며 `isSubmitting`/`error` state로 처리한다.
- **파일 선택**: 실제 `input[type=file]`은 `sr-only`로 숨기고, 점선 박스 `<label>`(`border-2 border-dashed border-gray-600 rounded-lg aspect-video`, `peer-focus-visible:ring-2`)이 클릭·포커스를 표시한다. 미리보기는 같은 `aspect-video` 박스에 `object-cover rounded-lg`, 제거는 우상단 `bg-red-500 rounded-full` 아이콘 버튼 (`PostForm` 참고).

### 5.3 카드

- 기본 카드: `bg-slate-800 rounded-lg` (+ 목록 카드는 `overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl`).
- 썸네일은 `aspect-video overflow-hidden`, 이미지 `w-full h-full object-cover`, hover 확대 `transition-transform duration-500 hover:scale-105`.
- 카테고리 배지는 이미지 좌상단 `absolute top-3 left-3`, `bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-md`.
- 카드 본문 패딩은 `p-4`. 작성자 줄은 아바타 `w-6 h-6 rounded-full mr-2` + 닉네임 `text-gray-300 text-sm` + 날짜(`CalendarDays h-3 w-3` 아이콘 + `text-xs text-gray-400`).
- 프로필 이미지가 없으면 `https://gravatar.com/avatar/${_id}?d=identicon`을 쓴다.

### 5.4 상태 화면

| 상태 | 컴포넌트 |
|---|---|
| 전체 로딩 | `FullLoading` |
| 카드 로딩 | `PostCardLoading` × `perPage`, 컨테이너에 `aria-busy="true"` |
| 에러 | `ErrorState` (`role="alert"`, `onRetry`로 "Try again" 버튼) |
| 빈 목록 | `PostZero`(목록), `PostMainZero`(섹션) |
| 404 | §4의 중앙 안내 화면 (`Post Not Found` 등) |
| 권한 없음 | 같은 화면에 "Access Denied" + 파란 버튼 링크 |

- 새 화면도 로딩 → 에러 → 빈 상태 → 정상 순서로 분기하고, 위 컴포넌트를 재사용한다.
- 폼 에러는 `role="alert"` + 에러 박스(§2). 필드 단위 에러는 `text-red-500 text-sm mt-2`.
- 처리 중 안내는 `role="status"` + `text-gray-400 text-sm`.

### 5.5 모달

- 구조: `fixed inset-0 bg-black/50 flex items-center justify-center z-50` → `role="dialog" aria-modal="true" aria-labelledby aria-describedby` 패널 `bg-slate-800 p-6 rounded-lg max-w-md w-full mx-4`.
- 제목 `text-xl font-bold text-white mb-4`, 본문 `text-gray-300 mb-6`, 버튼 영역 `flex justify-end gap-4`.
- 동작 규칙(`DeleteConfirmModal` 참고): 열리면 **취소 버튼**에 포커스, Tab 순환, `Esc`로 닫기(진행 중에는 비활성), 닫히면 이전 포커스 복원. 파괴적 동작의 기본 포커스는 항상 안전한 쪽(취소)이다.

### 5.6 헤더·내비게이션

- 헤더: `bg-slate-900 text-white py-5 px-4 md:px-8` + 내부 `max-w-7xl mx-auto flex items-center justify-between`.
- 검색은 토글 버튼(`aria-expanded`, `aria-controls`)이다. 닫힌 모바일 입력은 `invisible`로 탭 순서에서 뺀다.
- 정렬·필터 토글은 `role="group"` + `aria-pressed`, 선택 상태는 `bg-blue-500 text-white`.
- 페이지네이션은 `<nav aria-label="Pagination">` + Previous / `Page N`(`aria-current="page"`) / Next.

### 5.7 아이콘

- `lucide-react`만 쓴다. 장식용은 `aria-hidden="true"`.
- 크기: 인라인 메타 `h-3 w-3`, 버튼 안 `h-4 w-4`, 입력 안 `h-5 w-5`, 상태·업로드 박스 `h-12 w-12`.

### 5.8 이미지

- 항상 `alt`를 넣는다. 의미 있는 이미지는 제목/닉네임, 이미 옆에 텍스트가 있는 장식 아바타는 `alt=""`.
- 비율은 `aspect-video`(16:9) 기준이고 히어로는 `aspect-[16/9] md:aspect-[21/9]`. 항상 `object-cover`.

## 6. 반응형

| 브레이크포인트 | 사용 |
|---|---|
| 기본(모바일 우선) | 1열, `px-4` |
| `md:` (768px) | 2열 그리드, `px-8`, 헤더 검색창 상시 표시, 히어로 21:9 |
| `lg:` (1024px) | 3열 그리드, 히어로 제목 확대 |

- 필터·헤더 같은 가로 배치는 모바일에서 `flex-col`로 쌓고 `md:flex-row`로 바꾼다.
- 터치 대상은 충분히 크게(아이콘 버튼은 `p-1.5` 이상) 하고, 모바일 375px에서 가로 스크롤이 없어야 한다.

## 7. 접근성 체크리스트

새 UI를 만들 때마다 확인한다.

- [ ] 시맨틱 요소(`header/main/nav/section/button/a`)를 쓰고 `div`+`onClick`을 쓰지 않았다.
- [ ] 모든 입력에 `label`이 연결돼 있다.
- [ ] 아이콘 전용 컨트롤에 `aria-label`, 장식 아이콘에 `aria-hidden="true"`.
- [ ] 에러는 `role="alert"`, 진행 상태는 `role="status"`.
- [ ] 키보드만으로 모든 동작이 가능하고, 포커스 링(`focus:ring-2 focus:ring-blue-500`)이 보인다. `outline-none`만 단독으로 쓰지 않는다.
- [ ] 토글은 `aria-pressed`/`aria-expanded`, 모달은 포커스 이동·가두기·복원·Esc.
- [ ] 색만으로 상태를 구분하지 않는다 (텍스트·아이콘 병행).
- [ ] 제목 계층이 순서대로이고 `h1`이 하나다.

## 8. 하지 말 것

- 라이트 테마용 색상(`bg-white`, `text-gray-900`)이나 `dark:` 쌍을 새로 쓰기
- 임의 값 클래스(`w-[317px]`, `text-[#abc]`)와 인라인 `style` (예외: 이미 있는 `min-h-[calc(100vh-64px)]`, `aspect-[16/9]`)
- 파란색 외의 새 강조색, 새 폰트, 새 아이콘 라이브러리
- 화살표 함수 컴포넌트·named export (함수 선언 + `export default function`)
- 이미지·텍스트 오버레이에서 `alt`/대비 확인 생략
- 마크업 변경 후 `npm run lint`, `npm run build`, 브라우저(데스크톱 + 375px) 확인 생략

## 9. 새 화면 추가 순서

1. 가장 비슷한 기존 화면을 고른다 (목록형 → `Posts`, 폼 → `PostForm`, 인증 카드 → `EmailLogin`, 상세 → `PostRead`).
2. §4의 컨테이너로 시작하고 §5의 컴포넌트를 재사용한다. 새 컴포넌트는 `components/{도메인}/`에 `XxxProps` 타입과 함께 만든다.
3. 로딩·에러·빈 상태를 먼저 붙인다.
4. §7 체크리스트로 점검하고, 필요하면 `a11y-auditor`로 검사한다.
5. 토큰·패턴이 새로 생기면 이 문서와 `shrimp-rules.md`의 파일 연동 표를 함께 갱신한다.
