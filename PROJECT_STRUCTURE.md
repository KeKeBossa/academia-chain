# プロジェクト構成ガイド

## 📁 ディレクトリ構成の整理

このリポジトリは **ハイブリッドプロジェクト** で、複数の独立したアプリケーションが共存しています。

### 🏗️ 全体構成

```
AcademicRepository/
├── 📦 Root Project (Blockchain + Backend)
│   ├── src/                    ← Next.js フロントエンド
│   ├── contracts/              ← Solidity スマートコントラクト
│   ├── scripts/                ← Hardhat デプロイスクリプト
│   ├── prisma/                 ← データベーススキーマ
│   ├── hardhat.config.ts       ← Hardhat 設定
│   ├── tsconfig.hardhat.json   ← Hardhat TypeScript 設定
│   ├── next.config.mjs         ← Next.js 設定
│   └── package.json            ← Root プロジェクト依存関係
│
├── 🎨 academic-chain/         ← DAO プラットフォーム UI (独立)
│   ├── src/                    ← Vite + React アプリケーション
│   ├── package.json            ← Vite プロジェクト依存関係
│   └── vite.config.ts          ← Vite 設定
│
├── 📚 academic-repository/     ← 既存リポジトリ (アーティファクト)
│   └── index.html              ← 既存ドキュメント
│
├── 🔧 設定ファイル
│   ├── .env.example            ← 環境変数テンプレート
│   ├── .eslintrc.js            ← ESLint 設定
│   ├── tsconfig.json           ← TypeScript 設定
│   └── tailwind.config.ts      ← Tailwind CSS 設定
│
├── 📖 ドキュメント
│   ├── README.md               ← プロジェクト概要
│   ├── AGENTS.md               ← 開発ガイドライン
│   ├── plans.md                ← ロードマップ
│   └── docs/                   ← 仕様書等
│
└── 🐳 インフラストラクチャ
    ├── .docker/                ← Docker 設定
    ├── docker-compose.yml      ← Docker Compose 設定
    └── prisma/                 ← データベース定義
```

## 🔄 プロジェクト間の関係

### 📦 Root Project
- **言語**: TypeScript
- **フロント**: Next.js 14 (App Router)
- **バックエンド**: Node.js + Express (API Routes)
- **DB**: PostgreSQL (Docker)
- **ブロックチェーン**: Hardhat + Solidity
- **主な用途**: ブロックチェーン統合、バックエンド API、認証

### 🎨 academic-chain/
- **言語**: TypeScript
- **フロント**: React 19 + Vite
- **ビルドツール**: Vite
- **CSS**: Tailwind CSS
- **主な用途**: DAO プラットフォームの UI/UX

### 📚 academic-repository/
- **用途**: 既存のドキュメント・リファレンス
- **状態**: 参考資料

## 🚀 開発時の注意点

### ポート管理

```bash
# Root プロジェクト (Next.js)
npm run dev      # ← localhost:3000

# academic-chain (Vite)
cd academic-chain
npm run dev      # ← localhost:5173
```

### 依存関係の管理

各プロジェクトは **独立した `package.json`** を持ちます：

```bash
# Root プロジェクト dependencies をインストール
npm install

# academic-chain dependencies をインストール
cd academic-chain
npm install
cd ..
```

### Git の管理

すべてのプロジェクトは **同一の Git リポジトリ** に統合されています：

```bash
# コミット時は各プロジェクトの変更を含める
git add .
git commit -m "feat: feature description"

# ブランチは統一
git branch -a
```

## 🧹 クリーンアップされた項目

以下のファイルは、マージ操作のためのテンポラリファイルとして削除されました：

- ❌ `GIT_COMMANDS_AFTER_MERGE.sh`
- ❌ `GIT_MERGE_INSTRUCTIONS.md`
- ❌ `RUN_GIT_COMMANDS.sh`

## 📋 チェックリスト

- ✅ プロジェクト構造を明確にしました
- ✅ Git merge テンポラリファイルを削除しました
- ✅ `.gitignore` で不要なファイルを無視
- ✅ 各プロジェクトのビルド設定は独立

## 🔗 参考リンク

- [root README](./README.md)
- [開発ガイドライン](./AGENTS.md)
- [ロードマップ](./plans.md)
