import ProfileCard from "../../../components/mypage/ProfileCard";
import { useAuthStore } from "../../../stores/authStore";

export default function MyPage() {
  const user = useAuthStore((state) => state.user);

  // RequireAuth가 로그인 여부를 보장하지만 타입상 null을 걸러준다
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Page</h1>
      <ProfileCard user={user} />
    </div>
  );
}
