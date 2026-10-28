import { api } from "./client";
import type {
  Comment,
  Post,
  PostInput,
  PostListParams,
  PostOverview,
} from "../types/post";

// 조회 함수의 signal은 useFetch의 요청 취소에 사용한다
export async function fetchPosts(
  params: PostListParams = {},
  signal?: AbortSignal
): Promise<Post[]> {
  const { data } = await api.get<Post[]>("/posts", { params, signal });
  return data;
}

export async function fetchOverview(signal?: AbortSignal): Promise<PostOverview> {
  const { data } = await api.get<PostOverview>("/posts/overview", { signal });
  return data;
}

// 호출마다 서버의 viewCount가 1 증가한다
export async function fetchPost(id: string, signal?: AbortSignal): Promise<Post> {
  const { data } = await api.get<Post>(`/posts/${id}`, { signal });
  return data;
}

// 작성·수정 응답의 author는 populate되지 않은 ID 문자열이라 _id만 사용한다
export async function createPost(input: PostInput): Promise<{ _id: string }> {
  const { data } = await api.post<{ _id: string }>("/posts", input);
  return data;
}

export async function updatePost(
  id: string,
  input: PostInput
): Promise<{ _id: string }> {
  const { data } = await api.put<{ _id: string }>(`/posts/${id}`, input);
  return data;
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`);
}

export async function createComment(
  postId: string,
  content: string
): Promise<Comment> {
  const { data } = await api.post<Comment>(`/posts/${postId}/comments`, {
    content,
  });
  return data;
}

export async function deleteComment(
  postId: string,
  commentId: string
): Promise<void> {
  await api.delete(`/posts/${postId}/comments/${commentId}`);
}
