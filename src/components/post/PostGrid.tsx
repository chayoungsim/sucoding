import { Link } from "react-router";
import type { PostSummary } from "../../types/post";
import PostCard from "./PostCard";
import PostMainZero from "./PostMainZero";

type PostGridProps = {
  title: string;
  posts: PostSummary[];
  href?: string;
};

export default function PostGrid({ title, posts, href }: PostGridProps) {
  // 게시글이 없으면 PostMainZero 컴포넌트를 보여줍니다.
  if (posts.length === 0) return <PostMainZero title={title} />;

  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {href && (
          <Link
            to={href}
            aria-label={`View all ${title}`}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All Post
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
