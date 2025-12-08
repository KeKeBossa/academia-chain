# 本番環境デプロイガイド

## 📋 事前準備チェックリスト

### 1. 外部サービスのアカウント作成

#### 必須サービス
- [ ] **Vercel アカウント** - https://vercel.com
- [ ] **Alchemy アカウント** - https://www.alchemy.com (RPC プロバイダー)
- [ ] **WalletConnect プロジェクト** - https://cloud.walletconnect.com
- [ ] **PostgreSQL ホスティング** (いずれか)
  - [ ] Supabase - https://supabase.com (推奨)
  - [ ] Neon - https://neon.tech
  - [ ] Railway - https://railway.app

#### オプションサービス
- [ ] **Storacha (Web3.Storage)** - https://console.storacha.network (IPFS 保存)
- [ ] **Etherscan API** - https://etherscan.io/apis (コントラクト検証用)
- [ ] **Polygonscan API** - https://polygonscan.com/apis

### 2. 環境変数の準備

```bash
# .env.production.example をコピー
cp .env.production.example .env.production

# 暗号化シークレットを生成
openssl rand -base64 32
# → VC_ENCRYPTION_SECRET に設定
```

#### 必須環境変数の取得方法

**Alchemy (RPC URL)**
1. https://www.alchemy.com でアカウント作成
2. "Create App" → Network: Polygon Amoy / Ethereum Sepolia
3. "API Key" をコピー
4. URL形式: `https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY`

**WalletConnect**
1. https://cloud.walletconnect.com でプロジェクト作成
2. Project ID をコピー
3. `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` に設定

**Supabase (Database)**
1. https://supabase.com で新規プロジェクト作成
2. Settings → Database → Connection string (Pooler) をコピー
3. `DATABASE_URL` に設定

---

## 🚀 デプロイ手順

### オプション A: Vercel (推奨)

#### Next.js アプリ (ルートプロジェクト)

```bash
# 1. Vercel CLI インストール
npm i -g vercel

# 2. プロジェクトリンク
vercel link

# 3. 環境変数を設定 (Vercel Dashboard または CLI)
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production
vercel env add VC_ENCRYPTION_SECRET production
# ... 他の環境変数も同様に追加

# 4. 本番デプロイ
vercel --prod
```

**Vercel Dashboard での環境変数設定**
1. https://vercel.com/dashboard → プロジェクト選択
2. Settings → Environment Variables
3. `.env.production.example` の全変数を追加
4. Redeploy

#### Vite UI (academic-chain)

```bash
cd academic-chain

# Vercel にデプロイ
vercel --prod

# または GitHub 連携で自動デプロイ
# 1. GitHub リポジトリにプッシュ
# 2. Vercel で "Import Project"
# 3. Root Directory: academic-chain
```

---

### オプション B: Railway (Docker + Database 統合)

```bash
# Railway CLI インストール
npm i -g @railway/cli

# ログイン
railway login

# プロジェクト初期化
railway init

# PostgreSQL 追加
railway add postgresql

# 環境変数設定
railway variables set NODE_ENV=production
railway variables set VC_ENCRYPTION_SECRET=your-secret

# デプロイ
railway up
```

---

## 🔒 スマートコントラクトのデプロイ

### 1. テストネットへのデプロイ (Polygon Amoy)

```bash
# コンパイル
npm run compile

# テスト実行
npm run test

# デプロイ
npx hardhat ignition deploy ignition/modules/AcademicRepository.ts --network polygonAmoy

# デプロイ結果のアドレスをメモ
# → .env.production の ARTIFACT_REGISTRY_ADDRESS などに設定
```

### 2. コントラクトの検証 (Etherscan)

```bash
# Polygonscan で検証
npx hardhat verify --network polygonAmoy DEPLOYED_CONTRACT_ADDRESS

# 検証成功後、ブロックエクスプローラーでコントラクトが確認可能
```

---

## 📊 データベースのセットアップ

### Prisma マイグレーション (本番環境)

```bash
# 本番 DATABASE_URL を設定後

# Prisma Client 生成
npm run prisma:generate

# マイグレーション実行 (初回のみ)
npx prisma migrate deploy

# Prisma Studio で確認
npx prisma studio
```

**⚠️ 注意**: `prisma migrate dev` は開発環境専用。本番では `migrate deploy` を使用。

---

## ✅ デプロイ後の確認事項

### アプリケーション動作確認

- [ ] トップページが正常に表示される
- [ ] ウォレット接続ができる (MetaMask / RainbowKit)
- [ ] データベース接続が成功している
- [ ] IPFS へのアップロードが機能する (Storacha)
- [ ] DAO 投票機能が動作する

### パフォーマンステスト

```bash
# Lighthouse でスコア確認
npx lighthouse https://your-domain.com --view

# 目標スコア
# Performance: 90+
# Accessibility: 95+
# Best Practices: 90+
# SEO: 90+
```

### セキュリティチェック

- [ ] 環境変数が正しく設定されている
- [ ] API エンドポイントにレート制限が適用されている
- [ ] HTTPS が有効
- [ ] CORS 設定が適切
- [ ] 秘密鍵が GitHub にプッシュされていない

---

## 🔄 継続的デプロイ (CI/CD)

### GitHub Actions 設定例

`.github/workflows/deploy.yml` を作成:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test
        
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: ${{ secrets.WALLETCONNECT_PROJECT_ID }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🌐 独自ドメインの設定（オプション）

### ドメイン取得は必須？

**いいえ、必須ではありません。** Vercel が自動的に `your-project.vercel.app` のような無料ドメインを提供します。

- ✅ HTTPS 対応（SSL 証明書自動）
- ✅ グローバル CDN で高速配信
- ✅ 設定不要で即座に利用可能

### 独自ドメインが必要な場合

以下のケースでのみ検討してください：

- **ブランディング重視**: `academia-chain.com` のような独自URL
- **エンタープライズ利用**: 企業・研究機関の公式プラットフォーム
- **SEO最適化**: ブランド名での検索流入を強化

### 独自ドメイン設定手順

#### 1. ドメインを取得

```
推奨レジストラ:
- Cloudflare Registrar (最安値、管理費なし)
- Google Domains
- お名前.com
```

#### 2. Vercel で設定

```bash
# Vercel Dashboard で設定
1. Project Settings → Domains
2. "Add Domain" をクリック
3. 取得したドメイン名を入力 (例: academia-chain.com)
4. DNS レコードを追加（Vercel が指示を表示）
```

#### 3. DNS レコード追加（レジストラ側）

Vercel が指示する以下のレコードを追加：

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### 4. 確認

通常 24〜48 時間以内に反映されます。

```bash
# DNS 伝播を確認
nslookup your-domain.com
```

---

## 🐛 トラブルシューティング

### ビルドエラー

```bash
# キャッシュクリア
rm -rf .next node_modules
npm install
npm run build
```

### データベース接続エラー

```bash
# 接続文字列の確認
echo $DATABASE_URL

# Prisma でテスト
npx prisma db push --skip-generate
```

### 環境変数が反映されない

- Vercel: Redeploy が必要
- Railway: `railway up` で再デプロイ

### 独自ドメインが反映されない

```bash
# DNS 伝播状況を確認
dig your-domain.com
nslookup your-domain.com

# Vercel の設定を再確認
# Project Settings → Domains で Status を確認
```

---

## 📞 サポート

問題が解決しない場合:

1. GitHub Issues: https://github.com/KeKeBossa/academia-chain/issues
2. プロジェクトドキュメント: `README.md`, `plans.md`
3. Vercel サポート: https://vercel.com/support
