import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router";
import { LogOut, User } from "lucide-react";
import { logout } from "../../api/auth";
import { useAuthStore } from "../../stores/authStore";

export default function AuthProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 메뉴가 열려 있을 때 바깥을 누르면(마우스·터치 모두) 메뉴를 닫는다
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isUserMenuOpen]);

  if (!user) return null;

  // Esc로 메뉴를 닫고 포커스를 메뉴 버튼으로 되돌린다
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && isUserMenuOpen) {
      setIsUserMenuOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <>
      <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          aria-label="User menu"
          aria-expanded={isUserMenuOpen}
          className="flex items-center space-x-2"
        >
          <img
            src={
              user.profileImage ??
              `https://gravatar.com/avatar/${user.id}?d=identicon`
            }
            alt={`${user.nickname} profile`}
            className="h-8 w-8 rounded-full border-2 border-blue-500"
          />
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg bg-slate-800 py-1 shadow-lg">
            <div className="border-b border-slate-700 px-4 py-2">
              <p className="text-sm font-medium break-words text-white">
                {user.nickname}
              </p>
              <p className="text-xs break-all text-gray-400">
                {user.email ?? "No email"}
              </p>
            </div>
            <Link
              to="/mypage"
              onClick={() => setIsUserMenuOpen(false)}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <User className="mr-2 h-4 w-4" aria-hidden="true" />
              My page
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
