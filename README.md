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

分散型ID（DID）と DAO ガバナンスを活用し、研究成果を検証可能な形で共有するフルスタック MVP です。

## 概要

**本番環境**: Vite + Supabase でデプロイ  
**開発環境**: Hardhat (スマートコントラクト開発) + Next.js (オプション)

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

### 本番環境 (Production)

| レイヤー             | 技術                                                               | メモ                                   |
| -------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| フロント             | Vite, React 18, TypeScript, Tailwind CSS, RainbowKit, Radix UI     | `academic-chain/` ディレクトリ         |
| バックエンド         | Supabase (PostgreSQL, Auth, Storage)                               | Supabase Cloud                         |
| ブロックチェーン     | RainbowKit, wagmi, viem                                            | Ethereum / Polygon 接続                |
| デプロイ             | Vercel (または Netlify)                                            | `academic-chain/vercel.json`           |

### 開発環境 (Development)

| レイヤー             | 技術                                                               | メモ                                   |
| -------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| スマートコントラクト | Solidity, Hardhat, OpenZeppelin, Ignition                          | `contracts/`, `ignition/` (ルート)     |
| テストツール         | Hardhat, Chai, Mocha                                               | `test/` (ルート)                       |
| オプション UI        | Next.js 14 (契約管理用)                                            | `src/app` (開発専用、デプロイ不要)     |

```
【本番環境】
┌─────────────────┐
│ Vite React App  │──→ Supabase (Auth, DB, Storage)
│  (Vercel)       │──→ Ethereum/Polygon (RainbowKit + wagmi)
└─────────────────┘

【開発環境】
┌─────────────────┐
```

## クイックスタート

### 本番環境 (Vite + Supabase)

```bash
# 1. academic-chainディレクトリに移動
cd academic-chain

# 2. 依存関係をインストール
npm install

# 3. 環境変数ファイルを用意
cp .env.example .env
# Supabase URL/Key, WalletConnect Project ID, Alchemy API Key を設定

# 4. 開発サーバー起動
npm run dev

# 5. ビルド (本番用)
npm run build
```

### 開発環境 (Hardhat - スマートコントラクト)

```bash
# 1. ルートディレクトリで依存関係をインストール
npm install

# 2. 環境変数ファイルを用意
cp .env.example .env
# RPC URL, PRIVATE_KEY, Storacha 情報を更新

# 3. スマートコントラクトをコンパイル
npm run compile

# 4. テスト実行
npm run test

# 5. コントラクトをデプロイ (Sepolia)
npx hardhat ignition deploy ignition/modules/AcademicRepository.ts --network sepolia
```

## 利用可能なスクリプト

### Vite UI (academic-chain/)

| コマンド                                                   | 内容                                               |
| ---------------------------------------------------------- | -------------------------------------------------- |
| `npm run dev`                                              | Vite 開発サーバー (ホットリロード付き)。           |
| `npm run build`                                            | 本番用ビルド (build/ ディレクトリに出力)。         |

### Hardhat (ルート/)

| コマンド                                                   | 内容                                               |
| ---------------------------------------------------------- | -------------------------------------------------- |
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

### Vite UI (本番環境)

1. `academic-chain/.env.production` に本番環境変数を設定:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WALLETCONNECT_PROJECT_ID`
   - `VITE_ALCHEMY_API_KEY`
2. `cd academic-chain && npm run build` が成功することを確認。
3. Vercel にデプロイ: `vercel --prod` (または GitHub 連携)
4. Supabase プロジェクトのセットアップ完了を確認。

### スマートコントラクト (開発環境)

1. `npm run compile`, `npm run test` がすべて成功。
2. `.env` に本番 RPC URL / PRIVATE_KEY を設定。
3. コントラクトをメインネットにデプロイ:
   ```bash
   npx hardhat ignition deploy ignition/modules/AcademicRepository.ts --network mainnet
   ```
4. デプロイされたコントラクトアドレスを `academic-chain/.env.production` に追加。

## 本番環境へのデプロイ

### Vite UI → Vercel

```bash
# 1. Vercel CLI をインストール
npm i -g vercel

# 2. academic-chain ディレクトリでデプロイ
cd academic-chain
vercel --prod

# 3. 環境変数を Vercel ダッシュボードで設定
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, etc.
```

### Supabase セットアップ

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. Database タブでテーブルを作成 (papers, profiles, etc.)
3. API Settings から URL と Anon Key を取得
4. Vercel の環境変数に設定

詳細な本番環境設定手順は **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** を参照してください。
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
