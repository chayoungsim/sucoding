import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import Default from "./layouts/Default";
import RequireAuth from "./RequireAuth";
import PostCreate from "./pages/posts/PostCreate";
import Login from "./pages/auth/Login";
import Posts from "./pages/posts/Posts";
import PostRead from "./pages/posts/PostRead";
import NotFoundPage from "./pages/NotFound";
import Kakao from "./pages/auth/callback/Kakao";
import Signup from "./pages/auth/Signup";
import EmailLogin from "./pages/auth/EmailLogin";

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
