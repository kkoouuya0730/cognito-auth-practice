import { useAuth } from "../contexts/authContext/useAuth";

function UserHome() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>ホーム画面</h1>

      {isAuthenticated ? (
        <>
          <p>ログインに成功しました！ようこそ。</p>
          <button type="button" onClick={logout}>
            ログアウト
          </button>
        </>
      ) : (
        <p>未ログインです。ログインしてください</p>
      )}
    </div>
  );
}

export default UserHome;
