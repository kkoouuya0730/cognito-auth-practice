import { useState } from "react";
import AWS from "aws-sdk";
import { useAuth } from "../contexts/authContext/useAuth";

export default function FileUpload() {
  const { userId } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    if (!userId) {
      setMessage("ログインしてからアップロードしてください");
      return;
    }

    setMessage("アップロード中...");
    try {
      const s3 = new AWS.S3();
      await s3
        .putObject({
          Bucket: import.meta.env.VITE_S3_BUCKET_NAME!,
          Key: `${userId}/${file.name}`,
          Body: file,
        })
        .promise();
      setMessage(`アップロード成功: ${file.name}`);
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("アップロード失敗");
    }
  };

  return (
    <div>
      <h2>ファイルアップロード</h2>
      <input type="file" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={!file}>
        アップロード
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
