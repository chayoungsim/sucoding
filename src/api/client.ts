import axios, { type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "../stores/authStore";

const baseURL = import.meta.env.VITE_API_URL;

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const skipRefreshUrls = ["/auth/login", "/auth/signup", "/auth/refresh"];

// refresh token 쿠키를 보내기 위해 withCredentials 필수
export const api = axios.create({ baseURL, withCredentials: true });

// 진행 중인 refresh 요청을 하나만 공유한다.
// refresh token은 사용할 때마다 교체되므로, 동시에 두 번 호출하면 두 번째가 실패해 쿠키가 삭제된다.
let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    // 인터셉터 무한 루프를 피하려고 api 인스턴스가 아닌 axios를 직접 사용
    refreshPromise = axios
      .post<{ accessToken: string }>(`${baseURL}/auth/refresh`, null, {
        withCredentials: true,
      })
      .then((res) => {
        useAuthStore.getState().setAccessToken(res.data.accessToken);
        return res.data.accessToken;
      })
      .catch((error) => {
        useAuthStore.getState().clear();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableConfig | undefined;
    // 로그인/가입/재발급 요청은 토큰 재발급 대상이 아니다 (/auth/me 등 인증 필요 요청은 대상)
    const isSkipped = skipRefreshUrls.some((url) => config?.url === url);

    // 401이면 토큰을 재발급받고 원래 요청을 1회만 재시도한다
    if (
      error.response?.status === 401 &&
      config &&
      !config._retry &&
      !isSkipped
    ) {
      config._retry = true;
      await refreshAccessToken();
      return api(config);
    }
    return Promise.reject(error);
  }
);
