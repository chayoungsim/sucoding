import { Link } from "react-router";
import { FileX, PenSquare } from "lucide-react";

export default function MyPostsZero() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-800 rounded-lg">
      <div className="bg-slate-700 rounded-full p-6 mb-6">
        <FileX className="w-12 h-12 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2 text-center">
        You haven't written any posts yet
      </h3>
      <p className="text-gray-400 text-center mb-6 max-w-md">
        Share your first story with the community.
      </p>
      <Link
        to="/create-post"
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <PenSquare className="w-4 h-4" aria-hidden="true" />
        Write your first post
      </Link>
    </div>
  );
}
