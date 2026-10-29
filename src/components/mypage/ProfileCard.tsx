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
      className="flex flex-col gap-6 rounded-lg bg-slate-800 p-6 md:flex-row md:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={`${user.nickname} profile`}
            className="h-20 w-20 shrink-0 rounded-full border-2 border-blue-500 object-cover"
          />
        ) : (
          // 프로필 이미지가 없으면 닉네임 첫 글자로 대체 (장식용이라 스크린리더에서는 제외)
          <div
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-slate-700 text-3xl font-bold text-white"
          >
            {user.nickname.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h2
            id="profileHeading"
            className="text-xl font-bold break-words text-white"
          >
            {user.nickname}
          </h2>
          <p className="text-sm break-all text-gray-400">
            {user.email ?? "No email registered"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Signed in with {loginMethod}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-center md:gap-8">
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
