export default function FullLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900">
      <div className="relative inline-flex">
        <div className="h-8 w-8 rounded-full bg-blue-500"></div>
        <div className="absolute top-0 left-0 h-8 w-8 animate-ping rounded-full bg-blue-500"></div>
        <div className="absolute top-0 left-0 h-8 w-8 animate-pulse rounded-full bg-blue-500"></div>
      </div>
    </div>
  );
}
