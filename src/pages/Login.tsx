import { useState } from "react";
import { useAuth } from "../contexts/authContext/useAuth";
import { Link, useLocation } from "react-router";

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
      await login(email, password, location.state?.from?.pathname);

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

      <p>
        パスワードをお忘れの方は<Link to="/password-forget">こちら</Link>
      </p>

      {message && <p>{message}</p>}
    </>
  );
}

export default Login;
