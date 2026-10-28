import type { Category } from "../constants/categories";

// populate("author", "nickname profileImage") 결과 (_id는 자동 포함)
export type PostAuthor = {
  _id: string;
  nickname: string;
  profileImage?: string;
};

export type Comment = {
  _id: string;
  author: PostAuthor;
  content: string;
  createdAt: string;
};

// GET /posts, GET /posts/:id, randomPost 응답 형태 (comments.author까지 populate됨)
export type Post = {
  _id: string;
  title: string;
  category: Category;
  thumbnail: string;
  content: string;
  createdAt: string;
  viewCount: number;
  author: PostAuthor;
  comments: Comment[];
};

// latestPosts, popularPosts 응답 형태 (comments.author가 populate되지 않아 댓글 목록은 쓰지 않는다)
export type PostSummary = Omit<Post, "comments">;

// POST /posts, PUT /posts/:id 요청 본문
export type PostInput = {
  title: string;
  category: Category;
  thumbnail: string;
  content: string;
};

// GET /posts 쿼리
export type PostListParams = {
  sort?: "newest" | "views";
  category?: Category;
  page?: number;
  perPage?: number;
};

// GET /posts/overview 응답 (게시글이 하나도 없으면 randomPost는 null)
export type PostOverview = {
  randomPost: Post | null;
  latestPosts: PostSummary[];
  popularPosts: PostSummary[];
};
