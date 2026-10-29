import { isAxiosError } from "axios";
import { Mail } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import { api } from "../../../../api/client";
import Redirection from "../../../../components/common/Redirection";
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
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
        <p role="alert" className="mb-4 text-rose-500">
          Kakao sign-in failed. Please try again.
        </p>
        <Link
          to="/auth/login"
          className="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-slate-800 p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white">
              You're almost there
            </h1>
            <p className="text-gray-400">Sign up with just your email!</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg bg-slate-700 py-3 pr-4 pl-10 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>
              {emailError && (
                <p role="alert" className="mt-2 text-rose-500">
                  {emailError}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                className="flex-1 rounded-lg bg-gray-600 py-3 text-white transition-colors hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-blue-500 py-3 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
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
