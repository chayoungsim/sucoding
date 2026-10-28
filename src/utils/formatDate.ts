// ISO 문자열을 "Oct 28, 2026" 형태로 변환한다. 잘못된 값이면 빈 문자열을 반환한다
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
