import { Navigate, Outlet } from "react-router";

import FullLoading from "../components/common/FullLoading";
import { useAuthStore } from "../stores/authStore";

export default function RequireAuth() {
  const user = useAuthStore((state) => state.user);
  const isReady = useAuthStore((state) => state.isReady);

  // 세션 복구가 끝나기 전에는 로그인 여부를 확정할 수 없으므로 대기한다
  if (!isReady) return <FullLoading />;

  if (!user) return <Navigate to="/auth/login" replace />;

  return <Outlet />;
}
