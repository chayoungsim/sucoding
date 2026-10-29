import { create } from "zustand";

import type { User } from "../types/user";

type AuthState = {
  // access token은 XSS 노출을 줄이기 위해 메모리(store)에만 보관한다
  accessToken: string | null;
  user: User | null;
  // 앱 시작 시 세션 복구가 끝났는지 여부 (끝나기 전에는 로그인 UI를 확정하지 않는다)
  isReady: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: User | null) => void;
  setReady: (isReady: boolean) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isReady: false,
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setReady: (isReady) => set({ isReady }),
  clear: () => set({ accessToken: null, user: null }),
}));
