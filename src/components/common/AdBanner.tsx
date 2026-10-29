type AdBannerProps = {
  size?: "small" | "large";
};
export default function AdBanner({ size = "large" }: AdBannerProps) {
  return (
    <div
      className={`flex w-full items-center justify-center rounded-lg bg-slate-800 ${
        size === "large" ? "h-24" : "h-16"
      }`}
    >
      <p className="text-sm text-gray-400">Advertisement</p>
      <p className="pl-2 text-xs text-gray-500">
        You can place ads {size === "large" ? "728x90" : "300x50"}
      </p>
    </div>
  );
}
