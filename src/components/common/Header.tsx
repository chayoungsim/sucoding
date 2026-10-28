import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Search, PenSquare, LogIn } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import AuthProfile from "./AuthProfile";
import { useAuthStore } from "../../stores/authStore";

const maxQueryLength = 100;

export default function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const user = useAuthStore((state) => state.user);
  const isReady = useAuthStore((state) => state.isReady);

  // 주소의 검색어가 바뀌면(뒤로가기, 검색 해제 등) 입력값을 맞춘다
  // 바뀐 경우에만 맞추므로 입력 중인 값을 덮어쓰지 않는다
  if (syncedQuery !== urlQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

  // 모바일에서 입력창이 열리면 바로 입력할 수 있도록 포커스를 옮긴다
  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  const submitSearch = () => {
    const value = query.trim();
    if (!value) return;
    // 새 검색은 카테고리·정렬·페이지를 초기화하고 검색어만 가진다
    navigate(`/posts?${new URLSearchParams({ q: value })}`);
    setIsSearchOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  };

  const handleToggleClick = () => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    // 모바일에서 닫혀 있으면 입력창을 연다
    if (!isDesktop && !isSearchOpen) {
      setIsSearchOpen(true);
      return;
    }
    if (query.trim()) {
      submitSearch();
    } else if (isDesktop) {
      inputRef.current?.focus();
    } else {
      setIsSearchOpen(false);
    }
  };

  // Esc로 모바일 입력창을 닫고 포커스를 돋보기 버튼으로 되돌린다
  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && isSearchOpen) {
      setIsSearchOpen(false);
      toggleRef.current?.focus();
    }
  };

  return (
    <header className="bg-slate-900 text-white py-5 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="text-xl font-bold">SULOG</span>
        </Link>

        <div className="flex items-center space-x-4">
          <form role="search" onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              id="headerSearch"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleInputKeyDown}
              maxLength={maxQueryLength}
              autoComplete="off"
              aria-label="Search posts"
              placeholder="Search"
              className={`bg-slate-800 text-white rounded-full py-1.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-[width,opacity] ${
                isSearchOpen
                  ? "w-40 md:w-60 opacity-100"
                  : "w-0 opacity-0 invisible md:visible md:w-40 md:opacity-100"
              }`}
            />
            <button
              ref={toggleRef}
              type="button"
              onClick={handleToggleClick}
              aria-label="Toggle search"
              aria-expanded={isSearchOpen}
              aria-controls="headerSearch"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
          <Link
            to="/create-post"
            aria-label="Write a post"
            className="p-1.5 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
          >
            <PenSquare className="h-4 w-4" aria-hidden="true" />
          </Link>
          {/* 세션 복구가 끝난 뒤에만 로그인 상태를 표시한다 (깜빡임 방지) */}
          {isReady &&
            (user ? (
              <AuthProfile />
            ) : (
              <Link
                to="/auth/login"
                aria-label="Sign in"
                className="p-1.5 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
        </div>
      </div>
    </header>
  );
}
