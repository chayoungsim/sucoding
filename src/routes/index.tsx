import { createBrowserRouter, RouterProvider } from "react-router";

import Default from "./layouts/Default";
import Kakao from "./pages/auth/callback/Kakao";
import EmailLogin from "./pages/auth/EmailLogin";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Home from "./pages/Home";
import MyPage from "./pages/mypage/MyPage";
import NotFoundPage from "./pages/NotFound";
import PostCreate from "./pages/posts/PostCreate";
import PostRead from "./pages/posts/PostRead";
import Posts from "./pages/posts/Posts";
import RequireAuth from "./RequireAuth";

const router = createBrowserRouter([
  {
    Component: Default,
    children: [
      {
        path: "",
        Component: Home,
      },
      {
        path: "/posts",
        Component: Posts,
      },
      {
        // 로그인한 사용자만 접근할 수 있는 라우트
        Component: RequireAuth,
        children: [
          {
            path: "/create-post",
            Component: PostCreate,
          },
          {
            path: "/edit/:id",
            Component: PostCreate,
          },
          {
            path: "/mypage",
            Component: MyPage,
          },
        ],
      },
      {
        path: "/post/:id",
        Component: PostRead,
      },
      {
        path: "/auth/login",
        Component: Login,
      },
      {
        path: "/auth/email-login",
        Component: EmailLogin,
      },
      {
        path: "/auth/signup",
        Component: Signup,
      },
      {
        path: "/auth/callback/kakao",
        Component: Kakao,
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);

export default function Route() {
  return <RouterProvider router={router} />;
}
