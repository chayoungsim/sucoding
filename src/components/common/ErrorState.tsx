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
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-6 mb-6">
        <AlertCircle
          className="w-12 h-12 text-red-500 dark:text-red-400"
          aria-hidden="true"
        />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        {title}
      </h2>
      <p className="text-gray-400 text-center mb-6 max-w-md whitespace-pre-wrap">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
