import { Link } from "react-router";
import { Mail } from "lucide-react";

// 카카오 인가는 백엔드가 리다이렉트로 처리하므로 페이지를 직접 이동한다
const startKakaoLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/kakao`;
};

export default function Login() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome to SULOG
            </h1>
            <p className="text-gray-400">Sign in with your account</p>
          </div>

          <div className="space-y-4">
            {/* 이메일 로그인 버튼 */}
            <Link
              to="/auth/email-login"
              className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              Continue with Email
            </Link>

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-400 bg-slate-800">
                  Or continue with
                </span>
              </div>
            </div>

            {/* 카카오 로그인 버튼 */}
            <button
              type="button"
              onClick={startKakaoLogin}
              className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#000000] py-3 rounded-lg hover:bg-[#FDD800] transition-colors font-medium">
              <img
                src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
                alt="Kakao Logo"
                className="w-5 h-5"
              />
              Continue with Kakao
            </button>

            {/* 회원가입 유도 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-400 bg-slate-800">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <Link
              to="/auth/signup"
              className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition-colors font-medium"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
