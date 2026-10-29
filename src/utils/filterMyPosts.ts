import type { Post } from "../types/post";

// 작성자가 userId인 글만 남긴다 (백엔드에 작성자 필터가 없어 클라이언트에서 거른다)
export function filterMyPosts(posts: Post[], userId: string): Post[] {
  return posts.filter((post) => post.author._id === userId);
}
