# PDFアップロード問題のトラブルシューティング

## 現在の状況

IAMロールにS3権限を追加した後も、依然として以下のエラーが発生しています：
- `POST https://cognito-identity.ap-northeast-1.amazonaws.com/400 (Bad Request)`
- `認証情報の取得に失敗しました`

## 確認すべき項目

### 1. IAMロールにポリシーが正しく追加されたか確認

AWSコンソールで以下を確認してください：

1. IAMコンソール → ロール → `amplify-yellbascketball-main-745a2-authRole`
2. 「許可」タブを選択
3. 以下のいずれかが表示されているか確認：
   - インラインポリシーに `S3UploadPolicyForYellStorage` などのポリシーが表示されている
   - または、管理ポリシーに `AmazonS3FullAccess` が表示されている

**もしポリシーが表示されていない場合：**
- 「許可を追加」→「インラインポリシーを作成」を再度実行してください

### 2. 認証プロバイダーの設定を確認

AWSコンソールで以下を確認してください：

1. Cognitoコンソール → ID プール → `testAuthIdentityPool_main`
2. 「ユーザーアクセス」タブを選択
3. 「ID プロバイダー (2)」セクションで、以下のUser Pool IDが表示されているか確認：
   - `ap-northeast-1_quulXj1YD` ✅（正しい）
   - または `ap-northeast-1_joywInjFb`（古い設定の可能性）

**重要**: 設定ファイルを `ap-northeast-1_quulXj1YD` に更新しました。

### 3. ブラウザのキャッシュをクリア

1. ブラウザの開発者ツール（F12）を開く
2. 「Application」タブ（Chrome）または「Storage」タブ（Firefox）を選択
3. 「Clear storage」または「ストレージをクリア」をクリック
4. すべてのチェックボックスにチェックを入れる
5. 「Clear site data」をクリック

### 4. 完全にログアウトして再ログイン

1. アプリケーションからログアウト
2. ブラウザを完全に閉じる
3. ブラウザを再起動
4. アプリケーションに再度ログイン
5. PDFを添付して投稿を試す

### 5. コンソールログで確認

ブラウザの開発者ツール（F12）のコンソールで、以下を確認してください：

**ログイン時:**
```
Cognito Identity Pool session obtained after login:
{
  hasCredentials: true,  ← これが true である必要がある
  identityId: "ap-northeast-1:xxxxx",  ← これが表示されている必要がある
  hasTokens: true  ← これが true である必要がある
}
```

**PDFアップロード時:**
```
Current user authenticated: { username: "...", userId: "..." }
Auth session fetched for S3 upload:
{
  hasCredentials: true,  ← これが true である必要がある
  identityId: "ap-northeast-1:xxxxx",  ← これが表示されている必要がある
  accessToken: "PRESENT",  ← これが "PRESENT" である必要がある
  idToken: "PRESENT"  ← これが "PRESENT" である必要がある
}
```

### 6. エラーが続く場合の追加確認

#### A. Identity Poolの信頼ポリシーを確認

1. IAMコンソール → ロール → `amplify-yellbascketball-main-745a2-authRole`
2. 「信頼ポリシー」タブを選択
3. 以下のような内容が表示されているか確認：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "ap-northeast-1:c880cc9d-a210-4d52-b268-54ccfc927753"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }
  ]
}
```

**重要**: `cognito-identity.amazonaws.com:aud` の値が、Identity Pool ID `ap-northeast-1:c880cc9d-a210-4d52-b268-54ccfc927753` と一致している必要があります。

#### B. User PoolのApp Client設定を確認

1. Cognitoコンソール → ユーザープール → `yellbackend-main`
2. 「アプリの統合」タブを選択
3. 「アプリクライアント」セクションで、以下のApp Client IDが表示されているか確認：
   - `24uv2b9inchdms3d48lk9fkuh4` ✅（正しい）
   - または `78jbhbokd9t3m5717q0v81h0p9`（古い設定の可能性）

---

## 次のステップ

1. 上記の確認項目をすべて実行してください
2. 特に、IAMロールにポリシーが正しく追加されているか確認してください
3. ブラウザのキャッシュをクリアして、完全にログアウトしてから再ログインしてください
4. コンソールログで、認証情報が正しく取得できているか確認してください

問題が続く場合は、以下の情報を共有してください：
- IAMロールの「許可」タブのスクリーンショット
- コンソールログの「Cognito Identity Pool session obtained after login」の出力
- コンソールログの「Auth session fetched for S3 upload」の出力







