import type { Post } from "../types/post";

// 제목과 본문에 검색어가 포함된 글만 남긴다 (대소문자 무시, 정규식을 쓰지 않아 특수문자도 그대로 비교)
export function filterPostsByQuery(posts: Post[], query: string): Post[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return posts;

  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(keyword) ||
      post.content.toLowerCase().includes(keyword)
  );
}
