import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "./useAuth";
import { poolData } from "../../config/cognito";
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";

export type AuthContextType = {
  isAuthenticated: boolean;
  login: (newToken: string, from: string) => void;
  logout: () => void;
  tokenRefresh: () => Promise<void>;
};
const userPool = new CognitoUserPool(poolData);

const prefix = `CognitoIdentityServiceProvider.${poolData.ClientId}`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  const login = (newToken: string, from: string) => {
    localStorage.setItem("accessToken", newToken);
    setIsAuthenticated(true);
    navigate(from, { replace: true });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const tokenRefresh = async () => {
    const username = localStorage.getItem(`${prefix}.LastAuthUser`);
    const storedRefreshToken = localStorage.getItem(`${prefix}.${username}.refreshToken`);

    if (!username || !storedRefreshToken) throw new Error("No refresh token or username");

    return new Promise<void>((resolve, reject) => {
      const user = new CognitoUser({ Username: username, Pool: userPool });
      const refreshTokenObj = user.getSignInUserSession()?.getRefreshToken() || { getToken: () => storedRefreshToken };

      user.refreshSession(refreshTokenObj, (err, session) => {
        if (err) return reject(err);

        const newAccessToken = session.getAccessToken().getJwtToken();
        localStorage.setItem("accessToken", newAccessToken);
        setIsAuthenticated(true);
        resolve();
      });
    });
  };

  const value: AuthContextType = {
    isAuthenticated,
    login,
    logout,
    tokenRefresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
