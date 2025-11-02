# Storacha CLI セットアップ手順

最終更新: 2025-10-21

この手順書では Storacha CLI (`@storacha/cli`) を利用して Space・署名鍵・委譲 UCAN を発行し、リポジトリの `STORACHA_*` 環境変数および Secrets Manager に登録するまでの流れをまとめます。

## 事前準備

- Node.js 18.17 以上
- リポジトリ直下で `npm install` 済み
- Storacha CLI のインストール

```bash
npm install -g @storacha/cli
storacha --help
```

## 1. 自動化ルート（推奨）

`scripts/storacha-bootstrap.ts` が CLI 呼び出しと Secrets 登録をまとめて実行します。

```bash
npm run storacha:bootstrap -- --env .env --json tmp/storacha.json --github-env staging
```

- `--env` は `.env` へ安全に追記します。
- `--json` は Secrets Manager へ渡すための JSON バンドルを保存します。
- `--github-env` / `--aws-secret` を追加すると対応コマンドを標準出力に出します。
- 実環境の資格情報が未準備でも、`--dry-run` を付与するとランダムなテスト値を生成します（例: `npm run storacha:bootstrap -- --dry-run --env .env`）。

このステップで Space・鍵・委譲 UCAN が発行され、続く検証 (`npm run verify:staging`) へ進めます。

## 2. 手動ルート（参考）

CLI の挙動を確認しながら進めたい場合は以下で個別に値を取得できます。

### 2.1 Space を作成

```bash
storacha space create --json > tmp/space.json
```

- 出力例には `did`, `proof` が含まれます。
- `did` を `STORACHA_SPACE_DID` として使用します。

## 2. 署名鍵を発行

```bash
storacha key create --json > tmp/key.json
```

- `key` フィールド（Base64）を `STORACHA_PRINCIPAL` に設定します。

## 3. アップロード権限を委譲

```bash
storacha delegation create $(jq -r '.did' tmp/space.json) \\
  -c space/blob/add -c space/index/add -c filecoin/offer -c upload/add --base64 \\
  > tmp/proof.txt
```

- 出力 1 行の Base64 テキストを `STORACHA_PROOF` に設定します。

## 4. Secrets を登録

リポジトリには自動化スクリプト `scripts/storacha-secrets.ts` を追加しました。CLIから得た値を渡すと、`.env` の更新・GitHub Actions Secrets・AWS Secrets Manager コマンドをまとめて生成できます。`storacha:bootstrap` を利用しない場合はこちらを実行します。

### 4.1 .env を更新

```bash
npx ts-node scripts/storacha-secrets.ts \\
  --principal $(jq -r '.key' tmp/key.json) \\
  --proof $(cat tmp/proof.txt) \\
  --space $(jq -r '.did' tmp/space.json) \\
  --env .env
```

### 4.2 GitHub Environments へ登録

```bash
npx ts-node scripts/storacha-secrets.ts \\
  --principal $(jq -r '.key' tmp/key.json) \\
  --proof $(cat tmp/proof.txt) \\
  --space $(jq -r '.did' tmp/space.json) \\
  --github-env staging
```

- 表示される `gh secret set ...` コマンドを実行してください。

### 4.3 AWS Secrets Manager へ登録

```bash
npx ts-node scripts/storacha-secrets.ts \\
  --principal $(jq -r '.key' tmp/key.json) \\
  --proof $(cat tmp/proof.txt) \\
  --space $(jq -r '.did' tmp/space.json) \\
  --aws-secret academic-repository/storacha
```

- 表示された `aws secretsmanager put-secret-value` コマンドを実行します。

## 5. 検証

### 5.1 ローカル .env

```bash
rg 'STORACHA_' .env
```

### 5.2 `npm run verify:staging:record`

Storacha 変数を含む `.env` が整ったら、以下で検証とログ取得を同時に行います。

```bash
STAGING_MODE=local npm run verify:staging:record
```

- CLI や RPC へアクセスできない検証環境では `STAGING_MODE=dry-run npm run verify:staging:record` で形式チェックのみ実行できます。
- `logs/verify-staging/<timestamp>.log` に出力が保存されるため、監査ログとして保管できます。
- 実 RPC を使う場合は `.env` の `ARTIFACT_REGISTRY_RPC_URL` / `CREDENTIAL_ANCHOR_RPC_URL` を本番値に設定してください。

## 後片付け

- `tmp/` 以下の生成ファイルは不要になったら `shred` などで安全に削除してください。
- 秘密鍵・委譲文字列はバージョン管理しないこと。
