import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { isAxiosError } from "axios";
import { CalendarDays, Trash2, Pencil, Eye } from "lucide-react";
import {
  createComment,
  deleteComment,
  deletePost,
  fetchPost,
  fetchPosts,
} from "../../../api/posts";
import AdBanner from "../../../components/common/AdBanner";
import ErrorState from "../../../components/common/ErrorState";
import FullLoading from "../../../components/common/FullLoading";
import DeleteConfirmModal from "../../../components/post/DeleteConfirmModal";
import PostGrid from "../../../components/post/PostGrid";
import CommentForm from "../../../components/comment/CommentForm";
import CommentComponent from "../../../components/comment/CommentComponent";
import { useFetch } from "../../../hooks/useFetch";
import { useAuthStore } from "../../../stores/authStore";
import type { Comment, Post } from "../../../types/post";
import { formatDate } from "../../../utils/formatDate";
import { getPostErrorMessage } from "../../../utils/getPostErrorMessage";

type Failure = { id: string; status?: number };

export default function PostRead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [post, setPost] = useState<Post | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentError, setCommentError] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  // 조회수는 요청마다 오르므로, StrictMode에서 effect가 두 번 실행되어도 같은 글은 한 번만 요청한다
  const requested = useRef("");

  useEffect(() => {
    if (!id) return;
    const key = `${id}:${reloadKey}`;
    if (requested.current === key) return;
    requested.current = key;

    fetchPost(id)
      .then((data) => {
        if (requested.current !== key) return;
        setPost(data);
        // 서버는 오래된 댓글부터 주므로 뒤집어서 최신 댓글을 위에 둔다
        setComments([...data.comments].reverse());
        setFailure(null);
      })
      .catch((err) => {
        if (requested.current !== key) return;
        setFailure({
          id,
          status: isAxiosError(err) ? err.response?.status : undefined,
        });
      });
  }, [id, reloadKey]);

  // 연관 글: 같은 카테고리의 최신 글 4개를 받아 현재 글을 빼고 3개만 쓴다
  const category = post?.category;
  const relatedFetcher = useCallback(
    (signal: AbortSignal) =>
      category
        ? fetchPosts({ category, sort: "newest", perPage: 4 }, signal)
        : Promise.resolve([]),
    [category]
  );
  const { data: relatedData } = useFetch(relatedFetcher);

  const currentFailure = failure?.id === id ? failure : null;
  const isLoading = !currentFailure && post?._id !== id;

  const retry = () => {
    setFailure(null);
    setReloadKey((key) => key + 1);
  };

  if (!id || currentFailure?.status === 404) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
        <p className="text-gray-400">
          The post you're looking for doesn't exist.
        </p>
      </div>
    );
  }
  if (currentFailure) return <ErrorState onRetry={retry} />;
  if (isLoading || !post) return <FullLoading />;

  const isAuthor = !!user && post.author._id === user.id;

  // 최신 댓글이 위로 오도록 목록 맨 앞에 추가한다
  const handleCreateComment = async (content: string) => {
    const created = await createComment(post._id, content);
    setComments((prev) => [created, ...prev]);
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentError("");
    setDeletingCommentId(commentId);
    try {
      await deleteComment(post._id, commentId);
      setComments((prev) => prev.filter((item) => item._id !== commentId));
    } catch (err) {
      setCommentError(getPostErrorMessage(err));
    } finally {
      setDeletingCommentId("");
    }
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeleteError("");
  };

  const handleDelete = async () => {
    setDeleteError("");
    setIsDeleting(true);
    try {
      await deletePost(post._id);
      navigate("/posts", { replace: true });
    } catch (err) {
      setDeleteError(getPostErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };
  const relatedPosts = (relatedData ?? [])
    .filter((item) => item._id !== post._id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <span className="inline-block bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-md">
            {post.category}
          </span>
          {isAuthor && (
            <div className="flex gap-2">
              <Link
                to={`/edit/${post._id}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Pencil className="w-4 h-4" aria-hidden="true" />
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                Delete
              </button>
            </div>
          )}
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center">
            <img
              src={
                post.author.profileImage ??
                `https://gravatar.com/avatar/${post.author._id}?d=identicon`
              }
              alt={post.author.nickname}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="text-white font-medium">{post.author.nickname}</p>
              <div className="flex items-center text-sm text-gray-400">
                <CalendarDays className="h-4 w-4 mr-1" aria-hidden="true" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
            <span>{post.viewCount}</span>
          </div>
        </div>

        <div className="mb-8">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-lg"
          />
        </div>

        {/* 본문은 일반 문자열이므로 HTML로 해석하지 않고 텍스트로만 출력한다 */}
        <div className="max-w-none mb-12 text-white text-lg whitespace-pre-line break-words">
          {post.content}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <DeleteConfirmModal
            isDeleting={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
            onCancel={closeDeleteConfirm}
          />
        )}

        {/* Comments Section */}
        <div className="border-t border-slate-700 pt-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-8">
            Comments ({comments.length})
          </h2>

          {user ? (
            <CommentForm onSubmit={handleCreateComment} />
          ) : (
            <p className="text-gray-400">
              <Link
                to="/auth/login"
                className="text-blue-400 hover:text-blue-300"
              >
                Sign in
              </Link>{" "}
              to leave a comment.
            </p>
          )}

          {commentError && (
            <p role="alert" className="text-red-500 text-sm mt-4">
              {commentError}
            </p>
          )}

          <div className="mt-8 space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-400">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <CommentComponent
                  key={comment._id}
                  comment={comment}
                  canDelete={!!user && comment.author._id === user.id}
                  isDeleting={deletingCommentId === comment._id}
                  onDelete={() => handleDeleteComment(comment._id)}
                />
              ))
            )}
          </div>
        </div>

        <div className="my-12">
          <AdBanner />
        </div>

        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <PostGrid title="Related Posts" posts={relatedPosts} />
          </div>
        )}
      </div>
    </div>
  );
}
