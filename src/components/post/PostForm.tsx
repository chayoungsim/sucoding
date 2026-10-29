import { isAxiosError } from "axios";
import { ImagePlus, X } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router";

import { createPost, fetchPost, updatePost } from "../../api/posts";
import { categories, type Category } from "../../constants/categories";
import { useAuthStore } from "../../stores/authStore";
import type { Post } from "../../types/post";
import { getPostErrorMessage } from "../../utils/getPostErrorMessage";
import { readImageFile } from "../../utils/readImageFile";
import ErrorState from "../common/ErrorState";
import FullLoading from "../common/FullLoading";

type PostFormProps = {
  // 있으면 수정 모드, 없으면 작성 모드
  id?: string;
};

type Failure = { status?: number };

export default function PostForm({ id }: PostFormProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(categories[0]);
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  const [failedImageUrl, setFailedImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 수정 모드: 기존 글 로드 상태
  const [original, setOriginal] = useState<Post | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // 글 조회는 조회수를 올리므로, StrictMode에서 effect가 두 번 실행되어도 한 번만 요청한다
  const requested = useRef("");

  useEffect(() => {
    if (!id) return;
    const key = `${id}:${reloadKey}`;
    if (requested.current === key) return;
    requested.current = key;

    fetchPost(id)
      .then((data) => {
        setOriginal(data);
        setTitle(data.title);
        setCategory(data.category);
        setThumbnail(data.thumbnail);
        setContent(data.content);
        setFailure(null);
      })
      .catch((err) => {
        setFailure({
          status: isAxiosError(err) ? err.response?.status : undefined,
        });
      });
  }, [id, reloadKey]);

  const retry = () => {
    setFailure(null);
    setReloadKey((key) => key + 1);
  };

  if (id) {
    if (failure?.status === 404) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-20 text-center md:px-8">
          <h1 className="mb-4 text-3xl font-bold text-white">Post Not Found</h1>
          <p className="text-gray-400">
            The post you're looking for doesn't exist.
          </p>
        </div>
      );
    }
    if (failure) return <ErrorState onRetry={retry} />;
    if (!original) return <FullLoading />;

    // 작성자 본인만 수정할 수 있다
    if (!user || original.author._id !== user.id) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-20 text-center md:px-8">
          <h1 className="mb-4 text-3xl font-bold text-white">Access Denied</h1>
          <p className="mb-6 text-gray-400">
            You can only edit your own posts.
          </p>
          <Link
            to={`/post/${original._id}`}
            className="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
          >
            Back to post
          </Link>
        </div>
      );
    }
  }

  // 기존 주소가 깨졌거나 아직 고르지 않았다면 미리보기 대신 선택 박스를 보여준다
  const showPreview = !!thumbnail && failedImageUrl !== thumbnail;

  // 선택한 파일을 FileReader로 읽고 서버 제한에 맞게 줄여서 썸네일로 쓴다
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 값을 비운다
    event.target.value = "";
    if (!file) return;

    setImageError("");
    setIsProcessingImage(true);
    try {
      setThumbnail(await readImageFile(file));
      // 이미지를 골랐으니 "이미지를 선택하세요" 에러는 지운다
      setError("");
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Could not read this image"
      );
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setThumbnail("");
    setImageError("");
    fileInputRef.current?.focus();
  };

  const handleCategoryChange = (value: string) => {
    const next = categories.find((item) => item === value);
    if (next) setCategory(next);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    if (!thumbnail) {
      setError("Please select an image");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const input = { title: title.trim(), category, thumbnail, content };
      const saved = id ? await updatePost(id, input) : await createPost(input);
      navigate(`/post/${saved._id}`);
    } catch (err) {
      setError(getPostErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <h1 className="mb-8 text-3xl font-bold text-white">
        {id ? "Edit Post" : "Write New Post"}
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-3"
        >
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter post title"
            required
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span
            id="thumbnailTitle"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Featured Image
          </span>

          {/* 파일 input은 화면에서만 숨기고, 아래 label 박스가 클릭·포커스 표시를 맡는다 */}
          <input
            ref={fileInputRef}
            type="file"
            id="thumbnail"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            aria-labelledby="thumbnailTitle"
            aria-describedby="thumbnailHint"
            tabIndex={showPreview ? -1 : 0}
            className="peer sr-only"
          />

          {showPreview ? (
            <div className="relative aspect-video w-full">
              <img
                src={thumbnail}
                alt="Featured thumbnail preview"
                onError={() => setFailedImageUrl(thumbnail)}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                aria-label="Remove image"
                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="thumbnail"
              className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 text-center peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 hover:border-gray-400"
            >
              <ImagePlus
                className="mb-3 h-12 w-12 text-gray-400"
                aria-hidden="true"
              />
              <span className="text-gray-300">
                {failedImageUrl === thumbnail && thumbnail
                  ? "Could not load this image. Click to choose another"
                  : "Click to upload image"}
              </span>
              <span id="thumbnailHint" className="mt-1 text-sm text-gray-500">
                JPG, PNG, or WebP up to 10MB
              </span>
            </label>
          )}

          {isProcessingImage && (
            <p role="status" className="mt-2 text-sm text-gray-400">
              Processing image...
            </p>
          )}
          {imageError && (
            <p role="alert" className="mt-2 text-sm text-red-500">
              {imageError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="content"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="h-96 w-full rounded-lg bg-slate-800 px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Write your post content here..."
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || isProcessingImage}
            className="rounded-lg bg-blue-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            {id ? "Save Changes" : "Publish Post"}
          </button>
          <button
            type="button"
            onClick={() => navigate(id ? `/post/${id}` : "/posts")}
            className="rounded-lg bg-slate-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-slate-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
