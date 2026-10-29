import { isAxiosError } from "axios";

const fallback = "Something went wrong. Please try again.";

// 백엔드 에러 메시지는 한국어라서, 화면 언어(영어)에 맞춰 상태 코드별로 변환한다
const messages: Record<number, string> = {
  400: "Please fill in all required fields",
  401: "Invalid email or password",
  409: "This email is already in use",
};

export function getAuthErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return fallback;
  if (!error.response)
    return "Cannot reach the server. Please try again later.";
  return messages[error.response.status] ?? fallback;
}
