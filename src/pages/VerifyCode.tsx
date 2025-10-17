import { useState } from "react";
import "../styles/App.css";
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import { poolData } from "../config/cognito";
import { useLocation, useNavigate } from "react-router";

const userPool = new CognitoUserPool(poolData);

type LocationState = {
  email: string;
};
function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | undefined;
  const email = state?.email || "";

  const [verifyCode, setVerifyCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    return <p>不正なアクセスです。新規登録から進めてください。</p>;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const user = new CognitoUser({ Username: email, Pool: userPool });

      user.confirmRegistration(verifyCode, true, (err) => {
        setLoading(false);
        if (err) {
          setMessage(err.message || "認証に失敗しました");
          return;
        }
        setMessage("認証成功!");
        navigate("/login");
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage(error.message || "認証に失敗しました");
    }
  };

  return (
    <div>
      <h1>認証コード入力</h1>
      <p>{email}に届いた認証コードを入力してください</p>

      <form onSubmit={handleVerify}>
        <label htmlFor="verify-code">認証コード</label>
        <input
          id="verify-code"
          name="verify-code"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "確認中..." : "確認"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default VerifyCode;
