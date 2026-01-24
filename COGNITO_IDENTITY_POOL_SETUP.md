# Cognito Identity Pool設定手順

## 1. Cognito Identity Poolの設定確認

### ステップ1: AWSコンソールにログイン
1. [AWSコンソール](https://console.aws.amazon.com/)にログイン
2. リージョンを `ap-northeast-1` (東京) に設定

### ステップ2: Cognito Identity Poolを開く
1. 検索バーで「Cognito」と検索
2. 「Amazon Cognito」を選択
3. 左側のメニューから「Identity pools」を選択
4. Identity Pool ID: `ap-northeast-1:70c21c83-d19c-48ff-8af9-fed945f06297` を検索または選択

### ステップ3: 認証プロバイダーの確認
1. Identity Poolの詳細ページで「Edit identity pool」をクリック
2. 「Authentication providers」セクションを確認
3. **重要**: 「Cognito user pool」が設定されているか確認
   - User Pool ID: `ap-northeast-1_joywInjFb` が表示されているか
   - App client ID: `78jbhbokd9t3m5717q0v81h0p9` が表示されているか

### ステップ4: 認証プロバイダーが設定されていない場合
1. 「Authentication providers」セクションで「Add identity provider」をクリック
2. 「Cognito user pool」を選択
3. 以下の情報を入力:
   - **User Pool ID**: `ap-northeast-1_joywInjFb`
   - **App client ID**: `78jbhbokd9t3m5717q0v81h0p9`
4. 「Save changes」をクリック

---

## 2. IAMロールの確認と設定

### ステップ1: 認証済みユーザー用のIAMロールを確認
1. Identity Poolの詳細ページで「Edit identity pool」をクリック
2. 「Authentication providers」セクションの下に「IAM role」セクションがある
3. 「Authenticated role」にIAMロール名が表示されている
   - 例: `Cognito_yellbackendAuth_Role` または類似の名前

### ステップ2: IAMロールの詳細を確認
1. 表示されているIAMロール名をクリック（またはIAMコンソールで検索）
2. IAMコンソールでロールの詳細ページが開く

### ステップ3: S3へのPutObject権限を確認
1. ロールの詳細ページで「Permissions」タブを選択
2. ポリシーを確認:
   - `AmazonS3FullAccess` または
   - カスタムポリシーで `s3:PutObject` 権限があるか確認

### ステップ4: S3権限がない場合の追加方法

#### 方法A: 既存のポリシーを編集
1. 「Permissions」タブで、S3関連のポリシーを選択
2. 「Edit」をクリック
3. JSONエディタで以下を追加:

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:PutObject",
    "s3:GetObject",
    "s3:DeleteObject"
  ],
  "Resource": [
    "arn:aws:s3:::yellstorage-main/*"
  ]
}
```

#### 方法B: 新しいポリシーをアタッチ
1. IAMコンソールの左メニューから「Policies」を選択
2. 「Create policy」をクリック
3. 「JSON」タブを選択
4. 以下のポリシーを貼り付け:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::yellstorage-main/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::yellstorage-main"
      ]
    }
  ]
}
```

5. 「Next」をクリック
6. ポリシー名を入力（例: `S3UploadPolicyForYellStorage`）
7. 「Create policy」をクリック
8. ロールの詳細ページに戻り、「Add permissions」→「Attach policies」をクリック
9. 作成したポリシーを選択して「Add permissions」をクリック

---

## 3. 設定の確認方法

### コンソールログで確認
ブラウザの開発者ツール（F12）のコンソールで以下を確認:

1. **ログイン時**:
   ```
   Cognito Identity Pool session obtained after login:
   {
     hasCredentials: true,
     identityId: "ap-northeast-1:xxxxx",
     hasTokens: true
   }
   ```

2. **PDFアップロード時**:
   ```
   Current user authenticated: { username: "...", userId: "..." }
   Auth session fetched for S3 upload:
   {
     hasCredentials: true,
     identityId: "ap-northeast-1:xxxxx",
     accessToken: "PRESENT",
     idToken: "PRESENT"
   }
   ```

### エラーが続く場合
1. ブラウザのキャッシュをクリア
2. 一度ログアウトしてから再ログイン
3. ハードリロード（Cmd+Shift+R または Ctrl+Shift+R）

---

## 4. トラブルシューティング

### 問題: "Unauthenticated access is not supported"
- **原因**: Identity Poolが未認証アクセスを許可していない
- **解決策**: ログインしてからPDFをアップロードしてください（既に実装済み）

### 問題: "No credentials or identityId in session"
- **原因**: User PoolとIdentity Poolの連携が正しく設定されていない
- **解決策**: 上記のステップ1-4を確認してください

### 問題: "Access Denied" エラー
- **原因**: IAMロールにS3への権限がない
- **解決策**: 上記のステップ2-4を確認してください

---

## 5. 参考情報

- **Identity Pool ID**: `ap-northeast-1:70c21c83-d19c-48ff-8af9-fed945f06297`
- **User Pool ID**: `ap-northeast-1_joywInjFb`
- **App Client ID**: `78jbhbokd9t3m5717q0v81h0p9`
- **S3 Bucket**: `yellstorage-main`
- **リージョン**: `ap-northeast-1`







