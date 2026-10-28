import { isAxiosError } from "axios";

const fallback = "Something went wrong. Please try again.";

// 백엔드 에러 메시지는 영어/한국어가 섞여 있어, 화면 언어(영어)에 맞춰 상태 코드별로 변환한다
const messages: Record<number, string> = {
  400: "Please fill in all required fields",
  401: "Your session has expired. Please sign in again",
  403: "You can only modify your own posts",
  404: "Post not found",
  413: "The content is too large. Please use a smaller image or shorter text",
};

export function getPostErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return fallback;
  if (!error.response) return "Cannot reach the server. Please try again later.";
  return messages[error.response.status] ?? fallback;
}
