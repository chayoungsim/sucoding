import { useParams } from "react-router";
import PostForm from "../../../components/post/PostForm";

export default function PostCreate() {
  const { id } = useParams();

  // /create-post와 /edit/:id가 같은 페이지를 쓰므로, key로 경로가 바뀔 때 폼 상태를 초기화한다
  return <PostForm key={id ?? "new"} id={id} />;
}
