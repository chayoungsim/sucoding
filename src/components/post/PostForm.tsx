import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router";
import { isAxiosError } from "axios";
import { ImagePlus, X } from "lucide-react";
import { createPost, fetchPost, updatePost } from "../../api/posts";
import ErrorState from "../common/ErrorState";
import FullLoading from "../common/FullLoading";
import { categories, type Category } from "../../constants/categories";
import { useAuthStore } from "../../stores/authStore";
import type { Post } from "../../types/post";
import { getPostErrorMessage } from "../../utils/getPostErrorMessage";
import { readImageFile } from "../../utils/readImageFile";

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
        setFailure({ status: isAxiosError(err) ? err.response?.status : undefined });
      });
  }, [id, reloadKey]);

  const retry = () => {
    setFailure(null);
    setReloadKey((key) => key + 1);
  };

  if (id) {
    if (failure?.status === 404) {
      return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You can only edit your own posts.
          </p>
          <Link
            to={`/post/${original._id}`}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        {id ? "Edit Post" : "Write New Post"}
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg"
        >
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter post title"
            required
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            className="block text-sm font-medium text-gray-300 mb-2"
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
            <div className="relative w-full aspect-video">
              <img
                src={thumbnail}
                alt="Featured image preview"
                onError={() => setFailedImageUrl(thumbnail)}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                aria-label="Remove image"
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="thumbnail"
              className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-gray-400 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500"
            >
              <ImagePlus
                className="h-12 w-12 text-gray-400 mb-3"
                aria-hidden="true"
              />
              <span className="text-gray-300">
                {failedImageUrl === thumbnail && thumbnail
                  ? "Could not load this image. Click to choose another"
                  : "Click to upload image"}
              </span>
              <span id="thumbnailHint" className="text-gray-500 text-sm mt-1">
                JPG, PNG, or WebP up to 10MB
              </span>
            </label>
          )}

          {isProcessingImage && (
            <p role="status" className="text-gray-400 text-sm mt-2">
              Processing image...
            </p>
          )}
          {imageError && (
            <p role="alert" className="text-red-500 text-sm mt-2">
              {imageError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full h-96 bg-slate-800 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Write your post content here..."
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || isProcessingImage}
            className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {id ? "Save Changes" : "Publish Post"}
          </button>
          <button
            type="button"
            onClick={() => navigate(id ? `/post/${id}` : "/posts")}
            className="px-6 py-2.5 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
