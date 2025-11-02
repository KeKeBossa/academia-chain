# Academic Blockchain Repository 初心者ハンドブック

最終更新: 2025-10-21

このハンドブックは、ブロックチェーンやフルスタック開発に触れたばかりの方向けに、リポジトリの全体像とセットアップ手順をまとめたガイドです。環境構築からアプリの実行、主要ディレクトリ同士のつながりまでを順番に解説します。

---

## 1. 事前準備

| 必要なもの | バージョン / 補足                                                                         |
| ---------- | ----------------------------------------------------------------------------------------- |
| Node.js    | 18.17 以上（LTS 推奨）。`node -v` で確認できます。                                        |
| npm        | Node.js に同梱。`npm -v` で確認。                                                         |
| Git        | 2.x 以上。リポジトリの取得・更新に使用します。                                            |
| エディタ   | VS Code など TypeScript を扱えるもの。TailwindCSS / Prisma のプラグインがあると便利です。 |

※ Docker は Slither（`npm run security:contracts`）を実行する場合にのみ必要です。

---

## 2. セットアップと実行のコマンド一覧

ターミナルはリポジトリのルート（`academic-repository/`）で操作します。行頭の `#` は説明行、`$` はコマンドを表しています。

```bash
# 1) 依存関係をインストール
$ npm install

# 2) 环境変数ファイルを作成（必要に応じて値を修正）
$ cp .env.example .env

# 3) Storacha 資格情報をダミー生成（実値があれば --dry-run は不要）
$ npm run storacha:bootstrap -- --dry-run --env tmp/storacha.env --json tmp/storacha.json

# 4) .env に生成された値を反映（必要なら追記）
$ cat tmp/storacha.env >> .env   # 実運用では値を手動で整理して貼り付ける

# 5) Prisma Client を生成（データベース URL を設定した後）
$ npm run prisma:generate

# 6) Next.js 開発サーバーを起動（Turbopack 利用）
$ npm run dev
# -> http://localhost:3000 でフロントエンドと API を確認できます。

# 7) スマートコントラクトをコンパイル
$ npm run compile

# 8) Hardhat テストを実行
$ npm run test

# 9) 環境変数の整合性チェック（CLI/RPC が用意できない場合は STAGING_MODE=dry-run 推奨）
$ STAGING_MODE=dry-run npm run verify:staging

# 10) CI と同じセットをまとめて走らせたいとき
$ npm run lint && npm run compile && npm run test

# 11) Storacha・Secrets 周りを本番値で更新
$ npm run storacha:bootstrap -- --env .env --github-env staging --aws-secret academic-repository/storacha
# または取得済み値を反映
$ npm run storacha:secrets -- --principal <Base64> --proof <Base64> --space did:key:xxx --env .env

# 12) イベント同期ジョブ（オプション）
$ npm run data:sync
```

一連のコマンドを上から順に実行すれば、ローカルで UI と API が動作する状態になります。実際にウォレット接続や DID チャレンジを試す際は、テスト用の WalletConnect プロジェクト ID と RPC URL を `.env` に設定してください。

---

## 3. システム全体の構成と依存関係

フロントエンド、バックエンド、ブロックチェーン、データベースが連携して 1 つのワークフローを形成しています。ざっくりとした接続は次の通りです。

```
┌────────────┐        ┌──────────────────┐        ┌───────────────────────┐
│  ブラウザ   │  →→   │  Next.js App Router │  →→   │  API ルート (src/app/api) │
└────────────┘        │  (src/app)         │        └────────────┬───────────────┘
                        │      │                             │
                        │      │                             │ Prisma 経由で DB へ
                        │      │                             ▼
                        │      └──> Providers (Chakra / wagmi / RainbowKit)
                        │                                    ┌───────────────────────┐
                        │                                    │ Prisma Client          │
                        │                                    │ (src/server/db)        │
                        │                                    └────────┬──────────────┘
                        │                                    ┌────────┴──────────────┐
                        │                                    │ Supabase / PostgreSQL │
                        │                                    └───────────────────────┘
                        │
                        └────────> wagmi 設定 (src/lib/wagmi.ts) → ウォレット/RPC
                                                             │
                                                             ▼
                                                      EVM チェーン (Sepolia / Polygon Amoy)

Hardhat (contracts/ + scripts/) ───────→  スマートコントラクトの開発・テスト・デプロイ
```

リアルなデータベースやブロックチェーンノードが無くても、`STAGING_MODE=local` で Hardhat のローカルチェーンにデプロイし、`--dry-run` でダミー値を作れば多くの機能を動かせます。

---

## 4. 主要ディレクトリと「誰が誰に依存しているか」

