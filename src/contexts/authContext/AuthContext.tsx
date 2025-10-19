import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "./useAuth";

export type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  login: (newToken: string, from: string) => void;
  logout: () => void;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) setToken(storedToken);
  }, []);

  const login = (newToken: string, from: string) => {
    localStorage.setItem("accessToken", newToken);
    setToken(newToken);
    navigate(from, { replace: true });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    navigate("/login");
  };

  const value: AuthContextType = {
    isAuthenticated: !!token,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
