import { Trash } from "lucide-react";
import type { Comment } from "../../types/post";
import { formatDate } from "../../utils/formatDate";

type CommentComponentProps = {
  comment: Comment;
  // 본인 댓글에만 삭제 버튼을 보여준다
  canDelete: boolean;
  isDeleting?: boolean;
  onDelete: () => void;
};

export default function CommentComponent({
  comment,
  canDelete,
  isDeleting = false,
  onDelete,
}: CommentComponentProps) {
  const { author } = comment;

  return (
    <div className="mb-6">
      <div className="flex gap-4">
        <img
          alt=""
          className="w-10 h-10 rounded-full"
          src={
            author.profileImage ??
            `https://gravatar.com/avatar/${author._id}?d=identicon`
          }
        />
        <div className="flex-1">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{author.nickname}</span>
              <span className="text-sm text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-gray-300 whitespace-pre-line break-words">
              {comment.content}
            </p>
          </div>
          {canDelete && (
            <div className="flex items-center gap-4 mt-2">
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                aria-label={`Delete comment by ${author.nickname}`}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50"
              >
                <Trash className="w-4 h-4" aria-hidden="true" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
