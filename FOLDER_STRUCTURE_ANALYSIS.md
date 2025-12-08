# 📁 フォルダ構成整理ガイド

## 現在の構成（実際）

```
AcademicRepository/
├── 🔗 Root Project (Next.js)
│   ├── src/                      ← Next.js ソース
│   │   ├── app/                  ✅ Pages (App Router)
│   │   ├── lib/                  ✅ Utilities
│   │   └── server/               ✅ API/Backend
│   ├── contracts/                ✅ Solidity
│   ├── scripts/                  ✅ Hardhat スクリプト
│   ├── test/                     ✅ テスト
│   ├── prisma/                   ✅ DB スキーマ
│   └── ignition/                 ✅ Hardhat Ignition
│
├── 🎨 academic-chain/            ← Vite + React UI (独立)
│   ├── src/                      ✅ React ソース
│   ├── public/                   ✅ アセット
│   └── vite.config.ts            ✅ ビルド設定
│
├── 📚 academic-repository/        ← リポジトリ/ドキュメント
│
└── 📖 Configuration & Docs
    ├── docs/                     ✅ 仕様書
    ├── .github/                  ✅ GitHub設定
    ├── .vscode/                  ✅ VSCode設定
    └── 各種 config ファイル
```

## ✅ 現在の構成は **正しい**

### 理由:

1. **2つのフロントエンドの分離**
   - **Root (Next.js)**: バックエンド統合UI / ガバナンス管理
   - **academic-chain (Vite)**: スタンドアロン DAO プラットフォーム UI

2. **各 `src/` は独立**
   - Root の `src/` は Next.js アプリ
   - academic-chain の `src/` は React アプリ
   - 競合なし

3. **フォルダ配置は標準的**
   - `contracts/`, `scripts/`, `test/` は一般的な Hardhat 構成
   - `prisma/` は標準的な配置
   - `docs/` は慣例的な位置置

## 🧹 不要なファイル（既に無視されている）

```
.next/              → Next.js ビルド出力（.gitignore ✅）
artifacts/          → Hardhat 生成ファイル（.gitignore ✅）
cache/              → Hardhat キャッシュ（.gitignore ✅）
typechain-types/    → 自動生成ファイル（.gitignore ✅）
.DS_Store           → macOS システムファイル（.gitignore ✅）
```

## 🎯 推奨事項

### 現在の構成で問題ない場合:
✅ そのままで問題ありません

### 以下のように変更する場合:

#### **Option A: academic-chain を分離**
もし academic-chain を完全に独立したプロジェクトにしたい場合:

```bash
# academic-chain/package.json の "dev" スクリプトで起動
cd academic-chain && npm run dev
```

#### **Option B: フロントエンドを統一**
もし1つの React アプリに統一したい場合:

```bash
# academic-chain/ を削除し、src/ に統合
rm -rf academic-chain/
# その後 src/app/ を Vite または別フレームワークに変更
```

### 現在の推奨: **Option A を継続**

理由:
- ✅ 2つのアーキテクチャを活用できる
- ✅ 独立したビルド・デプロイが可能
- ✅ マイクロフロントエンドの基盤になる

## 📋 チェックリスト

- ✅ Root `src/` は Next.js 用（正しい）
- ✅ academic-chain `src/` は React 用（正しい）
- ✅ Solidity コントラクトは `contracts/` に配置（正しい）
- ✅ テストは `test/` に配置（正しい）
- ✅ ドキュメントは `docs/` に配置（正しい）
- ✅ 重複なし
- ✅ `.gitignore` で生成ファイルを除外

## 🚀 結論

**プロジェクト構造は適切に整理されています！**

さらに詳細な整理が必要な場合は、以下を教えてください:
1. 何が「メチャクチャ」に見えるのか具体的な場所
2. どの構成に統一したいのか（NextOnly / ViteOnly / Current）
3. 特定のファイルが置きたい場所
