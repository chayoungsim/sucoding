import { FileX, RefreshCw } from "lucide-react";

type PostMainZeroProps = {
  title?: string;
};

export default function PostMainZero({
  title = "Latest Post",
}: PostMainZeroProps) {
  return (
    <section className="py-10">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg bg-slate-800 px-4 py-16">
        <div className="mb-6 rounded-full bg-slate-700 p-6">
          <FileX className="h-12 w-12 text-gray-400" aria-hidden="true" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">No posts found</h3>
        <p className="mb-6 max-w-md text-center text-gray-400">
          There are no blog posts available at the moment.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh page
        </button>
      </div>
    </section>
  );
}
