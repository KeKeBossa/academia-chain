# Academic Blockchain Repository 仕様書

## 0. ドキュメントメタデータ
| 項目 | 内容 |
| --- | --- |
| ドキュメント名 | Academic Blockchain Repository – フルスタック分散型研究プラットフォーム仕様書 |
| バージョン | v0.9.0 (ドラフト) |
| 作成日 | 2025-11-12 |
| 作成者 | AcademicRepository 開発チーム |
| 対象リリース | MVP (2026-01-20 予定) |
| 格納場所 | `/docs/academic-repository-spec.md` |
| 参照元 | `README.md`, `plans.md`, `prisma/schema.prisma`, `contracts/*.sol`, `src/app/**/*`, `docs/handbook/*` |

---

## 1. 背景と目的
- 学部卒業研究として、研究室横断の共同研究・査読プロセスを透明化する分散型アプリケーション (dApp) を実装する。
- 分散型ID (DID)、DAO ガバナンス、IPFS を組み合わせ、研究資産の信頼性と追跡性を高める。
- 最終成果物は Next.js + Prisma + Hardhat を用いたフルスタック MVP、および本仕様書を含む卒業論文とする。

### 1.1 解決したい課題
1. 研究成果の真正性・改竄耐性確保 (IPFS + on-chain アンカー)
2. 研究室間の意思決定透明化 (LabDAO ガバナンス)
3. ウォレット/DID ベースの認証により学外連携を安全に拡張
4. レピュテーション・通知機構による共同研究マッチング効率化

### 1.2 成果指標 (2026-01-20 まで)
- DID 認証成功率 99%以上 (10分以内の再発行含む)
- 提案→投票→実行フローの E2E デモ完遂
- 研究資産 30件、コラボレーション投稿 10件をシードデータで再現
- Prisma / Hardhat / Next.js の lint/test/build が CI で常時グリーン

---

## 2. ステークホルダーと利用者像
| ロール | 主要ペルソナ | 権限/目的 |
| --- | --- | --- |
| DAO 管理者 (Lab Admin) | 研究室代表、ラボ秘書 | ラボ登録、メンバー承認、提案キックオフ、環境変数管理 |
| 研究者 (Advisor/Student) | 修士/博士学生、ポスドク | ウォレット接続、論文登録、投票、レビュー投稿 |
| コラボ支援 (Operator) | 共同研究調整担当 | コラボ募集、通知配信、メトリクス監視 |
| 観測者 (Guest) | 他大学研究者、産学連携担当 | 公開アセット閲覧、DAO トークン獲得準備 |

---

## 3. 要件定義
### 3.1 機能要件 (F)
1. **F-Auth-1**: `/api/auth/did/*` による DID チャレンジ発行・署名検証 (SIWE 互換)。
2. **F-Wallet-1**: RainbowKit + wagmi によるウォレット接続 UI を `src/app/page.tsx` で提供。
3. **F-DAO-1**: `LabDAO` スマートコントラクトで投票設定 (遅延・期間・閾値・クオーラム) を動的制御。
4. **F-Registry-1**: `LabRegistry` による DAO メタデータ登録、`LabCredentialAnchor` で VC ハッシュ固定。
5. **F-Asset-1**: `ResearchAsset` API (`src/app/api/assets`) で IPFS CID と on-chain Artifact 登録。
6. **F-Review-1**: `Review` モデルと `ActivityLog` により査読履歴追跡。
7. **F-Collab-1**: `CollaborationPost` 作成/公開/募集状態を UI + API で管理。
8. **F-Notification-1**: `Notification` モデルと `Notifications` コンポーネントでリアルタイム通知 UI (未読バッジ) を提供。
9. **F-Admin-1**: `/api/admin/metrics` (計画中) と `docs/monitoring-plan.md` に沿ったモニタリング。
10. **F-Script-1**: `scripts/deploy.ts`, `scripts/verify-staging.ts`, `scripts/sync-events.ts` による DevOps 自動化。

