import { useState } from "react";
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import { poolData } from "../config/cognito";
import { useLocation, useNavigate } from "react-router";

const userPool = new CognitoUserPool(poolData);
type LocationState = {
  email: string;
};
function ConfirmPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | undefined;
  const email = state?.email || "";

  const handleConfirmPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await new Promise((resolve, reject) => {
        const user = new CognitoUser({ Username: email, Pool: userPool });
        user.confirmPassword(confirmCode, newPassword, {
          onSuccess: resolve,
          onFailure: reject,
        });
      });

      setMessage("送信成功");
      setNewPassword("");
      setConfirmCode("");

      navigate("/login");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("送信失敗", error);
      setMessage(error.message || "送信に失敗しました");
    }
  };

  return (
    <>
      <h1>パスワード再設定</h1>
      <p>認証コードと新しいパスワードを入力してください</p>

      <form onSubmit={handleConfirmPassword}>
        <label htmlFor="confirmCode">認証コード</label>
        <input
          id="confirmCode"
          name="confirmCode"
          value={confirmCode}
          onChange={(e) => setConfirmCode(e.target.value)}
          required
        />

        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          name="password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={newPassword === "" || confirmCode === ""}>
          {loading ? "送信中" : "送信"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </>
  );
}

export default ConfirmPassword;
