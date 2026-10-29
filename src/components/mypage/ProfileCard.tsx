import type { User } from "../../types/user";

type ProfileCardProps = {
  user: User;
  // 내 글을 조회하기 전에는 undefined (화면에는 "-"로 표시)
  postCount?: number;
  totalViews?: number;
};

export default function ProfileCard({
  user,
  postCount,
  totalViews,
}: ProfileCardProps) {
  const loginMethod = user.kakaoId ? "Kakao" : "Email";

  // 값이 아직 없으면 "-"를 보여주고, 스크린리더에는 값이 없다는 뜻을 따로 읽어준다
  const renderStat = (value?: number) =>
    value ?? (
      <>
        <span aria-hidden="true">-</span>
        <span className="sr-only">Not available</span>
      </>
    );

  return (
    <section
      aria-labelledby="profileHeading"
      className="bg-slate-800 rounded-lg p-6 flex flex-col md:flex-row md:items-center gap-6"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={`${user.nickname} profile`}
            className="w-20 h-20 rounded-full border-2 border-blue-500 object-cover shrink-0"
          />
        ) : (
          // 프로필 이미지가 없으면 닉네임 첫 글자로 대체 (장식용이라 스크린리더에서는 제외)
          <div
            aria-hidden="true"
            className="w-20 h-20 rounded-full border-2 border-blue-500 bg-slate-700 text-white text-3xl font-bold flex items-center justify-center shrink-0"
          >
            {user.nickname.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h2
            id="profileHeading"
            className="text-xl font-bold text-white break-words"
          >
            {user.nickname}
          </h2>
          <p className="text-sm text-gray-400 break-all">
            {user.email ?? "No email registered"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Signed in with {loginMethod}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 md:gap-8 text-center">
        <div>
          <dt className="text-sm text-gray-400">Posts</dt>
          <dd className="text-2xl font-bold text-white">
            {renderStat(postCount)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-400">Total views</dt>
          <dd className="text-2xl font-bold text-white">
            {renderStat(totalViews)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
