import { CalendarDays } from "lucide-react";
import { Link } from "react-router";

import type { PostSummary } from "../../types/post";
import { formatDate } from "../../utils/formatDate";

type FeaturedPostProps = {
  post: PostSummary;
};

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const { author } = post;

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg md:aspect-[21/9]">
      <img
        alt={post.title}
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        src={post.thumbnail}
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-8">
        <div className="mb-4">
          <span className="rounded-md bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white">
            {post.category}
          </span>
        </div>
        <Link to={`/post/${post._id}`}>
          <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
            {post.title}
          </h1>
        </Link>
        <div className="flex items-center">
          <img
            src={
              author.profileImage ??
              `https://gravatar.com/avatar/${author._id}?d=identicon`
            }
            className="mr-3 h-8 w-8 rounded-full"
            alt={author.nickname}
          />
          <div className="text-white">
            <p className="text-sm font-medium">{author.nickname}</p>
            <div className="flex items-center text-xs text-gray-300">
              <CalendarDays className="mr-1 h-3 w-3" aria-hidden="true" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
