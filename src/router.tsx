import { Navigate } from "react-router";
import { createBrowserRouter } from "react-router";
import SignUp from "./pages/SignUp";
import VerifyCode from "./pages/VerifyCode";
import Login from "./pages/Login";
import UserHome from "./pages/UserHome";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/authContext/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import ForgetPassword from "./pages/FogetPassword";
import ConfirmPassword from "./pages/ConfirmPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <Layout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <Navigate to="/signup" /> },
      { path: "signup", element: <SignUp /> },
      { path: "verify", element: <VerifyCode /> },
      { path: "login", element: <Login /> },
      { path: "password-forget", element: <ForgetPassword /> },
      { path: "confirm-password", element: <ConfirmPassword /> },
      {
        path: "home",
        element: (
          <PrivateRoute>
            <UserHome />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
