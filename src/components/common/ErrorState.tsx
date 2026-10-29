import { AlertCircle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading the content. \nPlease try again later.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center px-4 py-16"
    >
      <div className="mb-6 rounded-full bg-red-100 p-6 dark:bg-red-900/20">
        <AlertCircle
          className="h-12 w-12 text-red-500 dark:text-red-400"
          aria-hidden="true"
        />
      </div>
      <h2 className="mb-2 text-center text-2xl font-bold text-white">
        {title}
      </h2>
      <p className="mb-6 max-w-md text-center whitespace-pre-wrap text-gray-400">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
        >
          Try again
        </button>
      )}
    </div>
  );
}
