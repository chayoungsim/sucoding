import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { isAxiosError } from "axios";
import { Mail } from "lucide-react";
import Redirection from "../../../../components/common/Redirection";
import { api } from "../../../../api/client";
import { useAuthStore } from "../../../../stores/authStore";
import type { User } from "../../../../types/user";

type Status = "loading" | "needEmail" | "error";

// 백엔드는 이메일 중복도 500으로 응답하므로, 상태 코드별로 가능한 원인을 안내한다
function getEmailErrorMessage(error: unknown): string {
  if (!isAxiosError(error) || !error.response) {
    return "Cannot reach the server. Please try again later.";
  }
  switch (error.response.status) {
    case 400:
      return "Please enter a valid email";
    case 401:
      return "Your session has expired. Please sign in again.";
    default:
      return "Could not save this email. It may already be used by another account.";
  }
}

export default function Kakao() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);

  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // StrictMode에서 effect가 두 번 실행되어도 콜백 처리는 한 번만 한다
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");

    // 토큰이 주소창과 브라우저 기록에 남지 않도록 즉시 쿼리를 제거한다
    window.history.replaceState(null, "", window.location.pathname);

    if (!accessToken) {
      navigate("/auth/login", { replace: true });
      return;
    }

    setAccessToken(accessToken);
    api
      .get<User>("/auth/me")
      .then((res) => {
        setUser(res.data);
        // 쿼리의 email 값(Y/N) 대신 실제 사용자 정보를 기준으로 이메일 입력 여부를 정한다
        if (res.data.email) {
          navigate("/", { replace: true });
        } else {
          setStatus("needEmail");
        }
      })
      .catch(() => setStatus("error"));
  }, [navigate, setAccessToken, setUser]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError("");
    setIsSubmitting(true);
    try {
      await api.patch("/auth/update-email", { email });
      const user = useAuthStore.getState().user;
      if (user) setUser({ ...user, email });
      navigate("/", { replace: true });
    } catch (err) {
      console.error("update-email failed", err);
      setEmailError(getEmailErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return <Redirection />;
  }

  if (status === "error") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center">
        <p role="alert" className="text-rose-500 mb-4">
          Kakao sign-in failed. Please try again.
        </p>
        <Link
          to="/auth/login"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              You're almost there
            </h1>
            <p className="text-gray-400">Sign up with just your email!</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>
              {emailError && (
                <p role="alert" className="text-rose-500 mt-2">
                  {emailError}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
