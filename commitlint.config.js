// 커밋 메시지 형식: "<type>(<scope>): <한글 설명>"
// 예) feat: 마이페이지 통계 추가 / fix(auth): 로그아웃 오류 수정
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    // 한글 제목에는 대소문자 규칙이 의미 없으므로 해제
    "subject-case": [0],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
  },
};
