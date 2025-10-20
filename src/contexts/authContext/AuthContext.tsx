import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "./useAuth";
import { identityPoolId, poolData, region } from "../../config/cognito";
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import AWS from "aws-sdk";
export type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string, from?: string) => Promise<void>;
  logout: () => void;
  tokenRefresh: () => Promise<void>;
  userId: string | null;
};
const userPool = new CognitoUserPool(poolData);

const prefix = `CognitoIdentityServiceProvider.${poolData.ClientId}`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
      // AWS 認証情報を初期化して identityId を取得
      initAWSCredentials(token).then((id) => setUserId(id));
    }
  }, []);

  const initAWSCredentials = async (idToken: string): Promise<string | null> => {
    AWS.config.region = region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: identityPoolId,
      Logins: {
        [`cognito-idp.${region}.amazonaws.com/${poolData.UserPoolId}`]: idToken,
      },
    });

    const credentials = AWS.config.credentials as AWS.CognitoIdentityCredentials;
    await credentials.getPromise();
    return credentials.identityId || null;
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

          const id = await initAWSCredentials(idToken);
          setUserId(id);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
