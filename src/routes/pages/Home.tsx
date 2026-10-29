import { fetchOverview } from "../../api/posts";
import AdBanner from "../../components/common/AdBanner";
import ErrorState from "../../components/common/ErrorState";
import FullLoading from "../../components/common/FullLoading";
import FeaturedPost from "../../components/post/FeaturedPost";
import PostGrid from "../../components/post/PostGrid";
import { useFetch } from "../../hooks/useFetch";

export default function Home() {
  const { data, error, isLoading, refetch } = useFetch(fetchOverview);

  if (isLoading) return <FullLoading />;
  if (error || !data) return <ErrorState onRetry={refetch} />;

  const { randomPost, latestPosts, popularPosts } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {randomPost && <FeaturedPost post={randomPost} />}

      <div className="mt-8">
        <AdBanner />
      </div>

      <PostGrid
        title="Latest Post"
        posts={latestPosts}
        href="/posts?sort=newest"
      />

      <div className="mt-8">
        <AdBanner />
      </div>

      <PostGrid
        title="Popular Post"
        posts={popularPosts}
        href="/posts?sort=views"
      />
    </div>
  );
}
