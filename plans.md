# Academic Blockchain Repository – デリバリープラン

最終更新: 2025-10-27（セッション10）

## 1. ビジョンの概要

- ウォレット/DIDベースのアクセス、提案ガバナンス、研究資産の検証可能な共有をラボ間で実現するDAO駆動型の学術リポジトリを構築する。
- 仕様で定義された機能要件（認証、DAO、資産、コラボレーション、管理）および非機能要件を満たすMVPを3か月以内（2026-01-20まで）に提供する。
- 統一されたTypeScriptスタック（Next.js、Hardhat、Prisma）を維持し、Polygon Amoyテストネットとの互換性を確保する。

## 2. マイルストーンとハイレベルスコープ

| マイルストーン                          | 目標日     | ゴール                                                                                                                         | 成功指標                                                                                                                                                  |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M0 – 基盤セットアップ**               | 2025-10-27 | フルスタックのワークスペースをスキャフォールドし、ツールチェーンを構成し、迅速な反復のためのコアモジュールのスタブを用意する。 | Next.js + Tailwind + RainbowKitのブートストラップ、ベースコントラクトを備えたHardhatワークスペース、Prismaスキーマの骨子、CIのlint/testジョブがグリーン。 |
| **M1 – 認証とDAOコア**                  | 2025-11-17 | ウォレット+DIDセッションフローを実装し、LabRegistry/LabDAOスマートコントラクトのベースラインをデプロイする。                   | ウォレット接続とDID署名検証のエンドツーエンド対応、LabRegistryデプロイスクリプト、メンバーを審査・承認するDAOメンバーシップUI。                           |
| **M2 – 研究資産とガバナンス**           | 2025-12-15 | 提案ライフサイクルとIPFSを活用した研究資産ワークフローを実装する。                                                             | 提案の作成/投票/実行フロー、ArtifactRegistryとの連携、資産アップロードとレビューUI、稼働中のSupabaseメタデータストレージ。                                |
| **M3 – コラボレーションと運用体制整備** | 2026-01-20 | コラボレーションツール、通知、管理ダッシュボード、テスト強化を仕上げる。                                                       | コラボレーション投稿、アクティビティフィード、通知チャネル、管理ダッシュボード、自動テストカバレッジとデプロイドキュメントが整備完了。                    |

## 3. ワークストリームとリード

- **フロントエンド（Next.js / UI）** – ウォレット認証、ダッシュボード、UX、アクセシビリティ。
- **スマートコントラクト（Hardhat）** – LabRegistry、LabDAO、ArtifactRegistry、CredentialAnchor。
- **バックエンド & データ（API/Prisma）** – DID検証API、Supabase連携、キューワーカー。
- **DevOps & QA** – CI/CD、環境構成、テスト/ツール、セキュリティスキャン。

## 4. 現在のイテレーション（スプリント 2025-10-20 → 2025-10-31）

