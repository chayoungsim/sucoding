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
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg">
      <img
        alt={post.title}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        src={post.thumbnail}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
        <div className="mb-4">
          <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
            {post.category}
          </span>
        </div>
        <Link to={`/post/${post._id}`}>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            {post.title}
          </h1>
        </Link>
        <div className="flex items-center">
          <img
            src={
              author.profileImage ??
              `https://gravatar.com/avatar/${author._id}?d=identicon`
            }
            className="w-8 h-8 rounded-full mr-3"
            alt={author.nickname}
          />
          <div className="text-white">
            <p className="text-sm font-medium">{author.nickname}</p>
            <div className="flex items-center text-xs text-gray-300">
              <CalendarDays className="h-3 w-3 mr-1" aria-hidden="true" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
