import { CalendarDays } from "lucide-react";
import { Link } from "react-router";
import type { PostSummary } from "../../types/post";
import { formatDate } from "../../utils/formatDate";

type PostCardProps = {
  post: PostSummary;
};

export default function PostCard({ post }: PostCardProps) {
  const { author } = post;

  return (
    <div className="overflow-hidden rounded-lg bg-slate-800 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        to={`/post/${post._id}`}
        className="relative block aspect-video overflow-hidden"
      >
        <img
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          src={post.thumbnail}
        />
        <div className="absolute top-3 left-3">
          <span className="rounded-md bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white">
            {post.category}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/post/${post._id}`}>
          <h2 className="mb-3 line-clamp-2 text-lg font-bold text-white hover:text-blue-400">
            {post.title}
          </h2>
        </Link>
        <div className="flex items-center">
          <img
            alt={author.nickname}
            className="mr-2 h-6 w-6 rounded-full"
            src={
              author.profileImage ??
              `https://gravatar.com/avatar/${author._id}?d=identicon`
            }
          />
          <span className="mr-3 text-sm text-gray-300">{author.nickname}</span>
          <div className="flex items-center text-xs text-gray-400">
            <CalendarDays className="mr-1 h-3 w-3" aria-hidden="true" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
