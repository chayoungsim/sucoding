import { api, refreshAccessToken } from "./client";
import { useAuthStore } from "../stores/authStore";
import type { User } from "../types/user";

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  useAuthStore.getState().setUser(data);
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<{ accessToken: string }>("/auth/login", {
    email,
    password,
  });
  useAuthStore.getState().setAccessToken(data.accessToken);
  // login 응답의 user는 /auth/me와 형태(_id / id)가 달라 쓰지 않고 다시 조회한다
  await fetchMe();
}

export async function signup(
  email: string,
  nickname: string,
  password: string
) {
  await api.post("/auth/signup", { email, nickname, password });
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // 서버 요청이 실패해도 화면에서는 로그아웃 처리한다
  } finally {
    useAuthStore.getState().clear();
  }
}

// StrictMode나 중복 호출에서도 세션 복구는 한 번만 실행한다.
// refresh token은 사용할 때마다 교체되므로 동시에 두 번 요청하면 로그인이 풀린다.
let restorePromise: Promise<void> | null = null;

export function restoreSession(): Promise<void> {
  if (!restorePromise) {
    restorePromise = (async () => {
      try {
        // 카카오 콜백 등으로 이미 토큰이 있으면 재발급을 건너뛴다
        if (!useAuthStore.getState().accessToken) {
          await refreshAccessToken();
        }
        if (!useAuthStore.getState().user) {
          await fetchMe();
        }
      } catch {
        // 비로그인 방문자는 refresh가 401이므로 정상 흐름으로 취급한다
      } finally {
        useAuthStore.getState().setReady(true);
      }
    })();
  }
  return restorePromise;
}
