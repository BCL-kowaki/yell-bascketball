# YeLL Basketball プロジェクト - Claude Code 指示書

## 言語・実行方針
- すべての応答・説明・コメント・コードコメントは**日本語**で行う
- ファイルの作成・編集・削除は確認なしで実行してOK
- コマンド実行も自動で進め、途中で確認を取らずに最後まで完走する

## プロジェクト概要
- **YeLL Basketball**: バスケットボールコミュニティ向けSNS/ポータルWebアプリ（PWA対応）
- 大会・チーム管理、投稿、チャット、通知、フォロー、お気に入り等の機能を持つ

## 技術スタック
- **フレームワーク**: Next.js 15 (App Router) / React 19 / TypeScript
- **UI**: shadcn/ui + Radix UI + Tailwind CSS v4
- **バックエンド**: AWS Amplify (AppSync GraphQL API / DynamoDB)
- **認証**: AWS Cognito + JWT (jose) / middleware.ts でルート保護
- **ストレージ**: AWS S3 (Amplify Storage) / lib/storage.ts で画像圧縮・アップロード
- **通知**: Web Push (web-push) + Service Worker (public/sw.js)
- **ホスティング**: AWS Amplify Hosting

## ディレクトリ構成と役割
```
app/                → Next.js App Router ページ群
app/api/            → API Routes (session, login, logout, register, push-notify, tournaments)
app/admin/          → 管理者画面 (admins, banners, chats, sponsors, stats, teams, tournaments, users)
components/         → 共通コンポーネント (layout, header, sidebar, post-card等)
components/ui/      → shadcn/ui コンポーネント (50+個、変更不要)
lib/                → ユーティリティ・API層
  api.ts            → GraphQL CRUD操作（巨大ファイル、全データモデルの操作）
  amplifyClient.ts  → Amplify初期化設定
  storage.ts        → S3アップロード・画像圧縮
  push-*.ts         → プッシュ通知関連
  regionData.ts     → 地域マスターデータ
src/                → Amplify自動生成コード (graphql/, ui-components/)
amplify/            → Amplifyバックエンド定義 (schema.graphql等)
middleware.ts       → JWT認証ミドルウェア
public/             → 静的ファイル (PWAマニフェスト, Service Worker, アイコン)
```

## データモデル（GraphQL 16テーブル）
- User, Tournament, Team, Post, Comment, Like, Favorite, Follow
- TournamentTeam, TournamentResult, TournamentInvitation
- ChatThread, ChatMessage, Notification
- Region, Prefecture, District, SiteConfig, PushSubscription

## 認証フロー
1. ログイン → Cognito認証 → `/api/login` でJWT発行 → httpOnly cookie (`accessToken`)
2. `middleware.ts` で全リクエストのJWT検証 (jose)
3. 公開ルート: `/`, `/login`, `/register`, `/search`, `/tournaments/*`, `/teams/*`, `/admin/*`

## コーディング規約

### ファイル構成
- ページコンポーネントは `app/` 配下に `page.tsx` として配置（App Router規約）
- 共通コンポーネントは `components/` 直下に配置
- shadcn/ui コンポーネント (`components/ui/`) は原則編集しない
- API操作は `lib/api.ts` に集約（GraphQLクエリ・ミューテーション）
- `src/graphql/` の自動生成コードは手動編集しない

### TypeScript / React
- `"use client"` ディレクティブはクライアントコンポーネントの先頭に必ず付与
- パスエイリアスは `@/` を使用（例: `@/components/ui/button`）
- 型定義は `lib/api.ts` 内の `Db*` 型を使用（DbUser, DbPost, DbTournament等）
- React 19のuseState/useEffectパターンに従う

### スタイリング
- Tailwind CSS v4 のユーティリティクラスを使用
- ブランドカラーグラデーション: `bg-brand-gradient`（オレンジ→ピンク系）
- テーマカラー: `#e84b8a`（ピンク）
- レスポンシブ: モバイルファースト、`lg:` でPC対応

### 命名規則
- コンポーネントファイル: ケバブケース（`post-card.tsx`）
- コンポーネント名: パスカルケース（`PostCard`）
- 関数・変数: キャメルケース
- GraphQLモデル: パスカルケース（`Tournament`）
- DB操作関数: `create*`, `update*`, `delete*`, `get*`, `list*` プレフィックス

## 開発ワークフロー

### 変更前の調査
- 変更対象のファイルを必ず先に読んでから修正する（読まずに提案しない）
- `lib/api.ts` は巨大ファイルなので、必要な関数のみ部分読み取りする
- GraphQLスキーマ変更時は `amplify/backend/api/yell/schema.graphql` を確認

### 計画 → 実装 → 検証
- 複雑なタスクはPlanモードから開始し、実装計画を立ててから実行する
- 実装後は `npm run build` でビルドエラーがないことを確認する
- UIの変更はレスポンシブ対応（モバイル + PC）を忘れずに

### コミット規約
- コミットメッセージ形式: `<type>: <日本語の説明>`
- type: `feat`（新機能）, `fix`（バグ修正）, `improve`（改善）, `refactor`（リファクタ）, `docs`（ドキュメント）
- 例: `feat: 大会検索のフィルタリング機能を追加`
- 関連する変更はまとめて1コミットにする（機能単位）

## 注意事項・Gotchas

### Amplify固有
- `lib/api.ts` の `"use client"` は必須（Amplifyクライアントはブラウザ環境前提）
- `ensureAmplifyConfigured()` を呼ばないとAmplify APIが動作しない
- AppSync APIキーは定期的に期限切れになる（`src/amplifyconfiguration.json` のapiKeyを確認）
- S3のURLは署名付きURLのため期限切れあり → `refreshS3Url()` で更新

### 認証
- `middleware.ts` のJWTシークレットと `/api/session/route.ts` のシークレットは同一値を使用
- 公開ルートの追加時は `middleware.ts` の `PUBLIC_EXACT` または `PUBLIC_PREFIXES` に追加

### PWA
- Service Worker (`public/sw.js`) の変更後はキャッシュバージョンの更新が必要
- `manifest.json` のアイコンは `public/icons/` に各サイズ配置済み

### ビルド
- `next.config.mjs` で `eslint.ignoreDuringBuilds: true` / `typescript.ignoreBuildErrors: true` 設定済み
- 画像最適化は無効化済み（`images.unoptimized: true`）
- SEOは `robots: noindex`（検索エンジンから非公開）

## デバッグのヒント
- レイアウトの認証状態は `/api/session` のレスポンスを確認
- GraphQLエラーは `lib/api.ts` 内の各関数のcatch句で確認
- S3アップロードエラーは `lib/storage.ts` のコンソールログで確認
- プッシュ通知は `lib/push-notifications.ts` と `/api/push-notify/route.ts` を確認
