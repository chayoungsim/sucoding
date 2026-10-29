import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { getPostErrorMessage } from "../../utils/getPostErrorMessage";

type CommentFormProps = {
  // 실패하면 reject해야 폼이 에러를 보여주고 입력값을 유지한다
  onSubmit: (content: string) => Promise<void>;
};

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const user = useAuthStore((state) => state.user);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) {
      setError("Please write a comment");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (err) {
      setError(getPostErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mt-4" onSubmit={handleSubmit}>
      <div className="flex gap-4">
        <img
          src={
            user?.profileImage ??
            `https://gravatar.com/avatar/${user?.id ?? "default"}?d=identicon`
          }
          alt=""
          className="h-10 w-10 rounded-full"
        />
        <div className="flex-1">
          <label htmlFor="comment" className="sr-only">
            Comment
          </label>
          <textarea
            id="comment"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={"Write a comment..."}
            className="w-full resize-none rounded-lg bg-slate-800 px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={3}
            required
          />
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-500">
              {error}
            </p>
          )}
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Comment
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
