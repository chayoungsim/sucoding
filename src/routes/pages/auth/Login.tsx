import { Mail } from "lucide-react";
import { Link } from "react-router";

// 카카오 인가는 백엔드가 리다이렉트로 처리하므로 페이지를 직접 이동한다
const startKakaoLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/kakao`;
};

export default function Login() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-slate-800 p-8 shadow-xl">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white">
              Welcome to SULOG
            </h1>
            <p className="text-gray-400">Sign in with your account</p>
          </div>

          <div className="space-y-4">
            {/* 이메일 로그인 버튼 */}
            <Link
              to="/auth/email-login"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-medium text-slate-900 transition-colors hover:bg-gray-100"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
              Continue with Email
            </Link>

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-800 px-2 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* 카카오 로그인 버튼 */}
            <button
              type="button"
              onClick={startKakaoLogin}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] py-3 font-medium text-[#000000] transition-colors hover:bg-[#FDD800]"
            >
              <img
                src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
                alt="Kakao Logo"
                className="h-5 w-5"
              />
              Continue with Kakao
            </button>

            {/* 회원가입 유도 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-800 px-2 text-gray-400">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <Link
              to="/auth/signup"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700 py-3 font-medium text-white transition-colors hover:bg-slate-600"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
