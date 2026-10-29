import { Link } from "react-router";
import { FileX, PenSquare } from "lucide-react";

export default function MyPostsZero() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-slate-800 px-4 py-16">
      <div className="mb-6 rounded-full bg-slate-700 p-6">
        <FileX className="h-12 w-12 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-center text-2xl font-bold text-white">
        You haven't written any posts yet
      </h3>
      <p className="mb-6 max-w-md text-center text-gray-400">
        Share your first story with the community.
      </p>
      <Link
        to="/create-post"
        className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <PenSquare className="h-4 w-4" aria-hidden="true" />
        Write your first post
      </Link>
    </div>
  );
}
