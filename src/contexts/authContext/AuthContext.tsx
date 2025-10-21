import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "./useAuth";
import { identityPoolId, poolData, region } from "../../config/cognito";
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import AWS from "aws-sdk";
import { jwtDecode } from "jwt-decode";

export type UserRole = "Admin" | "User" | "Guest";
export type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string, from?: string) => Promise<void>;
  logout: () => void;
  tokenRefresh: () => Promise<void>;
  userId: string | null;
  userRole: UserRole | null;
};
const userPool = new CognitoUserPool(poolData);

const prefix = `CognitoIdentityServiceProvider.${poolData.ClientId}`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
      // AWS 認証情報を初期化して identityId を取得
      initAWSCredentials(token).then(({ id, role }) => {
        setUserId(id);
        setUserRole(role);
      });
    }
  }, []);

  const initAWSCredentials = async (idToken: string): Promise<{ id: string | null; role: UserRole }> => {
    try {
      AWS.config.region = region;
      // id poolに紐付けられたIAMロールを引き受ける
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: identityPoolId,
        Logins: {
          [`cognito-idp.${region}.amazonaws.com/${poolData.UserPoolId}`]: idToken,
        },
      });

      const credentials = AWS.config.credentials as AWS.CognitoIdentityCredentials;
      console.log(credentials);
      await credentials.getPromise();

      // IDトークンから role を取得
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = jwtDecode<Record<string, any>>(idToken);
      const groups = payload["cognito:groups"] as string[] | undefined;
      const role = (groups?.[0] as UserRole) || "Guest";

      return { id: credentials.identityId || null, role };
    } catch (error) {
      console.error(error);
      return { id: null, role: "Guest" };
    }
  };

  const login = async (email: string, password: string, from = "/home") => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    await new Promise<void>((resolve, reject) => {
      user.authenticateUser(authDetails, {
        onSuccess: async (session) => {
          const idToken = session.getIdToken().getJwtToken();
          localStorage.setItem("accessToken", idToken);
          setIsAuthenticated(true);

          const { id, role } = await initAWSCredentials(idToken);
          setUserId(id);
          setUserRole(role);
          navigate(from, { replace: true });
          resolve();
        },
        onFailure: (err) => reject(err),
      });
    });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    setUserId(null);
    setUserRole(null);
    AWS.config.credentials = undefined;
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
    userId,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
