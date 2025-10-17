import { useState } from "react";
import "../styles/App.css";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { poolData } from "../config/cognito";

const userPool = new CognitoUserPool(poolData);

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const result = await new Promise((resolve, reject) => {
        userPool.signUp(email, password, [], [], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
      console.log("✅ SignUp成功:", result);
      setMessage("サインアップ成功！確認メールをチェックしてください。");
      setEmail("");
      setPassword("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Sign Up 失敗", error);
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
          登録
        </button>
      </form>

      {message && <p>{message}</p>}
    </>
  );
}

export default SignUp;
