import { Link, Outlet } from "react-router";

export default function Layout() {
  return (
    <div style={{ padding: "20px" }}>
      <nav style={{ marginBottom: "20px" }}>
        <Link to="/signup">新規登録</Link> | <Link to="/verify">認証コード</Link> | <Link to="/login">ログイン</Link> |{" "}
        <Link to="/home">ホーム</Link>
      </nav>
      <Outlet />
    </div>
  );
}
