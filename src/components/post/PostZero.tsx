import { FileX, RefreshCw } from "lucide-react";

type PostZeroProps = {
  selectedCategory: string;
  // 검색 결과가 없을 때 검색어와 검색 해제 동작을 넘긴다
  searchQuery?: string;
  onClearSearch?: () => void;
  onShowAll?: () => void;
};

export default function PostZero({
  selectedCategory,
  searchQuery = "",
  onClearSearch,
  onShowAll,
}: PostZeroProps) {
  const isSearching = searchQuery !== "";

  const renderTitle = () => {
    if (isSearching) return `No results for "${searchQuery}"`;
    return selectedCategory === ""
      ? "No posts found"
      : `No posts in ${selectedCategory}`;
  };

  const renderMessage = () => {
    if (isSearching) {
      return selectedCategory === ""
        ? "We couldn't find any posts matching your search."
        : `We couldn't find any posts matching your search in "${selectedCategory}".`;
    }
    return selectedCategory === ""
      ? "There are no blog posts available at the moment."
      : `We couldn't find any posts in the "${selectedCategory}" category.`;
  };

  const renderAction = () => {
    if (isSearching) {
      return { label: "Clear search", onClick: onClearSearch };
    }
    if (selectedCategory !== "") {
      return { label: "Show all posts", onClick: onShowAll };
    }
    return { label: "Refresh page", onClick: () => window.location.reload() };
  };
  const action = renderAction();

  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-slate-800 px-4 py-16">
      <div className="mb-6 rounded-full bg-slate-700 p-6">
        <FileX className="h-12 w-12 text-gray-400" aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-center text-2xl font-bold break-all text-white">
        {renderTitle()}
      </h2>
      <p className="mb-6 max-w-md text-center text-gray-400">
        {renderMessage()}
      </p>
      <button
        type="button"
        onClick={action.onClick}
        className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        {action.label}
      </button>
    </div>
  );
}
