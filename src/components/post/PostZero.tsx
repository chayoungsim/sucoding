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
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-800 rounded-lg">
      <div className="bg-slate-700 rounded-full p-6 mb-6">
        <FileX className="w-12 h-12 text-gray-400" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 text-center break-all">
        {renderTitle()}
      </h2>
      <p className="text-gray-400 text-center mb-6 max-w-md">
        {renderMessage()}
      </p>
      <button
        type="button"
        onClick={action.onClick}
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        {action.label}
      </button>
    </div>
  );
}
