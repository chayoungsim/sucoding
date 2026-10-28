import { useEffect } from "react";
import { Outlet } from "react-router";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { restoreSession } from "../../api/auth";

export default function Default() {
  // 앱 시작(새로고침 포함) 시 refresh token 쿠키로 로그인 상태를 복구한다
  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