### 3.2 非機能要件 (NF)
| 区分 | 要件 |
| --- | --- |
| パフォーマンス | Prisma API 応答 300ms 以内、ウォレット接続 UI 初期描画 < 2s (Turbopack dev モード)。 |
| 可用性 | Postgres を Docker で再起動しても Prisma 再接続可能；Hardhat ノード障害時は Ignition で再デプロイ可能。 |
| セキュリティ | AES-256-GCM で VC メタデータ暗号化 (`src/server/security/crypto.ts`)、Rate Limit (`RATE_LIMIT_MAX`) を API に適用。 |
| 拡張性 | Prisma enum/リレーションを追加しても API 層が型安全に保たれる構造。 |
| 運用性 | `npm run lint && npm run compile && npm run test && npm run build` を CI 必須ジョブとして文書化。 |
| 監査性 | ActivityLog で提案/資産/通知イベントを履歴化し、`EventSyncState` でチェーン同期ブロックを保持。 |

---

## 4. アーキテクチャ概要
```
ブラウザ (RainbowKit, Radix UI, Tailwind)
  │
  │ Next.js App Router (`src/app`)
  ▼
API ルート (`src/app/api/*`) ── Prisma Client (`src/server/db/client.ts`)
  │                                         │
  │                                         └─ PostgreSQL / Supabase (`prisma/schema.prisma`)
  │
  ├─ Storacha / Web3.Storage (IPFS CID 保存)
  ├─ Hardhat/viem クライアント (`src/server/blockchain/*`)
  └─ スマートコントラクト (Polygon Amoy / Sepolia):
        LabDAO / LabRegistry / ArtifactRegistry / CredentialAnchor
```
- UI: `src/app/components/academia/*` と `AcademicChainPreview` がダッシュボード状態遷移を表現。
- 状態管理: React Hooks + wagmi + RainbowKit。Zustand は将来導入予定 (依存のみ)。
- API 層: Next.js Route Handlers、Prisma ORM、`ensureSeedData()` によるシード投入。
- Web3 層: `viem` による署名検証 / トランザクション送信。

---

## 5. モジュール構成
| モジュール | ディレクトリ | 説明 |
| --- | --- | --- |
| フロントエンド App | `src/app` | App Router, layout/providers, `page.tsx` でタブ UI と通知。 |
| UI コンポーネント | `src/app/components/academia/*`, `components/ui/*` | Dashboard, Repository, Seminars, Projects, Governance, Profile, Notifications, Settings, Search。 |
| DID 認証 | `src/app/api/auth/did/*`, `src/server/auth/*` | チャレンジ生成、署名検証、セッショントークン発行。 |
| 資産管理 | `src/app/api/assets/*`, `src/server/blockchain/artifactRegistry.ts` | IPFS CID 登録、on-chain ArtifactRegistry 呼び出し。 |
| DAO/提案 | `contracts/LabDAO.sol`, `test/labDao.ts` | OpenZeppelin Governor 拡張。 |
| レジストリ | `contracts/LabRegistry.sol`, `contracts/CredentialAnchor.sol` | LAB メタデータ、VC ハッシュ記録。 |
| スクリプト | `scripts/*.ts`, `ignition/modules/*.ts` | Hardhat デプロイ、Ignition モジュール、Storacha 秘密情報。 |
| データ | `prisma/schema.prisma`, `src/server/data/seed.ts` | 17 モデル + Enum、seed ロジック。 |
| ドキュメント | `README.md`, `docs/handbook`, `docs/monitoring-plan.md`, 本仕様書 | 学習用・運用用資料。 |

---

## 6. データモデル概要 (Prisma)
| モデル | 主キー & 主要属性 | 用途 |
| --- | --- | --- |
| `User` | `id (cuid)`, `walletAddress`, `did`, `role`, `profile (Json)` | ウォレット主体、DID、役割、セッション/通知関連。 |
| `Credential` | `id`, `userId`, `type`, `hash`, `status` | VC ステータス。`encryptJson` でメタデータ暗号化。 |
| `Dao` | `id`, `name`, `metadataCid`, `governanceConfig` | ラボ DAO。 |
| `DaoMembership` | `id`, `userId`, `daoId`, `role`, `weightOverride` | ラボ内の役職・投票重み。複合ユニーク (`userId`,`daoId`)。 |
| `Proposal` | `id`, `daoId`, `onchainId`, `status`, `votingWindow*`, `snapshotBlock` | ガバナンス提案、生データと on-chain ID の橋渡し。 |
| `Vote` | `id`, `proposalId`, `voterId`, `weight`, `choice`, `txHash` | 投票記録。 |
| `ResearchAsset` | `id`, `daoId`, `ownerId`, `ipfsCid`, `artifactHash`, `visibility`, `metadata` | IPFS リンク、ArtifactRegistry ハッシュ。 |
| `Review` | `id`, `assetId`, `reviewerId`, `status`, `comment` | 査読結果。 |
| `CollaborationPost` | `id`, `daoId`, `authorId`, `status`, `requiredSkills` | 共同研究募集。 |
| `Notification` | `id`, `userId`, `type`, `payload`, `readAt` | UI 通知。 |
| `ActivityLog` | `id`, `daoId`, `type`, `metadata`, `proposalId/assetId/actorId` | 監査ログ。 |
| `DidAuthChallenge` / `DidSession` | SIWE チャレンジとセッショントークン。 |
| `EventSyncState` | `source`, `lastProcessedBlock` | チェーンイベント同期進捗。 |

- Enum: `MembershipRole`, `CredentialStatus`, `ProposalStatus`, `VoteChoice`, `AssetVisibility`, `ReviewStatus`, `CollaborationStatus`, `ActivityType`。
- 参照整合性: 主要リレーションに `onDelete: Cascade` (User/Dao/Proposal 等) を設定し、孤児データを排除。

---

## 7. スマートコントラクト仕様
| コントラクト | 主要機能 | セキュリティ/ロール |
| --- | --- | --- |
| `LabDAO.sol` | OpenZeppelin Governor 拡張: `votingDelay`, `votingPeriod`, `proposalThreshold`, `quorum`, Timelock 実行。 | TimelockController と紐付け。`GovernorVotesQuorumFraction` でクオーラム可変。 |
| `LabGovernorToken.sol` | ERC20Votes。`MINTER_ROLE` を Timelock に付与し、投票権をオンチェーン配布。 | AccessControl により `mint`/`burn` 制限。Permit/Nonces 対応。 |
| `LabRegistry.sol` | DAO ラボ登録。`Lab` 構造体 (`name`, `dao`, `metadataCid`)。 | `DEFAULT_ADMIN_ROLE` がラボ登録、`LAB_ADMIN_ROLE` がメタデータ更新。 |
| `ArtifactRegistry.sol` | IPFS CID + `artifactHash` + `proposalId` を on-chain 追跡。 | `REGISTRAR_ROLE` のみ登録可能。イベント `ArtifactRegistered`。 |
| `CredentialAnchor.sol` | DID/VC ハッシュと `labId` のマッピング、失効管理。 | `REGISTRAR_ROLE` が `recordCredential`/`revokeCredential` 実行。 |
| `ResearchVault.sol` (mock) | テスト用ストレージ。 | Timelock のみ `setValue` 可。Hardhat テストで Governor を検証。 |

Ignition モジュール `AcademicRepositoryModule` は、LabRegistry → GovernanceToken → Timelock → LabDAO → ArtifactRegistry → CredentialAnchor を一括デプロイし、Timelock 役割を設定する。

---

## 8. コアフロー
### 8.1 DID 認証 (SIWE)
1. クライアントが `/api/auth/did/challenge` に `walletAddress`, `did` を送信。
2. `createDidAuthChallenge` が SIWE 互換メッセージを生成し、`DidAuthChallenge` を保存。TTL=600秒。
3. ユーザがウォレットで署名し、`/api/auth/did/verify` に `signature` を送信。
4. `verifyWalletSignature` が `viem` で検証、`issueSessionToken` が 12 時間有効の `DidSession` を発行。
5. `DidSession.token` は Next.js Route Handler の `Authorization` ヘッダとして利用予定 (今後拡張)。

### 8.2 研究資産登録
1. UI: Repository タブで `ipfsCid`, `title`, `daoId` を入力。
2. API: `/api/assets` `POST` が Prisma で `ResearchAsset` を生成し、`ActivityLog` に `RESEARCH_ASSET_REGISTERED` を記録。
3. オプション: `labId` & `proposalOnchainId` が指定されると `registerArtifactOnChain` が ArtifactRegistry へトランザクション送信 (Polygon Amoy/ Sepolia RPC)。
4. 応答で on-chain TX ハッシュ (任意) を返却し、UI バッジを表示。

### 8.3 DAO 提案 & 投票
1. 管理者が LabDAO へ `propose`、Timelock が `queue/execute` 管理。
2. Hardhat テスト `test/labDao.ts` では `advanceBlocks` と `increaseTime` でブロック/時間経過をシミュレートし、`ResearchVault` 更新で成功判定。
3. Prismadb の `Proposal`/`Vote` は off-chain UI 表示・通知に使う。

### 8.4 コラボレーション & 通知
1. `CollaborationPost` 作成時に `ActivityLog` + `Notification` (対象メンバー) を作成。
2. UI `Notifications` パネル (`page.tsx`, `NotificationPopup.tsx`) が未読件数を表示し、行動ボタン (投票・成果確認) を提供。

---

## 9. UI / UX 仕様
- **タブ構成**: Dashboard / Notifications / Search / Repository / Seminars / Projects / Governance / Profile (`navItems`).
- **AcademicChainPreview**: ランディングでウォレット擬似接続→ダッシュボード→タブ切替を再現。モックデータ (論文12件、ゼミ参加3件、DAOトークン850 等) を表示。
- **Dashboard.tsx**: Stats カード、最新論文リスト (検証済バッジ)、イベントタイムライン。
- **Repository.tsx**: IPFS/Tx 情報表示、タグ/ダウンロード数/被引用数をカード化。
- **Governance.tsx**: 提案ステータス (active/pending) 表、賛否票数、クオーラム、締切日を表示。
- **Profile.tsx**: DID, 大学所属、レピュテーション、実績タイムライン、スキルレーダー。
- UI テック: Tailwind CSS (custom theme), Radix UI (Popover/Dialog/Avatar), Lucide icons, Sonner トースト。
- デザイン原則: 2 カラム + カード UI、`bg-slate-900/indigo` の暗色テーマ。

---

## 10. API エンドポイント一覧 (抜粋)
| メソッド | パス | 機能 | 備考 |
| --- | --- | --- | --- |
| POST | `/api/auth/did/challenge` | DID チャレンジ発行 | `walletAddress`, `did`, `statement` |
| POST | `/api/auth/did/verify` | 署名検証・セッション作成 | `signature`, `nonce`, `expiresInSeconds` |
| GET | `/api/assets?daoId=&ownerId=&visibility=` | 研究資産一覧 | `ensureSeedData()` を初回実行 |
| POST | `/api/assets` | 研究資産登録 + (任意) on-chain 登録 | `labId` 指定で ArtifactRegistry 連携 |
| POST | `/api/assets/upload` (予定) | IPFS 連携 | Storacha 仕組み実装予定 |
| GET | `/api/daos/*` | DAO メタデータ/メンバー | Prisma join 予定 |
| POST | `/api/collaboration/posts` | 共同研究投稿 | `requiredSkills` (string[]) |
| GET | `/api/notifications` | 通知フィード | `readAt` null を未読と扱う |
| POST | `/api/session/revoke` | セッショントークン失効 | `revokeSession()` を利用 |

API ハンドラは Next.js Route Handler (Edge-ready) で書かれ、将来的にミドルウェアでセッション検証予定 (`src/app/api/middleware.ts`)。

---

## 11. セキュリティ & プライバシー
1. **暗号化**: VC メタデータは AES-256-GCM + `VC_ENCRYPTION_SECRET`。IV 12byte, AuthTag 16byte。
2. **署名検証**: `viem/verifyMessage` によりチェーン非依存で SIWE メッセージを検証。
3. **アクセス制御**: コントラクトは `AccessControl` で最小権限。Timelock は `DEFAULT_ADMIN_ROLE` をデプロイヤから剥奪。
4. **レート制限**: `.env` で `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` を設定、API ルートで `express-rate-limit` を適用 (実装予定)。
5. **秘密管理**: Storacha 資格情報/PrivateKey は `.env` もしくは AWS Secrets Manager (scripts/storacha-*.ts) に保管。
6. **監査ログ**: `ActivityLog` とチェーンイベント (ArtifactRegistered) を突合できるよう `artifactHash` (keccak256) を生成。

---

## 12. 環境変数と設定
| 変数 | 用途 |
| --- | --- |
| `DATABASE_URL` | Prisma/Postgres 接続。 |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | RainbowKit WalletConnect。 |
| `NEXT_PUBLIC_POLYGON_AMOY_RPC_URL` / `NEXT_PUBLIC_SEPOLIA_RPC_URL` | wagmi/viem RPC。 |
| `SEPOLIA_RPC_URL` / `POLYGON_AMOY_RPC_URL` | Hardhat + サーバー側 viem クライアント。 |
| `SEPOLIA_PRIVATE_KEY` / `POLYGON_AMOY_PRIVATE_KEY` | Hardhat デプロイ/テスト送信用。 |
| `VC_ENCRYPTION_SECRET` | AES 暗号キー由来。 |
| `GOVERNOR_*` (DELAY/VOTING/QUORUM/THRESHOLD) | `scripts/deploy.ts` と Ignition パラメータ。 |
| `GOVERNANCE_DEFAULT_ADMINS/PROPOSERS/EXECUTORS` | Timelock Role 付与リスト (カンマ区切り)。 |
| `ARTIFACT_REGISTRY_ADDRESS/PRIVATE_KEY/RPC_URL` | サーバー側 ArtifactRegistry 書き込み。 |
| `CREDENTIAL_ANCHOR_ADDRESS` | 将来の VC 更新 API で使用予定。 |
| `STORACHA_*` | Web3.Storage (Storacha) 認証。 |
| `SUPABASE_URL` / `SUPABASE_*_KEY` | メトリクス同期/通知配信先。 |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | API レート制御。 |

Docker: `docker-compose.yml` で Postgres 16。データ永続化は `./.docker/postgres/data`。Healthcheck 5 秒間隔。

---

## 13. DevOps / ビルドパイプライン
1. **ローカル開発**: `npm install` → `.env` → `npm run prisma:generate` → `npm run dev`。
2. **Lint & Format**: `npm run lint`, `npm run format:check`, `lint-staged` で commit 前に実行。
3. **Solidity**: `npm run compile`, `npm run test` (Hardhat, Mocha/Chai, viem)。Optimizer on, viaIR, EVM Cancun。
4. **デプロイ**: `npx hardhat ignition deploy ./ignition/modules/AcademicRepository.ts --network polygonAmoy` または `scripts/deploy.ts`。
5. **環境検証**: `npm run verify:staging` (Storacha & コントラクトアドレスチェック)。
6. **イベント同期**: `npm run data:sync` で ArtifactRegistry イベント→Postgres。`EventSyncState` で再開ブロック管理。

---

## 14. テスト戦略
| レイヤー | ツール | 内容 |
| --- | --- | --- |
| スマートコントラクト | Hardhat + Mocha/Chai (`test/labDao.ts`) | Timelock 付き提案実行シナリオ、顧客ロール検証。 |
| API/サーバー | Jest/Supertest (予定) | `src/app/api` 各ルートの Happy/Edge パス。 |
| UI | Storybook/Playwright (ロードマップ) | RainbowKit UI、ダッシュボードコンポーネント。 |
| 静的解析 | ESLint (`npm run lint`, `npm run lint:security`), Solhint | Solhint + Slither (Docker) を計画中。 |
| E2E | Manual smoke | WalletConnect、提案ワークフローの手動検証。 |

---

## 15. 監視・運用
- `docs/monitoring-plan.md` に従い、API スループット、提案ステータス、資産投稿数、EventSyncState を収集。
- `/api/admin/metrics` から Prometheus 形式を返却 (実装 TODO)。Grafana で DAO 健康度ダッシュボード提供予定。
- セキュリティコマンド: `npm run security:contracts` (Slither Docker)、`npm run lint:security`。
- Runbook: `docs/runbooks/storacha-cli.md` に Storacha CLI 手順、`docs/handbook/beginner-guide.md` にセットアップ手順。

---

## 16. ロードマップ (抜粋)
| マイルストーン | 期限 | 主要 Deliverable |
| --- | --- | --- |
| M0 基盤セットアップ | 2025-10-27 ✅ | Next.js UI + Hardhat + Prisma 骨子、CI lint/test 通過 |
| M1 認証 & DAO コア | 2025-11-17 | DID セッション API、LabRegistry/LabDAO デプロイ、メンバー承認 UI |
| M2 研究資産 & ガバナンス | 2025-12-15 | 提案ライフサイクル UI、ArtifactRegistry/IPFS ワークフロー、Supabase メタデータ |
| M3 コラボ & 運用整備 | 2026-01-20 | コラボ投稿/通知/管理ダッシュボード、監視/セキュリティテスト |

---

## 17. 卒論構成への適用例
1. **序章**: 背景と課題 (本仕様書 §1-2)。
2. **関連研究**: DID/DAO/IPFS の先行事例比較 (README + 文献調査を追加)。
3. **システム設計**: 本文 §3-11 を章立てに展開し、図 (アーキ・フロー) を再利用。
4. **実装**: UI/ API/ コントラクト別に具象コード例を抜粋 (`page.tsx`, `LabDAO.sol`, `prisma/schema.prisma`)。
5. **評価**: テスト戦略 §14 とメトリクス §15 を基に、性能/安全性評価を実験結果として整理。
6. **結論と今後の課題**: ロードマップ §16 とセキュリティ/監視 TODO を考察として記述。

---

## 18. 付録
- **参考コマンド**
  - `npm run dev`, `npm run build`, `npm run lint`, `npm run compile`, `npm run test`, `npm run data:sync`
- **主要ファイル一覧**
  - フロント: `src/app/page.tsx`, `src/app/components/AcademicChainPreview.tsx`
  - API: `src/app/api/assets/route.ts`, `src/app/api/auth/did/*`
  - サーバー: `src/server/auth/*.ts`, `src/server/blockchain/artifactRegistry.ts`
  - データ: `prisma/schema.prisma`, `src/server/data/seed.ts`
  - コントラクト: `contracts/*.sol`, `ignition/modules/AcademicRepository.ts`
  - テスト: `test/labDao.ts`

本仕様書は、UI/スマートコントラクト/API/データ/運用の観点を統合した卒業論文向けドキュメントであり、以後の改訂時にはバージョンと日付を更新し、`plans.md` にリンクを追記すること。
