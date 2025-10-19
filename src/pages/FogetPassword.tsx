import { useState } from "react";
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import { poolData } from "../config/cognito";
import { useNavigate } from "react-router";

const userPool = new CognitoUserPool(poolData);

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleForgetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const user = new CognitoUser({ Username: email, Pool: userPool });

      await new Promise((resolve, reject) => {
        user.forgotPassword({
          onSuccess: resolve,
          onFailure: (err) => reject(err),
          inputVerificationCode: (data) => {
            resolve(data);
          },
        });
      });

      setMessage("送信成功");
      navigate("/confirm-password", { state: { email } });
      setEmail("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("送信失敗", error);
      setMessage(error.message || "送信に失敗しました");
    }
  };

  return (
    <>
      <h1>認証コード送信</h1>
      <p>入力されたメールアドレスに再設定用の認証コードが届きます</p>

      <form onSubmit={handleForgetPassword}>
        <label htmlFor="email">メールアドレス</label>
        <input id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <button type="submit" disabled={email === ""}>
          {loading ? "送信中" : "送信"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </>
  );
}

export default ForgetPassword;
