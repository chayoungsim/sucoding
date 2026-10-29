import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Clock, Filter, TrendingUp } from "lucide-react";
import { fetchPosts } from "../../../api/posts";
import AdBanner from "../../../components/common/AdBanner";
import ErrorState from "../../../components/common/ErrorState";
import PostCard from "../../../components/post/PostCard";
import PostCardLoading from "../../../components/post/PostCardLoading";
import PostZero from "../../../components/post/PostZero";
import { categories } from "../../../constants/categories";
import { useFetch } from "../../../hooks/useFetch";
import { filterPostsByQuery } from "../../../utils/filterPosts";

const perPage = 9;
const maxQueryLength = 100;

export default function Posts() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 주소창의 쿼리를 검증해서 사용한다 (잘못된 값은 기본값으로 대체)
  const category = categories.find(
    (item) => item === searchParams.get("category")
  );
  const sort = searchParams.get("sort") === "views" ? "views" : "newest";
  const pageNumber = Number(searchParams.get("page"));
  const page = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;

  // 검색어(q): 백엔드에 검색 API가 없어 전체를 조회한 뒤 이 화면에서 거른다
  const query = (searchParams.get("q") ?? "").trim().slice(0, maxQueryLength);
  const isSearching = query !== "";

  // 검색 중에는 전체를 한 번만 조회하므로(0) 페이지를 넘겨도 다시 조회하지 않는다
  const requestPage = isSearching ? 0 : page;
  const fetcher = useCallback(
    (signal: AbortSignal) =>
      requestPage === 0
        ? fetchPosts({ sort, category }, signal)
        : fetchPosts({ sort, category, page: requestPage, perPage }, signal),
    [sort, category, requestPage]
  );
  const { data, error, isLoading, refetch } = useFetch(fetcher);

  const searchResults = useMemo(
    () => (isSearching && data ? filterPostsByQuery(data, query) : null),
    [data, isSearching, query]
  );
  const posts = isSearching
    ? (searchResults?.slice((page - 1) * perPage, page * perPage) ?? null)
    : data;

  const updateParams = (changes: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([key, value]) => {
        if (value === null) next.delete(key);
        else next.set(key, value);
      });
      return next;
    });
  };

  // 필터·정렬이 바뀌면 1페이지로 돌아간다
  const changeCategory = (value: string) =>
    updateParams({ category: value || null, page: null });
  const changeSort = (value: "newest" | "views") =>
    updateParams({ sort: value, page: null });
  const changePage = (value: number) =>
    updateParams({ page: value > 1 ? String(value) : null });

  const clearSearch = () => updateParams({ q: null, page: null });

  // 일반 목록은 전체 개수를 알 수 없어 결과가 perPage보다 적으면 마지막 페이지로 본다
  // 검색 결과는 전체를 갖고 있으므로 정확히 계산한다
  const isLastPage = isSearching
    ? !searchResults || searchResults.length <= page * perPage
    : !posts || posts.length < perPage;

  const renderList = () => {
    if (isLoading) {
      return (
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
        >
          {Array.from({ length: perPage }, (_, index) => (
            <PostCardLoading key={index} />
          ))}
        </div>
      );
    }
    if (error || !posts) return <ErrorState onRetry={refetch} />;
    if (posts.length === 0) {
      if (page > 1) {
        return (
          <p className="py-16 text-center text-gray-400">
            There are no more posts.
          </p>
        );
      }
      return (
        <PostZero
          selectedCategory={category ?? ""}
          searchQuery={query}
          onClearSearch={clearSearch}
          onShowAll={() => changeCategory("")}
        />
      );
    }
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Header: Title + Filter */}
      <div className="mb-8 flex flex-col items-center justify-between md:flex-row">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 md:mb-0 dark:text-white">
          Blog Posts
        </h1>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 focus-within:ring-2 focus-within:ring-blue-500 dark:bg-slate-800">
            <Filter
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
            />
            <select
              aria-label="Category"
              value={category ?? ""}
              onChange={(event) => changeCategory(event.target.value)}
              className="bg-transparent text-gray-700 focus:outline-none dark:text-gray-300"
            >
              <option value="">All</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div
            role="group"
            aria-label="Sort posts"
            className="flex rounded-lg bg-gray-100 dark:bg-slate-800"
          >
            <button
              type="button"
              aria-pressed={sort === "newest"}
              onClick={() => changeSort("newest")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                sort === "newest"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-slate-700"
              }`}
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              Latest
            </button>
            <button
              type="button"
              aria-pressed={sort === "views"}
              onClick={() => changeSort("views")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                sort === "views"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-slate-700"
              }`}
            >
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Popular
            </button>
          </div>
        </div>
      </div>

      {/* 검색 중이면 검색어와 결과 수를 알려준다 (검색어는 텍스트로만 출력) */}
      {isSearching && (
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <p role="status" className="break-all text-gray-300">
            {searchResults
              ? `Results for "${query}" (${searchResults.length})`
              : `Searching for "${query}"...`}
          </p>
          <button
            type="button"
            onClick={clearSearch}
            className="rounded-lg bg-slate-700 px-4 py-1.5 text-sm text-white transition-colors hover:bg-slate-600"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Post List */}
      {renderList()}

      {/* Pagination */}
      <nav
        aria-label="Pagination"
        className="mt-12 flex items-center justify-center gap-2"
      >
        <button
          type="button"
          onClick={() => changePage(page - 1)}
          disabled={page <= 1 || isLoading}
          className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 disabled:opacity-50 dark:bg-slate-800 dark:text-gray-300"
        >
          Previous
        </button>
        <span
          className="px-3 text-gray-700 dark:text-gray-300"
          aria-current="page"
        >
          Page {page}
        </span>
        <button
          type="button"
          onClick={() => changePage(page + 1)}
          disabled={isLastPage || isLoading}
          className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 disabled:opacity-50 dark:bg-slate-800 dark:text-gray-300"
        >
          Next
        </button>
      </nav>

      {/* Ad Banner */}
      <div className="mt-12">
        <AdBanner />
      </div>
    </div>
  );
}
