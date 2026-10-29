import { Loader2 } from "lucide-react";

export default function Redirection() {
  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-500" />
        <h2 className="text-xl font-semibold text-white">리다이렉션 중...</h2>
      </div>
    </>
  );
}
