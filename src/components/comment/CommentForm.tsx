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
          className="w-10 h-10 rounded-full"
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
            className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            rows={3}
            required
          />
          {error && (
            <p role="alert" className="text-red-500 text-sm mt-2">
              {error}
            </p>
          )}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              Comment
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
