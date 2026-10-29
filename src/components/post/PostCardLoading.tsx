export default function PostCardLoading() {
  return (
    <>
      <div className="animate-pulse overflow-hidden rounded-lg bg-gray-200 shadow-lg transition-transform duration-300">
        <div className="relative block aspect-video w-full overflow-hidden"></div>
        <div className="absolute top-0 left-0 mt-2 ml-2 h-10 w-10 rounded-full"></div>
        <div className="space-y-2 p-4">
          <div className="h-5.5 rounded bg-gray-300"></div>
          <div className="h-5.5 rounded bg-gray-300"></div>
          <div className="flex w-full space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-gray-300"></div>
              <div className="h-4 w-25 rounded bg-gray-300"></div>
            </div>
            <div className="flex grow-1 items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-gray-300"></div>
              <div className="h-4 w-1/4 rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
