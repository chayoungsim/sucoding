import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";

import { login } from "../../../api/auth";
import { getAuthErrorMessage } from "../../../utils/getAuthErrorMessage";

export default function EmailLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-slate-800 p-8 shadow-xl">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white">
              Welcome to SULOG
            </h1>
            <p className="text-gray-400">
              Please enter your credentials to continue
            </p>
          </div>

          {/* 에러 */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3"
            >
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* 이메일 입력 */}
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
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg bg-slate-700 py-3 pr-12 pl-10 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="flex-1 rounded-lg bg-gray-600 py-3 text-white transition-colors hover:bg-gray-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-blue-500 py-3 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
