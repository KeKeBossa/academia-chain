# Academic Blockchain Repository

<details>
<summary>目次</summary>

- [概要](#概要)
- [主な特徴](#主な特徴)
- [アーキテクチャと技術スタック](#アーキテクチャと技術スタック)
- [クイックスタート](#クイックスタート)
- [利用可能なスクリプト](#利用可能なスクリプト)
- [環境変数](#環境変数)
- [ディレクトリ構成](#ディレクトリ構成)
- [開発フローとテスト](#開発フローとテスト)
- [デプロイ前チェックリスト](#デプロイ前チェックリスト)
- [ロードマップ](#ロードマップ)
- [ライセンス](#ライセンス)

</details>

分散型ID（DID）と DAO ガバナンスを活用し、研究成果を検証可能な形で共有するフルスタック MVP です。Next.js (App Router)、Prisma/PostgreSQL、Hardhat を中心に Polygon Amoy / Sepolia テストネットと連携します。

## 概要

- ラボや研究室を DAO として登録し、トークン投票で意思決定を行う
- 研究成果を IPFS に記録し、DAO 内レビュー/レピュテーションと連動
- 共同研究募集、活動ログ、通知センターを備えたダッシュボード
- DID セッションベースの認証と VC (Verifiable Credential) 暗号化ストレージ

マイルストーンやタスクの進捗は `plans.md` にまとめています（2026-01-20 までの MVP リリースが目標）。

## 主な特徴

- **ウォレット & DID 認証**: RainbowKit + wagmi を用いたウォレット接続と DID 署名検証。
- **DAO ガバナンス**: LabDAO / LabRegistry コントラクトによる提案、投票、タイムロック管理。
- **研究資産ワークフロー**: IPFS / Web3.Storage 連携、レビュー、レピュテーション計算。
- **共同研究マッチング**: コラボレーション投稿・アクティビティフィード・通知 UI を提供。
- **セキュリティ**: VC メタデータを AES-256-GCM で暗号化、API レート制限、Slither / ESLint Security による解析。

## アーキテクチャと技術スタック

| レイヤー             | 技術                                                               | メモ                                   |
| -------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| フロント             | Next.js 14, TypeScript, Tailwind CSS, RainbowKit, Radix UI, Sonner | `src/app` 以下で App Router 構成       |
| スマートコントラクト | Solidity, Hardhat, OpenZeppelin, Ignition                          | `contracts/`, `ignition/`              |
| バックエンド         | Prisma, PostgreSQL (Docker), Supabase                              | `prisma/schema.prisma`, `src/server/*` |
| 周辺ツール           | Web3.Storage, Storacha, Docker Compose                             | `.docker/`, `scripts/`                 |

```
┌──────────────┐    ┌────────────────┐
│ Next.js App  │──→│ Prisma Client  │──→ PostgreSQL (Docker)
│ (RainbowKit) │    └────────────────┘
│              │           │
│ wagmi /      │           │ シード/同期
│ Radix UI     │           ▼
└─────▲────────┘    Smart Contracts (Hardhat / Polygon Amoy)
      │ ウォレット接続
      ▼
   研究者 / DAO メンバー
```

## クイックスタート

### 前提条件

- Node.js 18.17 以上 / npm 9 以上
- Docker（PostgreSQL 用）
- Polygon Amoy / Sepolia RPC エンドポイント

### 手順

```bash
# 1. 依存関係をインストール
npm install

# 2. 環境変数ファイルを用意
cp .env.example .env
# VC_ENCRYPTION_SECRET, RPC URL, Storacha 情報を更新

# 3. Postgres を起動
npm run db:start

# 4. Prisma クライアント生成 & マイグレーション
npm run prisma:generate
npm run prisma:migrate

# 5. 開発サーバー（ポートが制限される環境では PORT を変更）
PORT=3001 npm run dev
```

## 利用可能なスクリプト

| コマンド                                                   | 内容                                               |
| ---------------------------------------------------------- | -------------------------------------------------- |
| `npm run dev`                                              | Next.js 開発サーバー (Turbopack)。                 |
| `npm run build` / `npm run start`                          | プロダクションビルド / サーバー起動。              |
| `npm run lint`                                             | ESLint (App Router + TypeScript)。                 |
| `npm run format` / `npm run format:check`                  | Prettier で TS / Solidity / Prisma を整形 / 検証。 |
| `npm run compile`                                          | Hardhat で Solidity をコンパイル。                 |
| `npm run test`                                             | Hardhat テストスイート。                           |
| `npm run prisma:generate` / `npm run prisma:migrate`       | Prisma Client 生成 / Migrate。                     |
| `npm run db:start` / `npm run db:stop` / `npm run db:logs` | Docker Compose で Postgres を操作。                |
| `npm run verify:staging`                                   | Storacha / RPC / コントラクト設定を検証。          |
| `npm run data:sync`                                        | ArtifactRegistry のイベントを ActivityLog に同期。 |
| `npm run storacha:bootstrap` / `npm run storacha:secrets`  | Storacha (w3up) 資格情報の生成 / 配布。            |
| `npm run lint:security`                                    | ESLint Security による静的解析。                   |
| `npm run security:contracts`                               | Docker 上で Slither を実行し Solidity を解析。     |

## 環境変数

`.env.example` をベースに `.env` を作成します。主要な変数は下記の通りです。

| 変数                                                                   | 説明                                                                                               |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                         | Prisma が接続する PostgreSQL URI（`postgresql://` 形式）。                                         |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`                                 | RainbowKit / WalletConnect 用 ID。                                                                 |
| `SEPOLIA_RPC_URL`, `POLYGON_AMOY_RPC_URL`, `ARTIFACT_REGISTRY_RPC_URL` | Hardhat・RainbowKit・バックエンドで利用する RPC。                                                  |
| `VC_ENCRYPTION_SECRET`                                                 | VC メタデータを AES-256-GCM で暗号化するキー。値を変更すると既存データが復号できなくなるため注意。 |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`                               | API レート制限の窓と上限。                                                                         |
| `STORACHA_*`                                                           | Web3.Storage (w3up) 連携に必要な資格情報。                                                         |
| `GOVERNANCE_DEFAULT_*`                                                 | シードデータ作成時に利用するウォレットアドレス。                                                   |

本番向けは `.env.production.template` を基に Secrets Manager や CI/CD から注入してください。

## ディレクトリ構成

```
academic-repository/
├─ src/
│  ├─ app/
│  │  ├─ api/              # DID 認証 / DAO / 資産 / 通知 API
│  │  ├─ components/       # Tailwind / Radix ベースの UI コンポーネント
│  │  ├─ globals.css
│  │  ├─ layout.tsx / page.tsx / providers.tsx
│  │  └─ hooks/
│  ├─ lib/                 # wagmi 設定などクライアント共通処理
│  └─ server/              # Prisma クライアント、暗号化ユーティリティ
├─ contracts/              # Solidity コントラクト
├─ ignition/               # Hardhat Ignition モジュール
├─ scripts/                # Hardhat / Storacha / 検証スクリプト
├─ prisma/                 # Prisma スキーマとローカルマイグレーション
├─ docs/                   # 監視計画ほかドキュメント
├─ plans.md                # マイルストーンとスプリント計画
└─ docker-compose.yml      # 開発用 Postgres コンテナ設定
```

## 開発フローとテスト

1. リモート最新を取得（例: `git pull --rebase origin master`）。
2. `npm run lint` / `npm run test` / `npm run compile` で品質担保。
3. `npm run build` で本番ビルドが通ることを確認（`DATABASE_URL` が未設定の場合はダミー値を設定）。
4. コミット前に `npm run lint:staged`（pre-commit hook）を実行。

### テストレイヤー

- Hardhat テスト: `test/` 内で Mocha/Chai。
- API ハンドラ: Supertest 等での E2E テストを今後整備予定。
- UI: Storybook / Playwright はロードマップに記載（`plans.md` 参照）。

## デプロイ前チェックリスト

1. `plans.md` の進捗を更新し、該当セッションの ToDo を完了させる。
2. `npm run lint`, `npm run compile`, `npm run test`, `npm run build` がすべて成功。
3. `.env.production` に本番 `DATABASE_URL` / `VC_ENCRYPTION_SECRET` / RPC URL を設定。
4. `npm run verify:staging` で Storacha・コントラクト構成を検証。
5. CI（`.github/workflows/ci-cd.yml`）のジョブが成功していることを確認。

## 本番環境へのデプロイ

詳細な本番環境設定手順は **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** を参照してください。

### クイックスタート

```bash
# 1. 環境変数テンプレートをコピー
cp .env.production.example .env.production

# 2. 必要な環境変数を設定 (DATABASE_URL, RPC URLs, API Keys など)

# 3. Vercel へデプロイ
npm i -g vercel
vercel --prod

# または GitHub Actions で自動デプロイ
# main ブランチへプッシュすると自動的にデプロイされます
```

### デプロイ先オプション

- **Vercel** (推奨) - Next.js 最適化、簡単設定
- **Railway** - Docker + PostgreSQL 統合
- **Render** / **Fly.io** - フルスタック対応

詳細は [DEPLOYMENT.md](docs/DEPLOYMENT.md) の手順に従ってください。

## ロードマップ

- 詳細なロードマップ・成果物は `plans.md` で管理しています。
- 直近の優先事項: CI/CD 強化、セキュリティ監査、自動化された監視基盤の整備。

## ライセンス

このプロジェクトのライセンスはリポジトリのポリシーに従います。外部リソースを取り込む場合は、元リポジトリのライセンス表記を README もしくは該当ファイルに明記してください。
