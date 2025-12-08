#!/bin/bash

# 本番環境デプロイ準備スクリプト
# 使用方法: chmod +x deploy-prep.sh && ./deploy-prep.sh

set -e

echo "🚀 本番環境デプロイ準備を開始します..."
echo ""

# カラー設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ステップ1: 環境変数ファイルの確認
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ステップ 1/6: 環境変数ファイルの確認"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f .env.production ]; then
  echo -e "${YELLOW}⚠️  .env.production が見つかりません${NC}"
  echo "テンプレートからコピーしますか? (y/n)"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    cp .env.production.example .env.production
    echo -e "${GREEN}✅ .env.production を作成しました${NC}"
    echo -e "${YELLOW}⚠️  .env.production を編集して必要な環境変数を設定してください${NC}"
    echo "編集完了後、このスクリプトを再実行してください。"
    exit 0
  else
    echo -e "${RED}❌ .env.production が必要です${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ .env.production が存在します${NC}"
fi

# 必須環境変数のチェック
echo ""
echo "必須環境変数をチェックしています..."
source .env.production

REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
  "VC_ENCRYPTION_SECRET"
  "POLYGON_AMOY_RPC_URL"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${RED}❌ 以下の環境変数が設定されていません:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  echo ""
  echo ".env.production を編集して、これらの変数を設定してください。"
  exit 1
else
  echo -e "${GREEN}✅ すべての必須環境変数が設定されています${NC}"
fi

# ステップ2: 依存関係のインストール
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ステップ 2/6: 依存関係のインストール"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm ci
echo -e "${GREEN}✅ 依存関係をインストールしました${NC}"

# ステップ3: Lintチェック
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ステップ 3/6: Lint チェック"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npm run lint; then
  echo -e "${GREEN}✅ Lint チェックが成功しました${NC}"
else
  echo -e "${RED}❌ Lint エラーがあります。修正してから再実行してください。${NC}"
  exit 1
fi

# ステップ4: スマートコントラクトのコンパイルとテスト
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ステップ 4/6: スマートコントラクト"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "コンパイル中..."
if npm run compile; then
  echo -e "${GREEN}✅ コンパイルが成功しました${NC}"
else
  echo -e "${RED}❌ コンパイルエラーがあります${NC}"
  exit 1
fi

echo ""
echo "テスト実行中..."
if npm run test; then
  echo -e "${GREEN}✅ すべてのテストが成功しました${NC}"
else
  echo -e "${RED}❌ テストが失敗しました${NC}"
  exit 1
fi

# ステップ5: Prisma の準備
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ステップ 5/6: Prisma Client 生成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run prisma:generate
echo -e "${GREEN}✅ Prisma Client を生成しました${NC}"

# ステップ6: ビルドテスト
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ステップ 6/6: 本番ビルドテスト"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npm run build; then
  echo -e "${GREEN}✅ ビルドが成功しました${NC}"
else
  echo -e "${RED}❌ ビルドエラーがあります${NC}"
  exit 1
fi

# 完了メッセージ
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 デプロイ準備が完了しました！${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "次のステップ:"
echo ""
echo "【Vercel へデプロイ】"
echo "  1. Vercel CLI をインストール: npm i -g vercel"
echo "  2. デプロイ実行: vercel --prod"
echo ""
echo "【GitHub Actions で自動デプロイ】"
echo "  1. GitHub Secrets に環境変数を設定"
echo "  2. main ブランチへプッシュ"
echo ""
echo "詳細は docs/DEPLOYMENT.md を参照してください。"
echo ""
