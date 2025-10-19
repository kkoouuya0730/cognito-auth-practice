import { useState } from "react";
import { CognitoUser, AuthenticationDetails, CognitoUserPool } from "amazon-cognito-identity-js";
import { poolData } from "../config/cognito";
import { useAuth } from "../contexts/authContext/useAuth";
import { useLocation } from "react-router";

const userPool = new CognitoUserPool(poolData);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const user = new CognitoUser({ Username: email, Pool: userPool });
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });

      await new Promise((resolve, reject) => {
        user.authenticateUser(authDetails, {
          onSuccess: (result) => {
            const accessToken = result.getAccessToken().getJwtToken();
            // 認証ガードでログイン画面に遷移した場合は、元の画面に戻る
            login(accessToken, location.state?.from?.pathname || "/home");
            resolve(accessToken);
          },
          onFailure: (err) => reject(err),
        });
      });

      setMessage("ログイン成功");
      setEmail("");
      setPassword("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("ログイン失敗", error);
      setMessage(error.message || "ログインに失敗しました");
    }
  };

  return (
    <>
      <h1>ログイン</h1>
      <form onSubmit={handleLogin}>
        <label htmlFor="email">メールアドレス</label>
        <input id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={email === "" || password === ""}>
          {loading ? "ログイン中" : "ログイン"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </>
  );
}

export default Login;