| 分野                 | タスク                                                                                                                           | 担当 | ステータス | メモ                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| ツーリング           | `src/app`配下にTailwind、RainbowKit、wagmi、Chakra UI、基本レイアウト/ページを備えたNext.js App Routerプロジェクトを初期化する。 | TBD  | ✅ Done    | レイアウト、プロバイダー、ウォレット接続UIを備えたヒーローランディングをスキャフォールド済み。                                                       |
| ツーリング           | TypeScript対応、OpenZeppelin依存、サンプルコントラクト、スクリプト構成を備えたHardhatプロジェクトをセットアップする。            | TBD  | ✅ Done    | コントラクトの骨子とHardhat設定、ignitionモジュール、デプロイスクリプトを準備済み。                                                                  |
| ツーリング           | データモデルに合わせたPrismaスキーマを構成し、Supabase/Postgresへ環境変数経由で接続し、マイグレーションを生成する。              | TBD  | ✅ Done    | Prismaスキーマを確立し、環境変数テンプレートを更新、クライアントを生成（`npx prisma generate`）。                                                    |
| ツーリング           | コード品質を担保するためにlint、フォーマット、Husky/pre-commit（ESLint、Solhint任意）を追加する。                                | TBD  | ✅ Done    | `core.hooksPath`を`.githooks/pre-commit`に設定し、`npm run lint:staged`を実行；フォールバック手順をドキュメント化。                                  |
| ツーリング           | `npm install`、`npm run lint`、`npx hardhat compile`でツールチェーンを検証する。                                                 | TBD  | ✅ Done    | Node 20.19.0 で再実行し、エンジン警告なしで依存関係同期とLint/Hardhatの確認を完了（2025-10-22）。                                                    |
| フロントエンド       | Node 20.19.0 環境で `npm run dev` をローカル実行し、UIと環境変数依存の挙動を検証する。                                           | TBD  | ⏳ 未着手  | サンドボックスではポートバインディングが拒否されたため、ホスト環境での手動確認が必要。                                                               |
| フロントエンド       | 「Academic Chain」Viteデザインのウォレット接続UIをランディング直下に組み込み、RainbowKit/Tailwind構成へ統合する。                | TBD  | ✅ Done    | `src/app/components/AcademicChainPreview.tsx` を新設し、`page.tsx` のヒーロー直後に配置。ウォレット接続モックとDAO/研究UIプレビューを提供。          |
| ドキュメント         | セットアップ、環境変数、開発コマンドを扱うREADMEセクションをドラフトする。                                                       | TBD  | ✅ Done    | README.mdがアーキテクチャ、コマンド、環境変数、APIスキャフォールドを網羅。                                                                           |
| 認証                 | DID署名チャレンジ、セッショントークン、VC検証APIを実装しUIと統合する（F-Auth-1/2/3）。                                           | TBD  | ✅ Done    | `/api/auth/did/challenge` / `verify` / `credentials` を実装し、DIDデモパネルでエンドツーエンド検証を実装。                                           |
| DAO                  | ガバナンスコントラクト、投票重み、タイムロック実行、テストを仕上げる（F-DAO-1→F-DAO-4）。                                        | TBD  | ✅ Done    | `LabDAO`をGovernorベースに刷新し、Timelock/Token/Hardhatテストを追加 (`test/labDao.ts`)。                                                            |
| 資産                 | IPFSアップロード、ArtifactRegistry連携、レビュー/コメントフローを整備する（F-Asset-1→F-Asset-3）。                               | TBD  | ✅ Done    | Web3.Storage連携API、ArtifactRegistry書き込み、レビュー＆コメントAPI/デモパネルを追加。                                                              |
| フロントエンド       | DIDパネルと研究資産パネルをライブDAO/メンバーデータに接続し、デモ操作を自動入力できるようにする。                                | TBD  | ✅ Done    | React Query 経由でDAO/メンバー/VC一覧を取得し、フォームをドロップダウン化。                                                                          |
| フロントエンド       | `Academic Chain`のVite UI資産をNext.js (`src/app/page.tsx`)へ移植し、Radix/Tailwindベースのフロントデザインを統一する。          | TBD  | ✅ Done    | `src/app/components/academia/*` と `components/ui/*` を追加し、RainbowKit接続状態とナビゲーションを再構成（2025-10-27）。                            |
| DevOps               | Web3.Storage / ArtifactRegistry / CredentialAnchor 用の本番環境変数を検証するスクリプトを追加する。                              | TBD  | ✅ Done    | `npm run verify:staging` でRPC接続・コントラクト配置・ガバナンスパラメータをチェック。                                                               |
| コラボレーション     | 募集投稿、アクティビティフィード、通知連携を実装し共同研究フローを可視化する（F-Collab-1→F-Collab-3）。                          | TBD  | ✅ Done    | `/api/collaboration/posts`・`/api/activity`・通知UIを追加し、ランディングで募集/活動/通知が閲覧可能に。                                              |
| セキュリティ         | VCストレージ暗号化とレート制限を導入し、認証/投稿APIを防御する（F-Sec-1/2）。                                                    | TBD  | ✅ Done    | VCメタデータをAES-256-GCMで暗号化し、認証・資産・募集APIにIPレート制限を適用。                                                                       |
| データパイプライン   | ArtifactRegistryイベントを取り込み、ActivityLogへ同期するワーカー/スクリプトを整備する（F-Data-1）。                             | TBD  | ✅ Done    | `npm run data:sync` でブロックレンジを処理し、`EventSyncState`で同期位置を管理。                                                                     |
| CI/CD                | GitHub Actions で lint/test/compile を自動化し、チェックをデプロイ前に可視化する（F-DevOps-1）。                                 | TBD  | ✅ Done    | `.github/workflows/ci.yml` を追加し Node20 上で `npm run lint` / `compile` / `test` を実行。                                                         |
| 監視                 | メトリクス送信とダッシュボード拡張、アラート閾値を定義する（F-Admin-3）。                                                        | TBD  | ✅ Done    | `/api/metrics` を実装し、CI で `data:sync` と計画アーティファクトを保存。`docs/monitoring-plan.md` に詳細を保持。                                    |
| セキュリティ監査     | コントラクト/フロントエンドの静的解析と脅威モデリングを実施し証跡を残す（F-Sec-3）。                                             | TBD  | ✅ Done    | `lint:security` と `security:contracts` スクリプトを追加し、CI にセキュリティジョブを組み込み。                                                      |
| DevOps               | Storacha CLI で Space/鍵/委譲を発行し、環境変数と Secrets Manager へ登録する運用フローを整備する。                               | TBD  | ✅ Done    | `npm run storacha:bootstrap` に `--dry-run` を追加し CLI 未導入環境でもランダムなテスト値を生成可能に。Runbook も更新し Secrets 各種出力を確認済み。 |
| DevOps               | `npm run verify:staging` を新 Storacha 設定で実行し、本番コントラクト値と整合性を確認する。                                      | TBD  | ✅ Done    | `STAGING_MODE=dry-run` を導入し CLI/RPC なしでフォーマット検証・ログ取得が可能に。`verify:staging:record` からも利用できるようドキュメントを反映。   |
| スマートコントラクト | Ignitionモジュール内の`grantRole`呼び出しに一意IDを付与し、重複エラーを解消する。                                                | TBD  | ✅ Done    | `TimelockGrantProposer`などのIDを追加し、IGN702を防止（2025-10-22）。                                                                                |
| DevOps               | `npx hardhat ignition deploy ignition/modules/AcademicRepository.ts`でローカルデプロイを再検証する。                             | TBD  | ✅ Done    | Hardhat Network上でAcademicRepositoryModuleが成功デプロイ、全ロール操作を完了（2025-10-22）。                                                        |
| DevOps               | GitHub向けのデプロイ対象/除外ファイル整理と一括デプロイコマンドを定義する。                                                      | TBD  | ✅ Done    | `.gitignore`方針を確認し、追跡対象リストと除外リスト、および `git add ... && git push origin main` の手順を文書化。                                  |