| パス                                     | 役割                                                                                                         | 主な依存先                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `src/app/layout.tsx`                     | アプリ全体の HTML 骨格。`Providers` を読み込み、全ページで Chakra UI / RainbowKit などが使えるようにします。 | `src/app/providers.tsx`                                               |
| `src/app/providers.tsx`                  | フロントエンドのグローバル状態を初期化（Chakra テーマ、React Query、wagmi、RainbowKit）。                    | `src/lib/wagmi.ts`、`@rainbow-me/rainbowkit`、`@tanstack/react-query` |
| `src/app/page.tsx`                       | ランディングページとデモパネル。各パネルが API を呼び、データやアクションを確認できるようになっています。    | `src/app/components/*`、API ルート (`fetch` 経由)                     |
| `src/app/api/**/route.ts`                | Next.js App Router の API。リクエストを受け取って Prisma やチェーン呼び出しを実行します。                    | `src/server/**`、`@prisma/client`、`viem`                             |
| `src/server/db/client.ts`                | Prisma Client のシングルトン。API ルートから共有されます。                                                   | `.env` の `DATABASE_URL`、Prisma 生成物                               |
| `src/server/blockchain/*`                | viem / ethers を使ったチェーン操作ヘルパー。API から呼ばれて ArtifactRegistry などと通信します。             | Hardhat でコンパイルされた ABI、環境変数                              |
| `contracts/*.sol`                        | スマートコントラクト本体（LabDAO、LabRegistry など）。                                                       | Hardhat (`hardhat.config.ts`)、テスト (`test/`)                       |
| `ignition/modules/AcademicRepository.ts` | Hardhat Ignition のデプロイレシピ。Timelock/DAO/ArtifactRegistry のロール設定を一括で行います。              | `contracts/*.sol`、Ignition runtime                                   |
| `scripts/*.ts`                           | 運用スクリプト群。`storacha-bootstrap`・`verify-staging`・`sync-events` などが含まれます。                   | Hardhat、viem、`docs/runbooks/*`                                      |
| `prisma/schema.prisma`                   | データモデル。`npm run prisma:generate` で TypeScript 型を生成し、API が型安全に DB を扱えるようにします。   | Postgres (または Supabase)                                            |
| `.github/workflows/ci.yml`               | GitHub Actions の CI。Lint → セキュリティ lint → compile → test → Slither を順番に実行します。               | `package.json` のスクリプト                                           |

これらのモジュールは階層構造になっていて、**UI 層 → API 層 → サーバーライブラリ → 外部サービス（DB / ブロックチェーン）** の向きで依存しています。逆方向の依存は原則ありません。

---

## 5. 代表的なユースケースと手順

### 5.1 フロントエンドを動かす

1. `.env` で `NEXT_PUBLIC_*` の RPC URL と WalletConnect プロジェクト ID を設定。
2. `npm run dev` を起動。
3. ブラウザで http://localhost:3000 を開き、ウォレット接続や各パネルの操作を試します。

### 5.2 スマートコントラクトを編集・検証

1. `contracts/` の Solidity ファイルを変更。
2. `npm run compile` で ABI を再生成。
3. `npm run test` で Hardhat テストを実行。
4. デプロイ確認が必要なら `npx hardhat ignition deploy ./ignition/modules/AcademicRepository.ts --network hardhat` のように実行（任意）。

### 5.3 環境変数のサニティチェック

1. `.env` を最新化（Storacha、ArtifactRegistry、CredentialAnchor の値をセット）。
2. ローカルでのみ検証する場合は `STAGING_MODE=local npm run verify:staging`。
3. CLI や RPC が未整備なら `STAGING_MODE=dry-run npm run verify:staging` で形式チェックだけ行う。

### 5.4 データ同期ジョブを動かす

1. `EVENT_SYNC_FROM_BLOCK` を `.env` で設定。
2. `npm run data:sync` を実行すると、ArtifactRegistry のイベントを取り込み、`ActivityLog` に反映します。

---

## 6. よく使うスクリプト早見表

| スクリプト                   | 目的                                     | 補足                                                |
| ---------------------------- | ---------------------------------------- | --------------------------------------------------- |
| `npm run dev`                | Next.js 開発サーバー。                   | Turbopack を使用。API ルートも同時に起動します。    |
| `npm run compile`            | Hardhat で Solidity をコンパイル。       | `artifacts/` と `typechain-types/` が更新されます。 |
| `npm run test`               | Hardhat のテスト。                       | Mocha/Chai/viem ベース。                            |
| `npm run lint`               | Next.js ESLint。                         | App Router のルールに対応。                         |
| `npm run lint:security`      | ESLint Security プラグイン。             | API レイヤーの脆弱性検知に利用。                    |
| `npm run storacha:bootstrap` | Storacha Space/鍵/委譲 UCAN の自動生成。 | `--dry-run` でランダム値を取得。                    |
| `npm run verify:staging`     | 環境変数とコントラクト配置の検証。       | `STAGING_MODE` で挙動を切り替え。                   |
| `npm run data:sync`          | On-chain イベントを ActivityLog に同期。 | Supabase/Postgres との連携を確認。                  |

---

## 7. 困ったときのチェックリスト

1. **環境変数が読み込まれない** → `.env` がルート直下にあるか確認し、`npm run dev` 再起動後に `process.env.*` が参照できるかをチェック。
2. **Prisma の型が未生成** → `npm run prisma:generate` を実行したかどうか確認。生成物は `node_modules/.prisma` と `@prisma/client` に出力されます。
3. **ウォレット接続でエラー** → `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` と RPC URL を正しく設定し、ブラウザのローカルストレージをクリア。
4. **Storacha CLI が見つからない** → `npm install -g @storacha/cli` を実行し、`storacha --help` が動くか確かめる。CLI が使えない環境では `--dry-run` モードで代替。
5. **CI とローカルの結果が異なる** → `npm run lint && npm run compile && npm run test` をまとめて実行し、コミット前に整合性を取る。

---

## 8. 次のステップ

- スプリントのロードマップは `plans.md` を参照してください。各セッションで更新され、完了/未着手のタスクが整理されています。
- 監視や運用手順は `docs/monitoring-plan.md`、Storacha の詳細手順は `docs/runbooks/storacha-cli.md` にまとまっています。
- コードを読み進める際は、UI → API → サーバー → スマートコントラクトの順に確認すると依存関係が追いやすくなります。

このガイドが、プロジェクトへのスムーズな参加の一助になれば幸いです。わからない点があれば Issue やメモに残し、次回のセッション時に共有してください。
