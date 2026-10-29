import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex rounded-full bg-blue-100 p-6 dark:bg-blue-900/20">
          <FileQuestion className="h-12 w-12 text-blue-500 dark:text-blue-400" />
        </div>
        <h1 className="mb-4 text-6xl font-bold text-gray-900 dark:text-white">
          404
        </h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button className="rounded-lg bg-gray-200 px-6 py-3 text-gray-900 transition-colors hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
            Go Back
          </button>
          <button className="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
