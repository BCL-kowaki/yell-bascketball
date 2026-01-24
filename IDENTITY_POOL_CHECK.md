# Cognito Identity Pool認証情報取得エラーの確認手順

## 現在のエラー

ログイン時に以下のエラーが発生しています：
- `Could not obtain Identity Pool credentials after login (S3 uploads may fail)`
- `Unauthenticated access is not supported for this identity pool.`
- `POST https://cognito-identity.ap-northeast-1.amazonaws.com/400 (Bad Request)`

## 確認すべき項目

### 1. Identity Poolの認証プロバイダー設定を確認

AWSコンソールで以下を確認してください：

1. Cognitoコンソール → ID プール → `testAuthIdentityPool_main`
2. 「ユーザーアクセス」タブを選択
3. 「ID プロバイダー (2)」セクションで、以下を確認：
   - User Pool ID: `ap-northeast-1_quulXj1YD` が表示されているか
   - App Client ID: `24uv2b9inchdms3d48lk9fkuh4` が表示されているか

**重要**: 設定ファイルには以下の値が設定されています：
- User Pool ID: `ap-northeast-1_quulXj1YD`
- App Client ID: `24uv2b9inchdms3d48lk9fkuh4`

### 2. User PoolのApp Client設定を確認

1. Cognitoコンソール → ユーザープール → `yellbackend-main`
2. 「アプリの統合」タブを選択
3. 「アプリクライアント」セクションで、以下を確認：
   - App Client ID: `24uv2b9inchdms3d48lk9fkuh4` が表示されているか
   - 「認証フロー」で「ALLOW_USER_PASSWORD_AUTH」が有効になっているか

### 3. Identity Poolの信頼ポリシーを確認

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

### 4. 認証プロバイダーが正しく設定されていない場合の修正方法

もし認証プロバイダーが正しく設定されていない場合：

1. Cognitoコンソール → ID プール → `testAuthIdentityPool_main`
2. 「ユーザーアクセス」タブを選択
3. 「ID プロバイダーを追加」ボタンをクリック
4. 「Cognito user pool」を選択
5. 以下の情報を入力：
   - **User Pool ID**: `ap-northeast-1_quulXj1YD`
   - **App Client ID**: `24uv2b9inchdms3d48lk9fkuh4`
6. 「保存」をクリック

---

## トラブルシューティング

### 問題: "Unauthenticated access is not supported for this identity pool"

このエラーは、Identity Poolが未認証アクセスを許可していないことを示しています。しかし、ユーザーはログインしているはずなので、これは「認証済みアクセス」である必要があります。

**考えられる原因:**
1. User PoolとIdentity Poolの連携が正しく設定されていない
2. User PoolのApp Client IDがIdentity Poolに正しく設定されていない
3. Identity Poolの認証プロバイダーが正しく設定されていない

**解決策:**
1. 上記の確認項目をすべて実行してください
2. 特に、「ID プロバイダー (2)」セクションで、User Pool IDとApp Client IDが正しく設定されているか確認してください

---

## 参考情報

- **Identity Pool ID**: `ap-northeast-1:c880cc9d-a210-4d52-b268-54ccfc927753`
- **User Pool ID**: `ap-northeast-1_quulXj1YD`
- **App Client ID**: `24uv2b9inchdms3d48lk9fkuh4`
- **IAMロール**: `amplify-yellbascketball-main-745a2-authRole`
- **S3 Bucket**: `yellstorage-main`
- **リージョン**: `ap-northeast-1`







