import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Clock, TrendingUp } from "lucide-react";
import { fetchPosts } from "../../../api/posts";
import ErrorState from "../../../components/common/ErrorState";
import MyPostsZero from "../../../components/mypage/MyPostsZero";
import ProfileCard from "../../../components/mypage/ProfileCard";
import PostCard from "../../../components/post/PostCard";
import PostCardLoading from "../../../components/post/PostCardLoading";
import { useFetch } from "../../../hooks/useFetch";
import { useAuthStore } from "../../../stores/authStore";
import { filterMyPosts } from "../../../utils/filterMyPosts";

const perPage = 9;

export default function MyPage() {
  const user = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();

  // 주소창의 쿼리를 검증해서 사용한다 (잘못된 값은 기본값으로 대체)
  const sort = searchParams.get("sort") === "views" ? "views" : "newest";
  const pageNumber = Number(searchParams.get("page"));
  const requestedPage =
    Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;

  // 전체 글을 한 번 조회한 뒤 내 글만 거른다 (fetchPost는 조회수를 올리므로 쓰지 않는다)
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchPosts({}, signal),
    []
  );
  const { data, error, isLoading, refetch } = useFetch(fetcher);

  const userId = user?.id;
  const myPosts = useMemo(
    () => (data && userId ? filterMyPosts(data, userId) : null),
    [data, userId]
  );
  const totalViews = myPosts?.reduce((sum, post) => sum + post.viewCount, 0);

  // 서버 정렬에 기대지 않고 내 글을 직접 정렬한다
  const sortedPosts = useMemo(() => {
    if (!myPosts) return null;
    return [...myPosts].sort((a, b) =>
      sort === "views"
        ? b.viewCount - a.viewCount
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [myPosts, sort]);

  // 범위를 벗어난 page(?page=999 등)는 마지막 페이지로 보정한다
  const totalPages = Math.max(
    1,
    Math.ceil((sortedPosts?.length ?? 0) / perPage)
  );
  const page = sortedPosts
    ? Math.min(requestedPage, totalPages)
    : requestedPage;
  const pagePosts = sortedPosts?.slice((page - 1) * perPage, page * perPage);
  const isLastPage = page >= totalPages;

  // 스크린리더에 로딩 완료·정렬·페이지 변경을 알리는 문구 (화면에는 보이지 않는다)
  const sortLabel = sort === "views" ? "most viewed" : "latest";
  const getStatusMessage = () => {
    if (isLoading) return "Loading my posts";
    if (error || !sortedPosts) return "";
    if (sortedPosts.length === 0) return "You have no posts";
    const count = `${sortedPosts.length} ${sortedPosts.length === 1 ? "post" : "posts"}`;
    return `${count}, sorted by ${sortLabel}, page ${page} of ${totalPages}`;
  };

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

  // 정렬이 바뀌면 1페이지로 돌아간다 (같은 정렬을 다시 누르면 무시)
  const changeSort = (value: "newest" | "views") => {
    if (value === sort) return;
    updateParams({ sort: value, page: null });
  };
  const changePage = (value: number) =>
    updateParams({ page: value > 1 ? String(value) : null });

  const renderList = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: perPage }, (_, index) => (
            <PostCardLoading key={index} />
          ))}
        </div>
      );
    }
    if (error || !pagePosts) return <ErrorState onRetry={refetch} />;
    if (sortedPosts?.length === 0) return <MyPostsZero />;
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pagePosts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    );
  };

  // RequireAuth가 로그인 여부를 보장하지만 타입상 null을 걸러준다
  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="mb-8 text-3xl font-bold text-white">My Page</h1>
      <ProfileCard
        user={user}
        postCount={myPosts?.length}
        totalViews={totalViews}
      />

      <section
        aria-labelledby="myPostsHeading"
        aria-busy={isLoading}
        className="mt-12"
      >
        <p role="status" className="sr-only">
          {getStatusMessage()}
        </p>
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 id="myPostsHeading" className="text-2xl font-bold text-white">
            My Posts
          </h2>
          <div
            role="group"
            aria-label="Sort my posts"
            className="flex rounded-lg bg-slate-800"
          >
            <button
              type="button"
              aria-pressed={sort === "newest"}
              onClick={() => changeSort("newest")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                sort === "newest"
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:bg-slate-700"
              }`}
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              Latest
            </button>
            <button
              type="button"
              aria-pressed={sort === "views"}
              onClick={() => changeSort("views")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                sort === "views"
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:bg-slate-700"
              }`}
            >
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Popular
            </button>
          </div>
        </div>

        {renderList()}

        {/* 글이 한 페이지를 넘길 때만 페이지네이션을 보여준다 */}
        {sortedPosts && sortedPosts.length > perPage && (
          <nav
            aria-label="Pagination"
            className="mt-12 flex items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page <= 1}
              className="rounded-lg bg-slate-800 px-4 py-2 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 text-gray-300">Page {page}</span>
            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={isLastPage}
              className="rounded-lg bg-slate-800 px-4 py-2 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
