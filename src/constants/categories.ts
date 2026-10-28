// 백엔드 시드 카테고리와 동일해야 한다
export const categories = [
  "Technology",
  "Lifestyle",
  "Travel",
  "Business",
  "Economy",
  "Sports",
] as const;

export type Category = (typeof categories)[number];
