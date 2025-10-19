import { Link, Outlet } from "react-router";
import "../styles/App.css";

export default function Layout() {
  return (
    <div style={{ padding: "20px" }}>
      <nav style={{ marginBottom: "20px" }}>
        <Link to="/signup">新規登録</Link> | <Link to="/login">ログイン</Link> | <Link to="/home">ホーム</Link>
      </nav>
      <Outlet />
    </div>
  );
}
