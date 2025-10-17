import { useState } from "react";
import "../styles/App.css";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { poolData } from "../config/cognito";
import { useNavigate } from "react-router";

const userPool = new CognitoUserPool(poolData);

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      userPool.signUp(email, password, [], [], (err) => {
        setLoading(false);
        if (err) {
          setMessage(err.message || "登録に失敗しました");
          return;
        }
        // result.userをグローバルstateとして持つとか
        navigate("/verify", { state: { email } });
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage(error.message || "登録に失敗しました");
    }
  };

  return (
    <>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignUp}>
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
          {loading ? "登録中..." : "登録"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </>
  );
}

export default SignUp;