凡例: ⏳ 未着手 · 🔄 進行中 · ✅ 完了

### 更新計画（セッション8）

- [x] 既存のChakra使用状況を監査し、Tailwind + RainbowKit構成へ移行する準備を完了（Chakra/Emotion依存を撤去済み）。
- [x] Figmaベースのランディングページと主要コンポーネントをTailwindで再実装（`src/app/page.tsx`と主要パネルを刷新）。
- [x] 未使用コードの整理とドキュメント更新、ビルドの最終検証
  - lint (`npm run lint`) / build (`npm run build`) を完了。Prisma/Storacha 依存はローカルスタブでフォールバックし、README を Tailwind UI 仕様に合わせて更新済み。
- [x] GitHub向けのデプロイ対象/除外ファイル一覧とワンショットデプロイ手順を整理し、plans.md/回答へ反映。

### 更新計画（セッション11）

- [x] `Academic Chain2` UI差分をNext.jsフロントに反映し、Dashboard/Repository/Seminars/Projects/Governance/Profileを最新版のデータモデルとバリデーション（提案作成・研究室登録・論文投稿などのダイアログ、検索フィルター）へアップデート。
- [x] 追加コンポーネント（Search / Notifications / NotificationPopup / Settings）を`src/app/components/academia`へ取り込み、RadixベースのUIプリミティブ（dialog/label/textarea/checkbox/switch/dropdown-menu/popover/scroll-area/separator）と`sonner`トーストを導入。
- [x] `src/app/page.tsx`を通知ポップオーバー、検索クエリ状態、サイドバー新タブ（検索・お知らせ・設定）、RainbowKit接続情報の新UIに合わせて再配線し、`npm run lint`で検証済み。
- [x] Next.jsビルドで発生していた`@react-native-async-storage/async-storage` / `pino-pretty`未解決警告をWebpackエイリアス（`next.config.mjs`）で無視設定し、`npm run build`で解消を確認。

## 5. 今後のバックログ（優先順）

1. CI/CD: GitHub Actionsでlint/test/ハードハットを自動化し、デプロイIDを可視化する（F-DevOps-1）。
2. 監査・静的解析: コントラクト監査フロー、セキュリティスキャン、自動テスト強化を検討する（F-Sec-3）。
3. パフォーマンス監視: メトリクス送信先（Supabase/Prometheus等）との連携とダッシュボード拡張（F-Admin-3）。

## 6. リスクと対策

- **VC統合の複雑さ** – SpruceIDと早期に連携し、本番導入前にローカルでVCフローをモックする。
- **ブロックチェーンイベントのインデックス化** – M1の段階でキューワーカーとイベントリスナーを整備し、ストレッチとしてThe Graphを検討する。
- **IPFSの信頼性** – 冗長性のあるweb3.storageを利用し、メタデータをSupabaseにキャッシュする。
- **スケジュール遅延** – バックログのグルーミングを維持し、MVPスコープを厳守し、非クリティカルな機能は後回しにする。

## 7. 成果物トラッキング

- `plans.md`は各作業セッションの終わりに更新し、タスクのステータス変更を反映する。
- 各マイルストーンの完了時には、デモ、テスト結果、リポジトリガイドラインに沿ったドキュメント更新を満たす。
