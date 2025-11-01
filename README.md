# cognito-auth-practice

## 🏷️ 1. プロジェクト概要

AWS Cognito を使用した「認証（Authentication）」および「認可（Authorization）」の仕組みを学習した際のアウトプット用のリポジトリです。(過去実装経験あるが振り返りがてら再学習)
React + Vite 環境でフロントエンドを構築し、Cognito ユーザープールと ID プールを連携させて、認証済みユーザーのみが自分の S3 フォルダにファイルをアップロードできるようにしています。

### 使用技術

- **フロントエンド**: React / Vite / TypeScript
- **認証基盤**: AWS Cognito（User Pool / Identity Pool）
- **ストレージ**: Amazon S3
- **その他**: AWS IAM

---

## ⚙️ 2. 環境構成

### AWS リソース

- **Cognito User Pool**

  - ユーザー登録・ログイン・トークン発行を担当

- **Cognito Identity Pool**

  - トークンをもとに一時的な AWS クレデンシャルを発行

- **IAM ロール**

  - 認証済みユーザーに S3 への限定的アクセスを付与

- **S3 バケット**

  - 各ユーザーは自分のフォルダ配下にのみアップロード可能

---

## 🔑 3. 認証フローの理解

Cognito では「ユーザー認証」と「AWS リソースアクセス（認可）」を分離して設計します。

1. ユーザーがサインアップ（Cognito User Pool に登録）
2. サインイン時に **トークン（ID / Access / Refresh）** を取得
3. ID トークンを **Identity Pool** に渡して一時的な AWS クレデンシャルを発行
4. クレデンシャルに紐づく IAM ロールで S3 にアクセス（認可）

```text
[User] → [Cognito User Pool] → [ID Token] → [Identity Pool] → [IAM Role] → [S3]
```

---

## 🧩 4. 実装ポイント

- **amazon-cognito-identity-js**

  - `AuthenticationDetails` と `CognitoUser` を使用してサインイン処理を実装

- **Vite の Node ポリフィル**

  - `global is not defined` エラーを回避するため `vite.config.js` に `globalThis` を設定

- **S3 アップロード**

  - `AWS.CognitoIdentityCredentials` を使って一時的な認証情報を取得
  - `s3.upload()` で自分のフォルダ配下にのみファイルアップロード

---

## 🔒 5. IAM ポリシー設計

### ポリシー名：`AppUserFilesUploadPolicy`

認証済みユーザーが自分のフォルダ配下のみアップロード可能とする IAM ポリシー。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::${バケット名}/${cognito-identity.amazonaws.com:sub}/*"
    }
  ]
}
```

この設定により、ユーザーは自分の Cognito Identity ID に紐づいたフォルダのみ操作可能。

---

## 🧠 6. 学びのまとめ

- Cognito の「User Pool（認証）」と「Identity Pool（認可）」の役割を区別しながら実装を進められた
- Vite 環境で Node.js 向けライブラリを動かすためには polyfill が必要
- IAM ロールを使えば、ユーザーごとの S3 アクセス制御を細かく設定できる
- User PoolのGroupを利用することで、ユーザーごとのロール(Admin, User, Guest)を元にアクセス制御が可能
