import { useCallback, useMemo } from "react";
import { fetchPosts } from "../../../api/posts";
import ProfileCard from "../../../components/mypage/ProfileCard";
import { useFetch } from "../../../hooks/useFetch";
import { useAuthStore } from "../../../stores/authStore";
import { filterMyPosts } from "../../../utils/filterMyPosts";

export default function MyPage() {
  const user = useAuthStore((state) => state.user);

  // 전체 글을 한 번 조회한 뒤 내 글만 거른다 (fetchPost는 조회수를 올리므로 쓰지 않는다)
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchPosts({}, signal),
    []
  );
  const { data } = useFetch(fetcher);

  const userId = user?.id;
  const myPosts = useMemo(
    () => (data && userId ? filterMyPosts(data, userId) : null),
    [data, userId]
  );
  const totalViews = myPosts?.reduce((sum, post) => sum + post.viewCount, 0);

  // RequireAuth가 로그인 여부를 보장하지만 타입상 null을 걸러준다
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Page</h1>
      <ProfileCard
        user={user}
        postCount={myPosts?.length}
        totalViews={totalViews}
      />
    </div>
  );
}
