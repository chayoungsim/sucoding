// GET /auth/me 응답 형태
export type User = {
  id: string;
  kakaoId?: string;
  email?: string;
  nickname: string;
  profileImage?: string;
};
