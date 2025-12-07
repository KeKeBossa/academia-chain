# i18n 文字列管理ガイド

## 📋 概要

このプロジェクトは `i18next` を使用して、すべてのUI文字列を JSON ファイルで一元管理しています。

## 🗂️ ファイル構造

```
src/
├── locales/
│   └── ja.json          ← 日本語文字列定義（すべてのUIテキスト）
├── i18n.ts              ← i18next 初期化ファイル
└── components/
    └── *.tsx            ← useTranslation hook で参照
```

## 🚀 使い方

### 1. **コンポーネントで useTranslation hook を使用**

```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('dashboard.title')}</h1>;
}
```

### 2. **JSON から文字列を参照**

`ja.json` の構造に従ってキーを指定します：

```json
{
  "dashboard": {
    "title": "ダッシュボード",
    "latestPapers": "最新の研究論文"
  }
}
```

→ `t('dashboard.title')` で `"ダッシュボード"` が取得できます

### 3. **パラメータ付き文字列**

動的な値を挿入する場合：

```json
{
  "dashboard": {
    "newPaperPublished": "新しい論文「{{title}}」を公開しました"
  }
}
```

```tsx
{t('dashboard.newPaperPublished', { title: paper.title })}
```

## 📝 新しい文字列を追加する手順

1. `src/locales/ja.json` を開く
2. 適切なカテゴリ配下に新しいキー・バリューを追加
3. コンポーネントで `t('category.key')` で参照

**例：**

```json
{
  "myNewFeature": {
    "buttonLabel": "新機能ボタン",
    "message": "これは新機能です"
  }
}
```

```tsx
<button>{t('myNewFeature.buttonLabel')}</button>
<p>{t('myNewFeature.message')}</p>
```

## 🌍 将来：多言語対応

英語対応を追加する場合：

1. `src/locales/en.json` を作成
2. `src/i18n.ts` に en リソースを追加
3. 言語切り替え機能を実装

```tsx
i18n.changeLanguage('en'); // 英語に切り替え
```

## ✅ チェックリスト

- [x] i18next と react-i18next をインストール
- [x] `src/locales/ja.json` に全文字列を定義
- [x] `src/i18n.ts` を初期化
- [x] `src/main.tsx` に i18n をインポート
- [ ] すべてのコンポーネントで `useTranslation` を使用に変更
- [ ] JSON の新しい言語ファイルを追加（en.json など）

## 💡 ベストプラクティス

1. **日本語はコンポーネントに書かない** → JSON に定義
2. **ネストは2〜3レベルまで** → 見やすさのため
3. **キー名は明確に** → 後で見やすい名前を付ける
4. **パラメータは {{}} で囲む** → 置き換え対象を明確に

## 🔗 参考資料

- [i18next 公式ドキュメント](https://www.i18next.com/)
- [react-i18next 公式ドキュメント](https://react.i18next.com/)
