import { Navigate } from "react-router";
import { createBrowserRouter } from "react-router";
import SignUp from "./pages/SignUp";
import VerifyCode from "./pages/VerifyCode";
import Login from "./pages/Login";
import UserHome from "./pages/UserHome";
import Layout from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/signup" /> },
      { path: "signup", element: <SignUp /> },
      { path: "verify", element: <VerifyCode /> },
      { path: "login", element: <Login /> },
      { path: "home", element: <UserHome /> },
    ],
  },
]);
