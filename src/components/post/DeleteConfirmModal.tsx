import { useEffect, useRef, type KeyboardEvent } from "react";

type DeleteConfirmModalProps = {
  isDeleting: boolean;
  error: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteConfirmModal({
  isDeleting,
  error,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // 열릴 때 취소 버튼으로 포커스를 옮기고, 닫히면 원래 있던 요소로 되돌린다
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => previous?.focus();
  }, []);

  // 삭제 중에 버튼이 비활성화되어 포커스를 잃어도 Esc가 동작하도록 document에서 받는다
  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isDeleting, onCancel]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Tab 포커스가 모달 밖으로 나가지 않도록 두 버튼 사이에서만 순환시킨다
    if (event.key === "Tab") {
      const first = cancelRef.current;
      const last = confirmRef.current;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deleteDialogTitle"
        aria-describedby="deleteDialogDesc"
        className="mx-4 w-full max-w-md rounded-lg bg-slate-800 p-6"
      >
        <h3
          id="deleteDialogTitle"
          className="mb-4 text-xl font-bold text-white"
        >
          Delete Post
        </h3>
        <p id="deleteDialogDesc" className="mb-6 text-gray-300">
          Are you sure you want to delete this post? This action cannot be
          undone.
        </p>
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-500">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-4">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
